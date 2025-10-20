import { supabase } from '../config/supabaseClient.js'
import {
  amadeus,
  logAmadeusError,
  logAmadeusSuccess,
} from '../config/amadeus.js'
import stripe from '../config/stripe.js'
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  useTLS: true,
})

/**
 * Check if a booking can be cancelled
 */
export function canCancelBooking(booking) {
  // Can't cancel if:
  if (
    booking.status === 'CANCELLED' || // Already cancelled
    booking.status === 'EXPIRED' || // Expired (auto-cancelled by Amadeus)
    booking.status.includes('FAILED') || // Already failed
    booking.status === 'PENDING_TICKETING' // Actually ticketed (needs airline process)
  ) {
    return false
  }

  // Can cancel if:
  // - PENDING_PAYMENT (before order created)
  // - PAID_PENDING_BOOKING (payment received, creating order)
  // - BOOKED (order created, not yet ticketed)
  return ['PENDING_PAYMENT', 'PAID_PENDING_BOOKING', 'BOOKED'].includes(
    booking.status
  )
}

/**
 * Check if booking has departed (for additional validation)
 */
export function hasBookingDeparted(booking) {
  if (
    !booking.amadeus_flight_offer?.itineraries?.[0]?.segments?.[0]?.departure
      ?.at
  ) {
    return false
  }

  const departureTime = new Date(
    booking.amadeus_flight_offer.itineraries[0].segments[0].departure.at
  )
  const now = new Date()

  return departureTime < now
}

/**
 * Cancel a flight booking with Amadeus integration
 */
