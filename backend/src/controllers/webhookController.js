import stripe from '../config/stripe.js'
import { supabase } from '../config/supabaseClient.js'
import { query } from '../config/db.js'
import { finalizeFlightBooking } from '../services/bookingService.js'
import Pusher from 'pusher'
import {
    sendTourConfirmationEmail,
    sendTourFailureEmail,
    generateFlightItineraryPDF,
} from '../services/brevoEmailService.js'

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
    let { booking_reference, product_type } = session.metadata || {}
    product_type = product_type || 'FLIGHT'

    console.log(`🔍 WEBHOOK DEBUG - Processing ${product_type} booking: ${booking_reference}`)
    console.log(`🔍 WEBHOOK DEBUG - Session metadata:`, session.metadata)
    console.log(`🔍 WEBHOOK DEBUG - Payment amount: ${session.amount_total} ${session.currency}`)

    if (!booking_reference) {
        console.error('❌ Webhook session missing booking_reference')
        return res.sendStatus(400)
    }

    try {
        if (product_type === 'TOUR') {
            console.log(`🔍 WEBHOOK DEBUG - Starting TOUR processing for ${booking_reference}`)
            
            // ===== TOUR LOGIC =====
            const { data: bookingData, error: bookingError } = await supabase
                .from('tour_bookings')
                .select(
                    `
                    *,
                    package_dates (
                        *,
                        tour_packages (*),
                        package_itineraries (*)
                    )
                `
                )
                .eq('booking_reference', booking_reference)
                .eq('status', 'PENDING_PAYMENT')
                .maybeSingle()

            console.log(`🔍 WEBHOOK DEBUG - Tour booking query result:`, {
                found: !!bookingData,
                error: bookingError?.message,
                status: bookingData?.status,
                passengerCount: bookingData?.passenger_count
            })

            if (bookingError || !bookingData) {
                console.log(
                    `⚠️ Webhook received for tour booking ${booking_reference}, but no booking found or already processed.`
                )
                return res.sendStatus(200)
            }

            console.log(`🔍 WEBHOOK DEBUG - Tour booking data retrieved successfully`)
            console.log(`🔍 WEBHOOK DEBUG - Package details:`, {
                tourTitle: bookingData.package_dates?.tour_packages?.title,
                startDate: bookingData.package_dates?.start_date,
                endDate: bookingData.package_dates?.end_date,
                availableSlots: bookingData.package_dates?.available_slots,
                passengerCount: bookingData.passenger_count
            })

            const bookingDetails = {
                bookingReference: bookingData.booking_reference,
                email: bookingData.lead_email,
                firstName: bookingData.lead_first_name,
                lastName: bookingData.lead_last_name,
                phone: bookingData.lead_phone,
                passengerCount: bookingData.passenger_count,
                paymentType: bookingData.payment_type,
                amount:
                    bookingData.payment_type === 'RESERVATION'
                        ? bookingData.reservation_amount
                        : bookingData.total_amount,
                status: bookingData.status,
                tourTitle: bookingData.package_dates.tour_packages.title,
                startDate: bookingData.package_dates.start_date,
                endDate: bookingData.package_dates.end_date,
                passengers: bookingData.passenger_details
                    ? (typeof bookingData.passenger_details === 'string' 
                        ? JSON.parse(bookingData.passenger_details) 
                        : bookingData.passenger_details)
                    : [],
                inclusions:
                    bookingData.package_dates.inclusions?.join('<br/>') ||
                    'As per package',
                exclusions:
                    bookingData.package_dates.exclusions?.join('<br/>') || '-',
                notes: bookingData.package_dates.notes?.join('<br/>') || '-',
                itinerary: bookingData.package_dates?.package_itineraries || [],
                ratePerPax: bookingData.package_dates.rate_per_pax || 'N/A',
                availableSlots:
                    bookingData.package_dates.available_slots || 'N/A',
                totalSlots: bookingData.package_dates.total_slots || 'N/A',
                requirements:
                    bookingData.package_dates.requirements?.join('<br/>') ||
                    '-',
                paymentTerms:
                    bookingData.package_dates.payment_terms?.join('<br/>') ||
                    '-',
                tourDescription:
                    bookingData.package_dates.tour_packages.description || '-',
                mainImageUrl:
                    bookingData.package_dates.tour_packages.main_image_url ||
                    '',
                panellumUrl:
                    bookingData.package_dates.tour_packages.panellum_url || '',
            }

            console.log(`🔍 WEBHOOK DEBUG - Booking details prepared for email:`, {
                bookingReference: bookingDetails.bookingReference,
                email: bookingDetails.email,
                tourTitle: bookingDetails.tourTitle,
                itineraryCount: bookingDetails.itinerary?.length || 0,
                passengerCount: bookingDetails.passengerCount
            })

            const currentSlots = bookingData.package_dates.available_slots
            const newSlots = currentSlots - bookingData.passenger_count

            console.log(`🔍 WEBHOOK DEBUG - Slot calculation:`, {
                currentSlots,
                passengerCount: bookingData.passenger_count,
                newSlots,
                hasEnoughSlots: newSlots >= 0
            })

            if (newSlots < 0) {
                console.error(
                    `❌ Not enough slots for tour booking ${booking_reference}`
                )
                await supabase
                    .from('tour_bookings')
                    .update({
                        status: 'FAILED',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('booking_reference', booking_reference)

                await sendTourFailureEmail({
                    email: bookingData.lead_email,
                    firstName: bookingData.lead_first_name,
                    lastName: bookingData.lead_last_name,
                    bookingReference: booking_reference,
                })

                return res.sendStatus(500)
            }

            console.log(`🔍 WEBHOOK DEBUG - Updating tour booking status to CONFIRMED`)
            const { error: updateBookingError } = await supabase
                .from('tour_bookings')
                .update({
                    status: 'CONFIRMED',
                    updated_at: new Date().toISOString(),
                })
                .eq('booking_reference', booking_reference)
                .eq('status', 'PENDING_PAYMENT')

            if (updateBookingError) throw updateBookingError

            console.log(`🔍 WEBHOOK DEBUG - Updating available slots: ${newSlots}`)
            const { error: updateSlotsError } = await supabase
                .from('package_dates')
                .update({ available_slots: newSlots })
                .eq('id', bookingData.package_date_id)

            if (updateSlotsError) throw updateSlotsError

            console.log(`🔍 WEBHOOK DEBUG - Database updates completed successfully`)

            // Immediately notify admin that a tour payment is confirmed
            try {
                console.log(`🔍 WEBHOOK DEBUG - Sending admin notification`)
                const pusher = new Pusher({
                    appId: '2048372',
                    key: '371c6201af1a663a4f58',
                    secret: 'b4a5985ecd6d27690c8b',
                    cluster: 'ap1',
                    useTLS: true,
                })

                const { error: insertError } = await supabase
                    .from('admin_notifications')
                    .insert([
                        {
                            type: 'payment_confirmed_tour',
                            message: `Tour payment confirmed for ${booking_reference}.`,
                            booking_reference: booking_reference,
                            booking_type: 'tour',
                            created_at: new Date().toISOString(),
                        },
                    ])

                if (insertError) {
                    console.error('Supabase insert error (payment_confirmed_tour):', insertError.message)
                }

                try {
                    await pusher.trigger('admin-notifications', 'new-booking', {
                        bookingReference: booking_reference,
                        bookingType: 'tour',
                        pnr: null,
                    })
                    console.log('✅ Pusher notification sent successfully for tour booking:', booking_reference)
                } catch (pusherError) {
                    console.warn('⚠️ Pusher notification failed (non-critical):', pusherError.message)
                    // Continue processing - this is not a critical failure
                }
            } catch (notifyErr) {
                console.error('❌ Failed to send immediate tour payment notification:', notifyErr)
            }

            // Ensure email shows latest status
            bookingDetails.status = 'CONFIRMED'
            
            console.log(`🔍 WEBHOOK DEBUG - Starting email generation and sending`)
            console.log(`🔍 WEBHOOK DEBUG - Environment check:`, {
                NODE_ENV: process.env.NODE_ENV,
                RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL,
                BACKEND_URL: process.env.BACKEND_URL,
                BREVO_API_KEY: process.env.BREVO_API_KEY ? 'SET' : 'NOT_SET',
                BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL
            })
            
            try {
                await sendTourConfirmationEmail(bookingDetails)
                console.log(`✅ WEBHOOK DEBUG - Tour confirmation email sent successfully for ${booking_reference}`)
            } catch (emailError) {
                console.error(`❌ WEBHOOK DEBUG - Email sending failed for ${booking_reference}:`, emailError)
                console.error(`❌ WEBHOOK DEBUG - Email error details:`, {
                    message: emailError.message,
                    stack: emailError.stack,
                    name: emailError.name
                })
                // Don't fail the webhook - email is not critical for payment processing
            }
        } else {
            // ===== FLIGHT LOGIC =====
            const { data, error } = await supabase
                .from('flight_bookings')
                .update({ status: 'PAID_PENDING_TICKETING' })
                .eq('booking_reference', booking_reference)
                .eq('status', 'PENDING_PAYMENT')
                .select('id, status')

            if (error) {
                throw new Error(`Database update error: ${error.message}`)
            }

            if (data && data.length > 0) {
                console.log(
                    `✅ Database updated for flight booking ${booking_reference}. Status is now PAID_PENDING_TICKETING.`
                )

                // Immediately notify admin that payment succeeded (before ticketing completes)
                try {
                    const pusher = new Pusher({
                        appId: '2048372',
                        key: '371c6201af1a663a4f58',
                        secret: 'b4a5985ecd6d27690c8b',
                        cluster: 'ap1',
                        useTLS: true,
                    })

                    const { error: insertError } = await supabase
                        .from('admin_notifications')
                        .insert([
                            {
                                type: 'payment_confirmed',
                                message: `Payment confirmed for booking ${booking_reference}. Ticketing in progress...`,
                                booking_reference: booking_reference,
                                created_at: new Date().toISOString(),
                            },
                        ])

                    if (insertError) {
                        console.error('Supabase insert error (payment_confirmed):', insertError.message)
                    }

                    try {
                        await pusher.trigger('admin-notifications', 'new-booking', {
                            bookingReference: booking_reference,
                            pnr: null,
                        })
                        console.log('✅ Pusher notification sent successfully for flight booking:', booking_reference)
                    } catch (pusherError) {
                        console.warn('⚠️ Pusher notification failed (non-critical):', pusherError.message)
                        // Continue processing - this is not a critical failure
                    }
                } catch (notifyErr) {
                    console.error('❌ Failed to send immediate payment notification:', notifyErr)
                }

                finalizeFlightBooking(booking_reference).catch((err) => {
                    console.error(
                        `❌ CRITICAL ERROR during async finalization for flight booking ${booking_reference}:`,
                        err
                    )
                })
            } else {
                console.log(
                    `⚠️ Webhook received for flight booking ${booking_reference}, but no update was made (already processed or not found).`
                )
            }
        }
    } catch (err) {
        console.error(
            `❌ Error while processing webhook for booking ${booking_reference}:`,
            err
        )
        return res.sendStatus(500)
    }

    return res.sendStatus(200)
}

// Test endpoint for Flight PDF generation
export const testFlightPDFGeneration = async (req, res) => {
    try {
        const { bookingReference } = req.params
        
        console.log(`🧪 Testing Flight PDF generation for booking: ${bookingReference}`)
        
        // Get flight booking data
        const { data: bookingData, error: bookingError } = await supabase
            .from('flight_bookings')
            .select('*')
            .eq('booking_reference', bookingReference)
            .single()

        if (bookingError || !bookingData) {
            console.log(`❌ Flight booking ${bookingReference} not found`)
            return res.status(404).json({ error: 'Flight booking not found' })
        }

        console.log('🧪 Test - Raw flight booking data from Supabase:')
        console.log('🧪 Test - booking status:', bookingData.status)
        console.log('🧪 Test - has amadeus_flight_offer:', !!bookingData.amadeus_flight_offer)
        console.log('🧪 Test - has passenger_details:', !!bookingData.passenger_details)
        console.log('🧪 Test - PNR:', bookingData.pnr)

        // Generate PDF
        const pdfBuffer = await generateFlightItineraryPDF(bookingData)
        
        console.log(`✅ Flight PDF generated successfully for ${bookingReference}, size: ${pdfBuffer.length} bytes`)

        // Return PDF as download
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="Flight-Itinerary-${bookingReference}.pdf"`)
        res.setHeader('Content-Length', pdfBuffer.length)
        res.send(pdfBuffer)

    } catch (error) {
        console.error(`❌ Error testing Flight PDF generation for ${req.params.bookingReference}:`, error)
        res.status(500).json({ 
            error: 'Flight PDF generation failed', 
            message: error.message,
            details: error.stack 
        })
    }
}

