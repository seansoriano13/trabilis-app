import stripe from '../config/stripe.js'
import { supabase, supabaseAdmin } from '../config/supabaseClient.js'
import { query } from '../config/db.js'
import { createAmadeusOrder } from '../services/createAmadeusOrderService.js'
import { autoAssignBooking } from '../services/assignmentService.js'
import { sendVisaProcessingStartedEmail } from '../services/brevoEmailService.js'
import Pusher from 'pusher'
import {
  sendTourConfirmationEmail,
  generateFlightItineraryPDF,
} from '../services/brevoEmailService.js'
import { v4 as uuidv4 } from 'uuid'
import { insertAdminNotification } from '../database/supabaseService.js'

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (error) {
    console.log(`❌ Webhook signature verification failed:`, error.message)
    return res.sendStatus(400)
  }

  // Only handle checkout session completed events
  if (event.type !== 'checkout.session.completed') {
    console.log(`Received unhandled event type: ${event.type}`)
    return res.sendStatus(200)
  }

  const session = event.data.object
  let { booking_reference, inquiry_reference, product_type, type } =
    session.metadata || {}
  product_type = product_type || 'FLIGHT'

  // Validate metadata exists
  if (!session.metadata) {
    console.error(
      `❌ Webhook received with no metadata. Session ID: ${session.id}, Payment status: ${session.payment_status}`
    )
    return res.sendStatus(200) // Acknowledge to prevent retries
  }

  // Use inquiry_reference for visa payments, booking_reference for others
  const reference =
    type === 'visa_inquiry_payment' ? inquiry_reference : booking_reference

  // Validate booking_reference exists for non-visa payments
  if (type !== 'visa_inquiry_payment' && !booking_reference) {
    console.error(
      `❌ Webhook received with missing booking_reference. Session ID: ${session.id}, Metadata:`,
      session.metadata
    )
    return res.sendStatus(200) // Acknowledge to prevent retries
  }

  console.log(
    `🔍 WEBHOOK DEBUG - Processing ${
      type || product_type
    } payment: ${reference}`
  )
  console.log(`🔍 WEBHOOK DEBUG - Session metadata:`, session.metadata)
  console.log(`🔍 WEBHOOK DEBUG - Session ID: ${session.id}`)
  console.log(
    `🔍 WEBHOOK DEBUG - Payment amount: ${session.amount_total} ${session.currency}`
  )

  // Handle visa inquiry payment
  if (type === 'visa_inquiry_payment') {
    try {
      // First, fetch the inquiry details
      const { data: inquiryData, error: fetchError } = await supabase
        .from('visa_inquiries')
        .select('*')
        .eq('inquiry_reference', inquiry_reference)
        .eq('conversion_status', 'AWAITING_PAYMENT')
        .single()

      if (fetchError || !inquiryData) {
        console.log(
          `⚠️ Webhook received for visa inquiry ${inquiry_reference}, but inquiry not found or already processed.`
        )
        return res.sendStatus(200) // Still acknowledge the webhook
      }

      // Generate a processing reference (using same format as inquiry)
      const processingReference = `TRB-VISA-PROC-${
        inquiry_reference.split('TRB-VISA-')[1]
      }`

      // Create visa processing record
      const { data: processingData, error: processingError } = await supabase
        .from('visa_processings')
        .insert({
          source_type: 'VISA_INQUIRY',
          passenger_name: inquiryData.full_name,
          passenger_email: inquiryData.email_address,
          country: inquiryData.destination,
          visa_type: inquiryData.visa_type,
          status: 'PENDING',
          requirements_status: {},
          notes: inquiryData.message || '',
          processing_reference: processingReference,
          passenger_index: 0, // Required field, set to 0 for visa inquiry processings
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (processingError) {
        throw new Error(
          `Failed to create processing record: ${processingError.message}`
        )
      }

      console.log(
        `✅ Created visa processing ${processingReference} with ID ${processingData.id}`
      )

      // Update inquiry with conversion info
      const { data, error } = await supabase
        .from('visa_inquiries')
        .update({
          conversion_status: 'CONVERTED',
          stripe_checkout_id: session.id,
          converted_to_processing_id: processingData.id,
        })
        .eq('inquiry_reference', inquiry_reference)
        .eq('conversion_status', 'AWAITING_PAYMENT')
        .select('id, conversion_status')

      if (error) {
        throw new Error(`Database update error: ${error.message}`)
      }

      if (data && data.length > 0) {
        console.log(
          `✅ Database updated for visa inquiry ${inquiry_reference}. Status is now CONVERTED. Linked to processing ID ${processingData.id}`
        )

        // Auto-assign processing to visa staff
        try {
          const assignmentResult = await autoAssignBooking(
            'visa',
            processingData.id
          )
          if (assignmentResult.success) {
            console.log(
              `Visa processing ${processingData.id} auto-assigned to ${assignmentResult.assignedStaff.name}`
            )
          } else {
            console.warn(
              `Could not auto-assign visa processing ${processingData.id}:`,
              assignmentResult.message
            )
          }
        } catch (autoAssignError) {
          console.error(
            'Auto-assignment failed for visa processing:',
            autoAssignError
          )
          // Don't fail the webhook - assignment is not critical
        }

        // Send visa processing started email
        try {
          await sendVisaProcessingStartedEmail({
            processingReference: processingReference,
            inquiryReference: inquiryData.inquiry_reference,
            full_name: inquiryData.full_name,
            email_address: inquiryData.email_address,
            visa_type: inquiryData.visa_type,
            destination: inquiryData.destination,
          })
          console.log(
            `✅ Visa processing started email sent for ${inquiry_reference}`
          )
        } catch (emailError) {
          console.error(
            `Failed to send visa processing started email for ${inquiry_reference}:`,
            emailError
          )
          // Don't fail the webhook - email is not critical for payment processing
        }
      } else {
        console.log(
          `⚠️ Webhook received for visa inquiry ${inquiry_reference}, but no update was made (already processed or not found).`
        )
      }
    } catch (err) {
      console.error(
        `❌ Error while processing visa inquiry webhook for ${inquiry_reference}:`,
        err
      )
      return res.sendStatus(500)
    }
  } else if (product_type === 'TOUR' || type === 'tour_booking_payment') {
    // ===== TOUR LOGIC =====
    const { data, error } = await supabase
      .from('tour_bookings')
      .update({ status: 'CONFIRMED' })
      .eq('booking_reference', booking_reference)
      .eq('status', 'PENDING_PAYMENT')
      .select('id, status, package_date_id, passenger_count')

    if (error) {
      throw new Error(`Database update error: ${error.message}`)
    }

    if (data && data.length > 0) {
      console.log(
        `✅ Database updated for tour booking ${booking_reference}. Status is now CONFIRMED.`
      )

      // Decrement available slots when payment is confirmed
      try {
        const booking = data[0]
        if (booking.package_date_id && booking.passenger_count) {
          // Use atomic decrement to prevent race conditions
          const { data: packageDate, error: fetchError } = await supabase
            .from('package_dates')
            .select('available_slots')
            .eq('id', booking.package_date_id)
            .single()

          if (fetchError) {
            console.error(
              `Error fetching package date for slot decrement: ${fetchError.message}`
            )
          } else if (packageDate) {
            const newSlots = Math.max(
              0,
              packageDate.available_slots - booking.passenger_count
            )
            const { error: updateError } = await supabase
              .from('package_dates')
              .update({ available_slots: newSlots })
              .eq('id', booking.package_date_id)

            if (updateError) {
              console.error(
                `Error decrementing available slots: ${updateError.message}`
              )
            } else {
              console.log(
                `✅ Decremented ${booking.passenger_count} slots for package_date_id ${booking.package_date_id}. New available slots: ${newSlots}`
              )
            }
          }
        }
      } catch (slotError) {
        console.error('Error in slot decrement process:', slotError)
        // Don't fail the webhook - slot management error is logged but doesn't block payment confirmation
      }

      // Auto-assign booking to accounting staff
      try {
        const assignmentResult = await autoAssignBooking('tour', data[0].id)
        if (assignmentResult.success) {
          console.log(
            `Tour booking ${data[0].id} auto-assigned to ${assignmentResult.assignedStaff.name}`
          )
        } else {
          console.warn(
            `Failed to auto-assign tour booking ${data[0].id}:`,
            assignmentResult.error
          )
        }
      } catch (assignmentError) {
        console.error('Auto-assignment error:', assignmentError)
        // Don't fail the booking creation if auto-assignment fails
      }

      // Send confirmation email (non-blocking with enhanced error handling)
      sendTourConfirmationEmail(booking_reference)
        .then(() =>
          console.log(
            `✅ Tour confirmation email sent for ${booking_reference}`
          )
        )
        .catch((emailError) => {
          console.error(
            `❌ Failed to send tour confirmation email for ${booking_reference}:`,
            emailError
          )
          console.error('Email error details:', {
            message: emailError.message,
            stack: emailError.stack,
            booking_reference,
            timestamp: new Date().toISOString(),
          })
          // TODO: Consider adding to retry queue or notification system
          // For now, error is logged but doesn't block webhook success
        })

      // Send real-time notification (non-blocking)
      try {
        console.log(
          `🔔 Creating admin notification for tour booking ${booking_reference}`
        )

        const pusher = new Pusher({
          appId: process.env.PUSHER_APP_ID,
          key: process.env.PUSHER_APP_KEY,
          secret: process.env.PUSHER_APP_SECRET,
          cluster: process.env.PUSHER_APP_CLUSTER,
          useTLS: true,
        })

        const { error: insertError } = await insertAdminNotification({
          type: 'new_tour_booking',
          event_type: 'new_tour_booking', // Required field for database
          message: `Tour booking confirmed: ${booking_reference}`,
          booking_reference: booking_reference,
          pnr: null,
          booking_type: 'tour',
          category: 'booking',
          priority: 'medium',
          action_url: `/admin/tours/${data[0].id}`,
          created_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error(
            '❌ Supabase insert error (tour booking):',
            insertError.message
          )
          console.error('Notification payload:', {
            type: 'new_tour_booking',
            booking_reference,
            booking_id: data[0].id,
          })
        } else {
          console.log(
            `✅ Admin notification created for tour booking ${booking_reference}`
          )
        }

        try {
          await pusher.trigger('admin-notifications', 'new-booking', {
            bookingReference: booking_reference,
            pnr: null,
          })
          console.log(
            '✅ Pusher notification sent successfully for tour booking:',
            booking_reference
          )
        } catch (pusherError) {
          console.error(
            '❌ Failed to send Pusher notification for tour booking:',
            pusherError.message
          )
        }
      } catch (notifyErr) {
        console.error('❌ Failed to send tour booking notification:', notifyErr)
        // Don't fail the webhook - email is not critical for payment processing
      }
    } else {
      // Check if booking exists to determine the reason
      const { data: existingBooking, error: checkError } = await supabase
        .from('tour_bookings')
        .select('id, status, booking_reference')
        .eq('booking_reference', booking_reference)
        .single()

      if (checkError || !existingBooking) {
        console.error(
          `❌ Webhook received for tour booking ${booking_reference}, but booking does not exist in database!`
        )
      } else if (existingBooking.status === 'CONFIRMED') {
        console.log(
          `ℹ️ Webhook received for tour booking ${booking_reference}, but booking is already CONFIRMED (idempotency - safe to ignore).`
        )
      } else {
        console.warn(
          `⚠️ Webhook received for tour booking ${booking_reference}, but booking status is ${existingBooking.status} (expected PENDING_PAYMENT). Update was skipped.`
        )
      }
    }
  } else {
    // ===== FLIGHT LOGIC (SIMPLIFIED - NO BOOKING_REQUESTS) =====
    // First, check current booking status
    const { data: existingBooking, error: checkError } = await supabase
      .from('flight_bookings')
      .select('id, status, booking_reference, stripe_checkout_id')
      .eq('booking_reference', booking_reference)
      .single()

    if (checkError || !existingBooking) {
      console.error(`❌ No flight booking found for ${booking_reference}`)
      console.error(`🔍 DEBUG - Check error:`, checkError?.message)
      console.error(`🔍 DEBUG - Session ID: ${session.id}`)
      console.error(
        `🔍 DEBUG - Session metadata:`,
        JSON.stringify(session.metadata, null, 2)
      )
      console.error(`🔍 DEBUG - Payment status: ${session.payment_status}`)
      console.error(
        `🔍 DEBUG - Session created: ${new Date(
          session.created * 1000
        ).toISOString()}`
      )

      // Try to find any booking with similar reference pattern
      const { data: similarBookings, error: searchError } = await supabase
        .from('flight_bookings')
        .select('booking_reference, status, created_at, stripe_checkout_id')
        .ilike('booking_reference', `%${booking_reference.slice(-8)}%`)
        .limit(5)

      if (!searchError && similarBookings && similarBookings.length > 0) {
        console.error(`🔍 DEBUG - Found similar bookings:`, similarBookings)
      } else {
        console.error(`🔍 DEBUG - No similar bookings found`)
      }

      return res.sendStatus(200) // Acknowledge to prevent retries
    }

    // Handle different booking states
    let bookingData

    if (existingBooking.status === 'PAID_PENDING_BOOKING') {
      // Already paid - trigger Amadeus order creation if not already processing
      // Check if already processing by looking at status (PROCESSING_ORDER would be caught above)
      console.log(
        `ℹ️ Webhook received for flight booking ${booking_reference}, booking is already PAID_PENDING_BOOKING. Triggering Amadeus order creation...`
      )
      // Fetch full booking data
      const { data: fullBooking, error: fetchError } = await supabase
        .from('flight_bookings')
        .select('*')
        .eq('booking_reference', booking_reference)
        .single()

      if (fetchError || !fullBooking) {
        console.error(
          `❌ Failed to fetch booking data for ${booking_reference}:`,
          fetchError?.message
        )
        return res.sendStatus(500)
      }
      bookingData = fullBooking
    } else if (existingBooking.status === 'PROCESSING_ORDER') {
      console.log(
        `ℹ️ Webhook received for flight booking ${booking_reference}, but booking is already PROCESSING_ORDER. Skipping (idempotency).`
      )
      return res.sendStatus(200)
    } else if (
      ['TICKETED', 'BOOKING_FAILED', 'TICKETING_FAILED', 'CANCELLED'].includes(
        existingBooking.status
      )
    ) {
      console.log(
        `ℹ️ Webhook received for flight booking ${booking_reference}, but booking is already in terminal state: ${existingBooking.status}. Skipping (idempotency).`
      )
      return res.sendStatus(200)
    } else if (existingBooking.status === 'PENDING_PAYMENT') {
      // Update from PENDING_PAYMENT to PAID_PENDING_BOOKING
      const { data: updatedBooking, error: updateError } = await supabase
        .from('flight_bookings')
        .update({
          status: 'PAID_PENDING_BOOKING',
          stripe_checkout_id: session.id,
        })
        .eq('booking_reference', booking_reference)
        .eq('status', 'PENDING_PAYMENT') // Only update if still pending payment
        .select()
        .single()

      if (updateError || !updatedBooking) {
        console.error(
          `❌ Failed to update flight booking ${booking_reference} to PAID_PENDING_BOOKING:`,
          updateError?.message || 'No data returned'
        )
        return res.sendStatus(500)
      }

      console.log(
        `✅ Flight booking ${booking_reference} updated from PENDING_PAYMENT to PAID_PENDING_BOOKING.`
      )
      bookingData = updatedBooking
    } else {
      console.warn(
        `⚠️ Webhook received for flight booking ${booking_reference}, but booking exists with unexpected status: ${existingBooking.status}. Skipping.`
      )
      return res.sendStatus(200)
    }

    if (bookingData) {
      console.log(
        `✅ Flight booking ${booking_reference} ready for Amadeus order creation (status: ${bookingData.status}).`
      )

      // Immediately notify admin that payment succeeded (before Amadeus order creation)
      try {
        const pusher = new Pusher({
          appId: process.env.PUSHER_APP_ID,
          key: process.env.PUSHER_APP_KEY,
          secret: process.env.PUSHER_APP_SECRET,
          cluster: process.env.PUSHER_APP_CLUSTER,
          useTLS: true,
        })

        const { error: insertError } = await insertAdminNotification({
          type: 'payment_confirmed',
          event_type: 'payment_confirmed', // Required field for database
          message: `Payment confirmed for booking ${booking_reference}. Creating Amadeus order...`,
          booking_reference: booking_reference,
          created_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error(
            'Supabase insert error (payment_confirmed):',
            insertError.message
          )
        }

        try {
          await pusher.trigger('admin-notifications', 'payment-confirmed', {
            bookingReference: booking_reference,
            status: 'PAID_PENDING_BOOKING',
            nextStep: 'Creating Amadeus order...',
          })
          console.log(
            '✅ Pusher notification sent successfully for flight booking payment:',
            booking_reference
          )
        } catch (pusherError) {
          console.warn(
            '⚠️ Pusher notification failed (non-critical):',
            pusherError.message
          )
          // Continue processing - this is not a critical failure
        }
      } catch (notifyErr) {
        console.error(
          '❌ Failed to send immediate payment notification:',
          notifyErr
        )
      }

      // 🚀 Create Amadeus order asynchronously
      // Store booking ID for tracking
      const bookingId = bookingData.id

      // Verify booking status is correct before calling createAmadeusOrder
      // Add a small delay to ensure database transaction is committed
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Double-check status before proceeding
      const { data: statusVerify, error: verifyError } = await supabase
        .from('flight_bookings')
        .select('status')
        .eq('booking_reference', booking_reference)
        .single()

      if (verifyError || !statusVerify) {
        console.error(
          `❌ Failed to verify booking status before Amadeus order creation:`,
          verifyError?.message
        )
        return res.sendStatus(500)
      }

      if (statusVerify.status !== 'PAID_PENDING_BOOKING') {
        console.warn(
          `⚠️ Booking ${booking_reference} status is ${statusVerify.status}, not PAID_PENDING_BOOKING. Skipping Amadeus order creation.`
        )
        return res.sendStatus(200)
      }

      // Create Amadeus order asynchronously with proper error tracking
      createAmadeusOrder(booking_reference)
        .then((result) => {
          console.log(
            `[WEBHOOK] ✅ Order creation completed for ${booking_reference}`
          )
        })
        .catch(async (err) => {
          console.error(
            `[WEBHOOK] ❌ CRITICAL ERROR during Amadeus order creation for ${booking_reference}:`,
            err
          )

          // Notify admin of the failure via Pusher
          try {
            const pusher = new Pusher({
              appId: process.env.PUSHER_APP_ID,
              key: process.env.PUSHER_APP_KEY,
              secret: process.env.PUSHER_APP_SECRET,
              cluster: process.env.PUSHER_APP_CLUSTER,
              useTLS: true,
            })

            await pusher.trigger('admin-alerts', 'booking-failed', {
              bookingReference: booking_reference,
              bookingId: bookingId,
              error: err.message,
              needsManualIntervention: true,
            })
          } catch (notifyError) {
            console.error(
              '[WEBHOOK] Failed to send failure notification:',
              notifyError
            )
          }
        })
    } else {
      console.log(
        `⚠️ Webhook received for flight booking ${booking_reference}, but no update was made (already processed or not found).`
      )
    }
  }

  return res.sendStatus(200)
}

// Test endpoint for Flight PDF generation
export const testFlightPDFGeneration = async (req, res) => {
  try {
    const { bookingReference } = req.query

    if (!bookingReference) {
      return res.status(400).json({
        error: 'Booking reference is required',
      })
    }

    // Get booking details
    const { data: booking, error } = await supabase
      .from('flight_bookings')
      .select('*')
      .eq('booking_reference', bookingReference)
      .single()

    if (error || !booking) {
      return res.status(404).json({
        error: 'Booking not found',
      })
    }

    // Generate PDF
    const pdfBuffer = await generateFlightItineraryPDF(booking)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="flight-itinerary-${bookingReference}.pdf"`
    )
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Error generating flight PDF:', error)
    res.status(500).json({
      error: 'Failed to generate PDF',
      message: error.message,
    })
  }
}
