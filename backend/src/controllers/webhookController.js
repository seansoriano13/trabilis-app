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

  // Use inquiry_reference for visa payments, booking_reference for others
  const reference =
    type === 'visa_inquiry_payment' ? inquiry_reference : booking_reference

  console.log(
    `🔍 WEBHOOK DEBUG - Processing ${
      type || product_type
    } payment: ${reference}`
  )
  console.log(`🔍 WEBHOOK DEBUG - Session metadata:`, session.metadata)
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
  } else if (type === 'tour_booking_payment') {
    // ===== TOUR LOGIC =====
    const { data, error } = await supabase
      .from('tour_bookings')
      .update({ status: 'CONFIRMED' })
      .eq('booking_reference', booking_reference)
      .eq('status', 'PENDING_PAYMENT')
      .select('id, status')

    if (error) {
      throw new Error(`Database update error: ${error.message}`)
    }

    if (data && data.length > 0) {
      console.log(
        `✅ Database updated for tour booking ${booking_reference}. Status is now CONFIRMED.`
      )

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

      // Send confirmation email (non-blocking)
      sendTourConfirmationEmail(booking_reference)
        .then(() =>
          console.log(
            `✅ Tour confirmation email sent for ${booking_reference}`
          )
        )
        .catch((emailError) =>
          console.error(
            `Failed to send tour confirmation email for ${booking_reference}:`,
            emailError
          )
        )

      // Send real-time notification (non-blocking)
      try {
        const pusher = new Pusher({
          appId: process.env.PUSHER_APP_ID,
          key: process.env.PUSHER_APP_KEY,
          secret: process.env.PUSHER_APP_SECRET,
          cluster: process.env.PUSHER_APP_CLUSTER,
          useTLS: true,
        })

        const { error: insertError } = await supabase
          .from('admin_notifications')
          .insert([
            {
              type: 'new_tour_booking',
              message: `Tour booking confirmed: ${booking_reference}`,
              booking_reference: booking_reference,
              pnr: null,
              booking_type: 'tour',
              category: 'booking',
              priority: 'medium',
              action_url: `/admin/tours/${bookingDetails.id}`,
              created_at: new Date().toISOString(),
            },
          ])

        if (insertError) {
          console.error(
            'Supabase insert error (tour booking):',
            insertError.message
          )
        }

        await pusher.trigger('admin-notifications', 'new-booking', {
          bookingReference: booking_reference,
          pnr: null,
        })
        console.log(
          '✅ Pusher notification sent successfully for tour booking:',
          booking_reference
        )
      } catch (notifyErr) {
        console.error('❌ Failed to send tour booking notification:', notifyErr)
        // Don't fail the webhook - email is not critical for payment processing
      }
    } else {
      console.log(
        `⚠️ Webhook received for tour booking ${booking_reference}, but no update was made (already processed or not found).`
      )
    }
  } else {
    // ===== FLIGHT LOGIC (REFACTORED) =====
    // Get booking data from booking_requests table
    const { data: bookingRequest, error: requestError } = await supabase
      .from('booking_requests')
      .select('*')
      .eq('booking_reference', booking_reference)
      .eq('status', 'PENDING_PAYMENT')
      .single()

    if (requestError || !bookingRequest) {
      console.log(
        `⚠️ No pending booking request found for ${booking_reference}`
      )
      return res.sendStatus(200)
    }

    // Create the actual flight booking record from booking_requests data
    const { data: bookingData, error: bookingError } = await supabase
      .from('flight_bookings')
      .insert({
        booking_reference: booking_reference,
        status: 'PAID_PENDING_BOOKING',
        amadeus_flight_offer: bookingRequest.amadeus_flight_offer,
        passenger_details: bookingRequest.passenger_details,
        total_amount: bookingRequest.total_amount,
        currency: bookingRequest.currency,
        search_criteria: bookingRequest.search_criteria,
        stripe_checkout_id: session.id,
        e_ticket_numbers: null,
        amadeus_order_id: null,
        ticketing_deadline: null,
        ticketed_at: null,
        cancelled_at: null,
        cancellation_reason: null,
        amadeus_cancellation_status: 'NOT_APPLICABLE',
      })
      .select()
      .single()

    if (bookingError) {
      throw new Error(`Flight booking creation error: ${bookingError.message}`)
    }

    // Update booking request status to PAID
    const { error: updateRequestError } = await supabase
      .from('booking_requests')
      .update({ status: 'PAID' })
      .eq('booking_reference', booking_reference)

    if (updateRequestError) {
      console.warn(
        `Failed to update booking request status: ${updateRequestError.message}`
      )
    }

    if (bookingData) {
      console.log(
        `✅ Flight booking created for ${booking_reference}. Status is PAID_PENDING_BOOKING.`
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

        const { error: insertError } = await supabase
          .from('admin_notifications')
          .insert([
            {
              type: 'payment_confirmed',
              message: `Payment confirmed for booking ${booking_reference}. Creating Amadeus order...`,
              booking_reference: booking_reference,
              created_at: new Date().toISOString(),
            },
          ])

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

      // 🚀 NEW: Create Amadeus order asynchronously (this is the key change!)
      // Store booking ID for tracking
      const bookingId = bookingData.id

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
