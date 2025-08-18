import stripe from '../config/stripe.js'
import { supabase } from '../config/supabaseClient.js'
import {
    sendTourConfirmationEmail,
    sendTourFailureEmail,
} from '../services/emailService.js'

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

    if (event.type !== 'checkout.session.completed') {
        console.log(`Received unhandled event type: ${event.type}`)
        return res.sendStatus(200)
    }

    const session = event.data.object
    let { booking_reference, product_type } = session.metadata || {}
    product_type = product_type || 'FLIGHT'

    try {
        if (product_type === 'TOUR') {
            // Fetch booking with related package_dates and tour_packages
            const { data: bookingData, error: bookingError } = await supabase
                .from('tour_bookings')
                .select(
                    `
                    *,
                    package_dates (
                        start_date,
                        end_date,
                        available_slots,
                        tour_packages (
                            title
                        )
                    )
                `
                )
                .eq('booking_reference', booking_reference)
                .eq('status', 'PENDING_PAYMENT')
                .single()

            if (bookingError || !bookingData) {
                console.log(
                    `⚠️ Webhook received for booking ${booking_reference}, but no booking found or already processed.`
                )
                return res.status(200).send()
            }

            // Calculate new available slots
            const currentSlots = bookingData.package_dates.available_slots
            const newSlots = currentSlots - bookingData.passenger_count

            if (newSlots < 0) {
                console.error(
                    `❌ Not enough slots for booking ${booking_reference}`
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
                return res.status(500).send()
            }

            // Update booking status and package slots in a single step if possible
            const { error: updateBookingError } = await supabase
                .from('tour_bookings')
                .update({
                    status: 'CONFIRMED',
                    updated_at: new Date().toISOString(),
                })
                .eq('booking_reference', booking_reference)
                .eq('status', 'PENDING_PAYMENT')

            if (updateBookingError) throw updateBookingError

            const { error: updateSlotsError } = await supabase
                .from('package_dates')
                .update({ available_slots: newSlots })
                .eq('id', bookingData.package_date_id)

            if (updateSlotsError) throw updateSlotsError

            // Send confirmation email
            await sendTourConfirmationEmail({
                bookingReference: booking_reference,
                email: bookingData.lead_email,
                firstName: bookingData.lead_first_name,
                lastName: bookingData.lead_last_name,
                tourTitle: bookingData.package_dates.tour_packages.title,
                startDate: bookingData.package_dates.start_date,
                endDate: bookingData.package_dates.end_date,
                passengerCount: bookingData.passenger_count,
                amount:
                    bookingData.payment_type === 'RESERVATION'
                        ? bookingData.reservation_amount
                        : bookingData.total_amount,
            })

            // Notify admin
            await supabase.from('admin_notifications').insert({
                type: 'TOUR_BOOKING_CONFIRMED',
                message: `Tour booking ${booking_reference} confirmed for ${bookingData.passenger_count} passengers.`,
            })

            console.log(
                `✅ Tour booking ${booking_reference} confirmed. Slots updated, email sent.`
            )
        } else if (product_type === 'FLIGHT') {
            const { error: updateFlightError } = await supabase
                .from('flight_bookings')
                .update({ status: 'PAID_PENDING_TICKETING' })
                .eq('booking_reference', booking_reference)
                .eq('status', 'PENDING_PAYMENT')

            if (updateFlightError) throw updateFlightError

            console.log(
                `✅ Database updated for flight booking ${booking_reference}.`
            )
            // async finalization
            finalizeFlightBooking(booking_reference).catch((err) =>
                console.error(
                    `❌ CRITICAL ERROR during async finalization for ${booking_reference}:`,
                    err
                )
            )
        } else {
            console.log(`Received unhandled product type: ${product_type}`)
        }
    } catch (err) {
        console.error(
            `❌ Error while processing webhook for booking ${booking_reference}:`,
            err
        )
        return res.status(500).send()
    }

    res.status(200).send()
}
