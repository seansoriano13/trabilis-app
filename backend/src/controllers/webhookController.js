import stripe from '../config/stripe.js'
import { supabase, supabaseAdmin } from '../config/supabaseClient.js'
import { query } from '../config/db.js'
import { createAmadeusOrder } from '../services/createAmadeusOrderService.js'
import { autoAssignBooking } from '../services/assignmentService.js'
import { sendVisaProcessingStartedEmail } from '../services/brevoEmailService.js'
import Pusher from 'pusher'
import {
  sendTourConfirmationEmail,
  sendConfirmationEmail,
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
    // Get booking details first
    const { data: bookingData, error: fetchError } = await supabase
      .from('tour_bookings')
      .select('id, status, package_date_id, passenger_count')
      .eq('booking_reference', booking_reference)
      .single()

    if (fetchError || !bookingData) {
      console.error(
        `❌ Tour booking ${booking_reference} not found in database!`
      )
      return res.sendStatus(200)
    }

    // Update status to CONFIRMED (simple - no idempotency checks)
    const { error: updateError } = await supabase
      .from('tour_bookings')
      .update({ status: 'CONFIRMED' })
      .eq('booking_reference', booking_reference)

    if (updateError) {
      console.error(
        `❌ Failed to update tour booking status: ${updateError.message}`
      )
      return res.sendStatus(500)
    }

    console.log(`✅ Tour booking ${booking_reference} updated to CONFIRMED`)

    // Decrement available slots
    if (bookingData.package_date_id && bookingData.passenger_count) {
      try {
        const { data: packageDate, error: fetchError } = await supabase
          .from('package_dates')
          .select('available_slots')
          .eq('id', bookingData.package_date_id)
          .single()

        if (!fetchError && packageDate) {
          const newSlots = Math.max(
            0,
            packageDate.available_slots - bookingData.passenger_count
          )
          await supabase
            .from('package_dates')
            .update({ available_slots: newSlots })
            .eq('id', bookingData.package_date_id)
          console.log(
            `✅ Decremented slots for package_date_id ${bookingData.package_date_id}`
          )
        }
      } catch (slotError) {
        console.error('Error decrementing slots:', slotError)
      }
    }

    // Auto-assign booking
    try {
      const assignmentResult = await autoAssignBooking('tour', bookingData.id)
      if (assignmentResult.success) {
        console.log(
          `Tour booking ${bookingData.id} auto-assigned to ${assignmentResult.assignedStaff.name}`
        )
      }
    } catch (assignmentError) {
      console.error('Auto-assignment error:', assignmentError)
    }

    // Send confirmation email
    sendTourConfirmationEmail(booking_reference)
      .then(() =>
        console.log(`✅ Tour confirmation email sent for ${booking_reference}`)
      )
      .catch((emailError) => {
        console.error(
          `❌ Failed to send tour confirmation email:`,
          emailError.message
        )
      })

    // Send admin notification
    try {
      const pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID,
        key: process.env.PUSHER_APP_KEY,
        secret: process.env.PUSHER_APP_SECRET,
        cluster: process.env.PUSHER_APP_CLUSTER,
        useTLS: true,
      })

      await insertAdminNotification({
        type: 'new_tour_booking',
        event_type: 'new_tour_booking',
        message: `Tour booking confirmed: ${booking_reference}`,
        booking_reference: booking_reference,
        pnr: null,
        booking_type: 'tour',
        category: 'booking',
        priority: 'medium',
        action_url: `/admin/tours/${bookingData.id}`,
        created_at: new Date().toISOString(),
      })

      await pusher.trigger('admin-notifications', 'new-booking', {
        bookingReference: booking_reference,
        pnr: null,
      })
    } catch (notifyErr) {
      console.error('Failed to send notification:', notifyErr)
    }
  } else {
    // ===== FLIGHT LOGIC =====
    // Get booking details
    const { data: bookingData, error: fetchError } = await supabase
      .from('flight_bookings')
      .select('id, status')
      .eq('booking_reference', booking_reference)
      .single()

    if (fetchError || !bookingData) {
      console.error(`❌ Flight booking ${booking_reference} not found!`)
      return res.sendStatus(200)
    }

    // Update status to PAID_PENDING_BOOKING (simple - no idempotency checks)
    const { data: updatedBooking, error: updateError } = await supabase
      .from('flight_bookings')
      .update({
        status: 'PAID_PENDING_BOOKING',
        stripe_checkout_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq('booking_reference', booking_reference)
      .select('status')
      .single()

    if (updateError || !updatedBooking) {
      console.error(
        `❌ Failed to update flight booking status: ${
          updateError?.message || 'No data returned'
        }`
      )
      return res.sendStatus(500)
    }

    console.log(
      `✅ Flight booking ${booking_reference} updated to ${updatedBooking.status}`
    )

    // Send admin notification
    try {
      const pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID,
        key: process.env.PUSHER_APP_KEY,
        secret: process.env.PUSHER_APP_SECRET,
        cluster: process.env.PUSHER_APP_CLUSTER,
        useTLS: true,
      })

      await insertAdminNotification({
        type: 'payment_confirmed',
        event_type: 'payment_confirmed',
        message: `Payment confirmed for booking ${booking_reference}. Creating Amadeus order...`,
        booking_reference: booking_reference,
        created_at: new Date().toISOString(),
      })

      await pusher.trigger('admin-notifications', 'payment-confirmed', {
        bookingReference: booking_reference,
        status: 'PAID_PENDING_BOOKING',
        nextStep: 'Creating Amadeus order...',
      })
    } catch (notifyErr) {
      console.error('Failed to send notification:', notifyErr)
    }

    // Create Amadeus order (this will send email when done)
    // Use the updatedBooking status we already have - no need to verify again
    if (updatedBooking.status === 'PAID_PENDING_BOOKING') {
      createAmadeusOrder(booking_reference)
        .then(() => {
          console.log(`✅ Amadeus order created for ${booking_reference}`)
        })
        .catch((err) => {
          console.error(`❌ Failed to create Amadeus order:`, err.message)
        })
    } else {
      console.warn(
        `⚠️ Booking ${booking_reference} status is ${updatedBooking.status}, not PAID_PENDING_BOOKING. Skipping Amadeus order creation.`
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
