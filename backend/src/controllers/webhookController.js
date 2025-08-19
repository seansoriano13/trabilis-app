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
                package_dates (*, tour_packages (*))
            `
                )
                .eq('booking_reference', booking_reference)
                .eq('status', 'PENDING_PAYMENT')
                .maybeSingle()

            if (bookingError || !bookingData) {
                console.log(
                    `⚠️ Webhook received for booking ${booking_reference}, but no booking found or already processed.`
                )
                return res.status(200).send()
            }

            // Construct bookingDetails for PDF/email
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
                inclusions:
                    bookingData.package_dates.inclusions?.join('<br/>') ||
                    'As per package',
                exclusions:
                    bookingData.package_dates.exclusions?.join('<br/>') || '-',
                notes: bookingData.package_dates.notes?.join('<br/>') || '-',
                itinerary: bookingData.itinerary || '',
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

            // Update booking status and package slots
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

            // Send confirmation email using the correct email field
            await sendTourConfirmationEmail(bookingDetails)

            // Notify admin
            await supabase.from('admin_notifications').insert({
                type: 'TOUR_BOOKING_CONFIRMED',
                message: `Tour booking ${booking_reference} confirmed for ${bookingData.passenger_count} passengers.`,
            })

            console.log(
                `✅ Tour booking ${booking_reference} confirmed. Slots updated, email sent.`
            )
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