export async function cancelFlightBooking(
  bookingReference,
  cancellationReason = null,
  cancelledBy = 'client'
) {
  console.log(
    `🚫 Starting cancellation process for booking: ${bookingReference}`
  )

  try {
    // 1. Get booking details
    const { data: booking, error: fetchError } = await supabase
      .from('flight_bookings')
      .select('*')
      .eq('booking_reference', bookingReference)
      .single()

    if (fetchError || !booking) {
      throw new Error(`Booking ${bookingReference} not found`)
    }

    // 2. Validate cancellation eligibility
    if (!canCancelBooking(booking)) {
      const reason = getCancellationBlockReason(booking)
      throw new Error(`Cannot cancel booking: ${reason}`)
    }

    // 3. Check if booking has departed
    if (hasBookingDeparted(booking)) {
      throw new Error('Cannot cancel booking: Flight has already departed')
    }

    // 4. Cancel with Amadeus if order exists and booking is not just pending payment
    let amadeusCancellationResult = {
      success: false,
      status: 'NOT_APPLICABLE',
      error: null,
    }

    if (booking.amadeus_order_id && booking.status !== 'PENDING_PAYMENT') {
      try {
        console.log(
          `[CANCELLATION] Attempting to cancel Amadeus order: ${booking.amadeus_order_id}`
        )

        await amadeus.booking.flightOrder(booking.amadeus_order_id).delete()

        amadeusCancellationResult = {
          success: true,
          status: 'SUCCESS',
          error: null,
        }

        logAmadeusSuccess(
          'booking.flightOrder.delete',
          { orderId: booking.amadeus_order_id },
          {
            bookingReference,
            cancelledBy,
          }
        )

        console.log(
          `[CANCELLATION] ✅ Amadeus order ${booking.amadeus_order_id} cancelled successfully`
        )
      } catch (amadeusError) {
        console.warn(
          `[CANCELLATION] Amadeus cancellation failed for ${bookingReference}:`,
          amadeusError.message
        )

        amadeusCancellationResult = {
          success: false,
          status: 'FAILED',
          error: amadeusError.message,
        }

        logAmadeusError('booking.flightOrder.delete', amadeusError, {
          bookingReference,
          orderId: booking.amadeus_order_id,
          cancelledBy,
        })

        // Continue with database cancellation even if Amadeus fails
        // The booking might have already been cancelled or expired
      }
    } else if (booking.status === 'PENDING_PAYMENT') {
      amadeusCancellationResult = {
        success: true,
        status: 'NOT_APPLICABLE',
        error: null,
      }
      console.log(
        `[CANCELLATION] No Amadeus order to cancel for ${bookingReference} (PENDING_PAYMENT)`
      )
    }

    // 5. Handle refund based on status and policy
    let refundResult = {
      success: false,
      amount: 0,
      reason: 'No refund needed',
      refundId: null,
    }

    if (booking.stripe_checkout_id) {
      if (booking.status === 'PENDING_PAYMENT') {
        // No refund needed - payment not processed yet
        refundResult = {
          success: true,
          amount: 0,
          reason: 'Payment not processed yet',
        }
        console.log(
          `[CANCELLATION] No refund needed for ${bookingReference} - payment not processed`
        )
      } else if (booking.status === 'PAID_PENDING_BOOKING') {
        // Full refund - order not yet created with airline
        try {
          const refund = await stripe.refunds.create({
            payment_intent: booking.stripe_checkout_id,
            amount: Math.round(booking.total_amount * 100),
            metadata: { booking_reference: bookingReference },
          })
          refundResult = {
            success: true,
            amount: booking.total_amount,
            reason: 'Order not yet confirmed with airline',
            refundId: refund.id,
          }
        } catch (refundError) {
          console.error(
            `[CANCELLATION] Refund failed for ${bookingReference}:`,
            refundError
          )
          refundResult = {
            success: false,
            amount: 0,
            reason: `Refund processing failed: ${refundError.message}`,
          }
        }
      } else {
        // BOOKED or later: Non-refundable per policy
        refundResult = {
          success: true,
          amount: 0,
          reason: 'Non-refundable: Booking confirmed with airline',
        }
        console.log(
          `[CANCELLATION] No refund for ${bookingReference} - non-refundable policy applies`
        )
      }
    }

    // 6. Update database status with transaction-like validation
    // First, validate current booking status hasn't changed
    const { data: currentBooking, error: validationError } = await supabase
      .from('flight_bookings')
      .select('status, amadeus_order_id')
      .eq('booking_reference', bookingReference)
      .single()

    if (validationError || !currentBooking) {
      throw new Error('Booking not found or already modified')
    }

    // Check if status changed during cancellation process
    if (currentBooking.status !== booking.status) {
      throw new Error(
        `Booking status changed during cancellation. Please retry.`
      )
    }

    const updateData = {
      status: 'CANCELLED',
      cancelled_at: new Date().toISOString(),
      amadeus_cancellation_status: amadeusCancellationResult.status,
    }

    if (cancellationReason) {
      updateData.cancellation_reason = cancellationReason
    }

    // Now perform the update with status check
    const { error: updateError } = await supabase
      .from('flight_bookings')
      .update(updateData)
      .eq('booking_reference', bookingReference)
      .eq('status', booking.status) // Atomic check: only update if status hasn't changed

    if (updateError) {
      throw new Error(`Database update error: ${updateError.message}`)
    }

    console.log(
      `[CANCELLATION] ✅ Booking ${bookingReference} updated to CANCELLED status`
    )

    // 7. Send admin notification
    try {
      const { error: insertError } = await supabase
        .from('admin_notifications')
        .insert([
          {
            type: 'booking_cancelled',
            message: `Booking cancelled: ${bookingReference} (${cancelledBy})`,
            booking_reference: bookingReference,
            pnr: booking.pnr,
            created_at: new Date().toISOString(),
          },
        ])

      if (insertError) {
        console.error(
          'Supabase insert error (cancellation notification):',
          insertError.message
        )
      }

      await pusher.trigger('admin-notifications', 'booking-cancelled', {
        bookingReference,
        pnr: booking.pnr,
        cancelledBy,
        amadeusStatus: amadeusCancellationResult.status,
        refundAmount: refundResult.amount,
      })

      console.log(
        `[CANCELLATION] ✅ Admin notification sent for ${bookingReference}`
      )
    } catch (notificationError) {
      console.error(
        `[CANCELLATION] Failed to send admin notification for ${bookingReference}:`,
        notificationError
      )
      // Don't fail the whole process for notification errors
    }

    // 8. Return cancellation result
    const result = {
      success: true,
      bookingReference,
      status: 'CANCELLED',
      amadeusCancellation: amadeusCancellationResult,
      refund: refundResult,
      cancelledAt: new Date().toISOString(),
      cancelledBy,
    }

    console.log(
      `[CANCELLATION] ✅ Successfully cancelled booking ${bookingReference}`
    )
    return result
  } catch (error) {
    console.error(
      `[CANCELLATION] ❌ Failed to cancel booking ${bookingReference}:`,
      error.message
    )

    // Try to update status to indicate cancellation attempt failed
    try {
      await supabase
        .from('flight_bookings')
        .update({
          amadeus_cancellation_status: 'FAILED',
          updated_at: new Date().toISOString(),
        })
        .eq('booking_reference', bookingReference)
    } catch (updateError) {
      console.error(
        `[CANCELLATION] Failed to update cancellation status:`,
        updateError
      )
    }

    throw new Error(`Cancellation failed: ${error.message}`)
  }
}

