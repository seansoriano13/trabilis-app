import stripe from '../config/stripe.js'
import { query } from '../config/db.js'
import { finalizeFlightBooking } from '../services/bookingService.js'

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

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object

        const bookingReference = session.metadata.booking_reference

        try {
            const updateResult = await query(
                "UPDATE flight_bookings SET status = ? WHERE booking_reference = ? AND status = 'PENDING_PAYMENT'",
                ['PAID_PENDING_TICKETING', bookingReference]
            )

            if (updateResult.rowCount > 0) {
                console.log(
                    `✅ Database updated for booking: ${bookingReference}. Status is now PAID_PENDING_TICKETING.`
                )

                finalizeFlightBooking(bookingReference).catch((err) => {
                    console.error(
                        `❌ CRITICAL ERROR during async finalization for ${bookingReference}:`,
                        err
                    )
                })
            } else {
                console.log(
                    `⚠️  Webhook received for booking ${bookingReference}, but no update was made (already processed or not found).`
                )
            }
        } catch (dbError) {
            console.error(
                `❌ Database error while processing webhook for booking ${bookingReference}:`,
                dbError
            )
            return res.sendStatus(500)
        }
    } else {
        console.log(`Received unhandled event type: ${event.type}`)
    }

    res.status(200).send()
}
