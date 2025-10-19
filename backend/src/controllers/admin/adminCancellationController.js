import { cancelFlightBooking } from '../../services/cancellationService.js'
import { supabase } from '../../config/supabaseClient.js'
import { sendCancellationConfirmationEmail } from '../../services/brevoEmailService.js'
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  useTLS: true,
})

/**
 * Admin cancellation with double confirmation
 * This will be called from the frontend after double window.confirm
 */
export const adminCancelFlightBooking = async (req, res) => {
  try {
    const { booking_reference, cancellation_reason } = req.body
    const adminId = req.user?.id || 'unknown_admin'

    if (!booking_reference) {
      return res.status(400).json({
        success: false,
        error: 'Booking reference is required',
      })
    }

    console.log(
      `[ADMIN CANCELLATION] Admin ${adminId} requesting cancellation for ${booking_reference}`
    )

    // Get booking details first
    const { data: booking, error: fetchError } = await supabase
      .from('flight_bookings')
      .select('*')
      .eq('booking_reference', booking_reference)
      .single()

    if (fetchError || !booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      })
    }

    // Check if booking can be cancelled
    if (
      ![
        'PENDING_PAYMENT',
        'PAID_PENDING_BOOKING',
        'BOOKED',
        'PENDING_TICKETING',
      ].includes(booking.status)
    ) {
      return res.status(400).json({
        success: false,
        error: `Booking cannot be cancelled. Current status: ${booking.status}`,
      })
    }

    // Perform cancellation
    const cancellationResult = await cancelFlightBooking(
      booking_reference,
      cancellation_reason || 'Cancelled by admin',
      'admin_cancellation'
    )

    // Send confirmation email to customer
    try {
      const primaryTraveler = booking.passenger_details?.travelers?.[0]
      if (primaryTraveler?.contact?.emailAddress) {
        await sendCancellationConfirmationEmail({
          email: primaryTraveler.contact.emailAddress,
          firstName: primaryTraveler.name.firstName || 'Valued Customer',
          lastName: primaryTraveler.name.lastName || '',
          bookingReference: booking_reference,
          totalAmount: booking.total_amount,
          currency: booking.currency,
          cancelledAt: new Date().toISOString(),
        })
        console.log(
          `[ADMIN CANCELLATION] ✅ Confirmation email sent to ${primaryTraveler.contact.emailAddress}`
        )
      }
    } catch (emailError) {
      console.error(
        `[ADMIN CANCELLATION] Failed to send confirmation email:`,
        emailError
      )
      // Don't fail the cancellation for email errors
    }

    // Notify admin via Pusher
    try {
      await pusher.trigger('admin-notifications', 'booking-cancelled', {
        bookingReference: booking_reference,
        message: `Flight booking ${booking_reference} has been cancelled by admin ${adminId}`,
        cancelledBy: adminId,
        cancellationReason: cancellation_reason || 'Cancelled by admin',
      })
      console.log(
        `[ADMIN CANCELLATION] ✅ Pusher notification sent for cancelled booking ${booking_reference}`
      )
    } catch (pusherError) {
      console.error(
        `[ADMIN CANCELLATION] Failed to send Pusher notification:`,
        pusherError
      )
    }

    // Log admin action
    try {
      await supabase.from('admin_notifications').insert([
        {
          type: 'admin_cancellation',
          message: `Admin ${adminId} cancelled booking ${booking_reference}`,
          booking_reference: booking_reference,
          created_at: new Date().toISOString(),
          booking_type: 'flight',
          admin_id: adminId,
          category: 'status',
          priority: 'high',
          action_url: `/admin/flights/${bookingId}`,
        },
      ])
    } catch (logError) {
      console.error(
        `[ADMIN CANCELLATION] Failed to log admin action:`,
        logError
      )
    }

    console.log(
      `[ADMIN CANCELLATION] ✅ Booking ${booking_reference} cancelled successfully by admin ${adminId}`
    )

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        bookingReference: booking_reference,
        cancelledAt: new Date().toISOString(),
        cancelledBy: adminId,
        cancellationReason: cancellation_reason || 'Cancelled by admin',
      },
    })
  } catch (error) {
    console.error(`[ADMIN CANCELLATION] Failed to cancel booking:`, error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel booking',
    })
  }
}

/**
 * Get cancellation status for a booking
 */
export const getCancellationStatus = async (req, res) => {
  try {
    const { booking_reference } = req.params

    const { data: booking, error } = await supabase
      .from('flight_bookings')
      .select(
        'status, cancelled_at, cancellation_reason, amadeus_cancellation_status'
      )
      .eq('booking_reference', booking_reference)
      .single()

    if (error || !booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      })
    }

    const canCancel = [
      'PENDING_PAYMENT',
      'PAID_PENDING_BOOKING',
      'BOOKED',
      'PENDING_TICKETING',
    ].includes(booking.status)

    res.json({
      success: true,
      data: {
        status: booking.status,
        canCancel,
        cancelledAt: booking.cancelled_at,
        cancellationReason: booking.cancellation_reason,
        amadeusCancellationStatus: booking.amadeus_cancellation_status,
      },
    })
  } catch (error) {
    console.error(
      `[ADMIN CANCELLATION] Failed to get cancellation status:`,
      error
    )
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get cancellation status',
    })
  }
}