/**
 * Get human-readable reason why booking cannot be cancelled
 */
function getCancellationBlockReason(booking) {
  switch (booking.status) {
    case 'CANCELLED':
      return 'Booking is already cancelled'
    case 'EXPIRED':
      return 'Booking has expired (ticketing deadline passed)'
    case 'PENDING_TICKETING':
      return 'Booking is already ticketed (contact airline for cancellation)'
    case 'BOOKING_FAILED':
      return 'Booking failed and cannot be cancelled'
    case 'TICKETING_FAILED':
      return 'Booking failed during ticketing process'
    default:
      return `Booking status '${booking.status}' does not allow cancellation`
  }
}

/**
 * Get cancellation eligibility info for display
 */
export async function getCancellationInfo(bookingReference) {
  try {
    const { data: booking, error } = await supabase
      .from('flight_bookings')
      .select('*')
      .eq('booking_reference', bookingReference)
      .single()

    if (error || !booking) {
      throw new Error(`Booking ${bookingReference} not found`)
    }

    const canCancel = canCancelBooking(booking)
    const hasDeparted = hasBookingDeparted(booking)
    const blockReason = canCancel ? null : getCancellationBlockReason(booking)

    return {
      canCancel: canCancel && !hasDeparted,
      hasDeparted,
      blockReason: hasDeparted ? 'Flight has already departed' : blockReason,
      status: booking.status,
      totalAmount: booking.total_amount,
      currency: booking.currency,
      departureTime:
        booking.amadeus_flight_offer?.itineraries?.[0]?.segments?.[0]?.departure
          ?.at,
      isNonRefundable: booking.status !== 'PENDING_PAYMENT',
    }
  } catch (error) {
    console.error(
      `[CANCELLATION INFO] Failed to get cancellation info for ${bookingReference}:`,
      error
    )
    throw error
  }
}

/**
 * Cancel multiple bookings (admin function)
 */
export async function cancelMultipleBookings(
  bookingReferences,
  cancellationReason = null,
  cancelledBy = 'admin'
) {
  console.log(
    `[BULK CANCELLATION] Starting bulk cancellation for ${bookingReferences.length} bookings`
  )

  const results = []

  for (const bookingReference of bookingReferences) {
    try {
      const result = await cancelFlightBooking(
        bookingReference,
        cancellationReason,
        cancelledBy
      )
      results.push({
        bookingReference,
        success: true,
        result,
      })
    } catch (error) {
      results.push({
        bookingReference,
        success: false,
        error: error.message,
      })
    }
  }

  const successCount = results.filter((r) => r.success).length
  const failureCount = results.filter((r) => !r.success).length

  console.log(
    `[BULK CANCELLATION] Completed: ${successCount} successful, ${failureCount} failed`
  )

  return {
    total: bookingReferences.length,
    successful: successCount,
    failed: failureCount,
    results,
  }
}
