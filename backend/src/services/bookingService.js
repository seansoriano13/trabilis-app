import { query } from '../config/db.js'
import { amadeus } from '../config/amadeus.js'
import stripe from '../config/stripe.js'
import {
    sendConfirmationEmail,
    sendFailureEmail,
    sendTourConfirmationEmail,
    sendTourFailureEmail,
} from './emailService.js'
import { pusher } from '../config/pusher.js'

export async function finalizeFlightBooking(bookingReference) {
    function safeParseJson(data, fallback = null) {
        if (!data) return fallback
        try {
            return JSON.parse(data)
        } catch {
            return fallback
        }
    }
    try {
        console.log(`Starting finalization for booking: ${bookingReference}`)

        const result = await query(
            'SELECT amadeus_order_id, status, passenger_details, search_criteria FROM flight_bookings WHERE booking_reference = ?',
            [bookingReference]
        )

        if (result.rows.length === 0) {
            throw new Error(`Booking ${bookingReference} not found`)
        }

        const booking = result.rows[0]
        const { amadeus_order_id, status } = booking

        if (status !== 'PAID_PENDING_TICKETING') {
            throw new Error(
                `Booking ${bookingReference} is not in PAID_PENDING_TICKETING status, current status: ${status}`
            )
        }
        if (!amadeus_order_id) {
            throw new Error(
                `No Amadeus order ID found for booking ${bookingReference}`
            )
        }

        let order
        try {
            const response = await amadeus.booking
                .flightOrder(amadeus_order_id)
                .get()
            order = response.data
            console.log(
                `✅ Retrieved Amadeus order ${amadeus_order_id} for ${bookingReference}`
            )
        } catch (amadeusError) {
            console.error(
                `Failed to retrieve Amadeus order ${amadeus_order_id} for ${bookingReference}:`,
                {
                    message: amadeusError.message,
                    response: amadeusError.response?.data,
                    status: amadeusError.response?.status,
                    code: amadeusError.code,
                }
            )
            throw new Error(
                `Amadeus order retrieval failed: ${
                    amadeusError.message || 'Unknown error'
                }`
            )
        }

        const eTicketNumbers =
            order.associatedRecords?.map((record) => record.reference) || []
        const pnr =
            order.associatedRecords?.find(
                (record) => record.originSystemCode === 'GDS'
            )?.reference || null

        try {
            await query(
                'UPDATE flight_bookings SET status = ?, e_ticket_numbers = ?, pnr = ? WHERE booking_reference = ?',
                [
                    'TICKETED',
                    JSON.stringify(eTicketNumbers),
                    pnr,
                    bookingReference,
                ]
            )
            console.log(
                `✅ Booking ${bookingReference} finalized with status TICKETED, PNR: ${pnr}`
            )
            try {
                await pusher.trigger('bookings', 'new-booking', {
                    message: `New booking for ${bookingReference}`,
                    bookingId: `${bookingReference}`,
                })
                console.log('✅ Notification sent successfully')
            } catch (pusherError) {
                console.error('❌ Failed to send notification:', pusherError)
                // Don't throw error - notification failure shouldn't break booking
            }
        } catch (dbError) {
            console.error(
                `Failed to update booking ${bookingReference}:`,
                dbError
            )
            throw new Error(`Database error: ${dbError.message}`)
        }

        // Send confirmation email after successful ticketing
        try {
            await sendConfirmationEmail(bookingReference)
            console.log(`✅ Confirmation email sent for ${bookingReference}`)
        } catch (emailError) {
            console.error(
                `Failed to send confirmation email for ${bookingReference}:`,
                emailError
            )
        }
        return { status: 'TICKETED', eTicketNumbers, pnr }
    } catch (error) {
        console.error(
            `❌ CRITICAL FAILURE during finalization for ${bookingReference}: ${error.message}`
        )
        try {
            await query(
                'UPDATE flight_bookings SET status = ? WHERE booking_reference = ?',
                [`TICKETING_FAILED`, bookingReference]
            )
            console.log(
                `Database updated for ${bookingReference}. Status: TICKETING_FAILED: ${error.message}`
            )

            const result = await query(
                'SELECT total_amount, currency, stripe_checkout_id, passenger_details, search_criteria FROM flight_bookings WHERE booking_reference = ?',
                [bookingReference]
            )
            const booking = result.rows[0]
            if (booking.stripe_checkout_id) {
                try {
                    await stripe.refunds.create({
                        checkout_session: booking.stripe_checkout_id,
                        amount: Math.round(booking.total_amount * 100),
                    })
                    console.log(
                        `✅ Stripe refund issued for failed booking ${bookingReference}`
                    )
                } catch (stripeError) {
                    console.error(
                        `Failed to issue refund for ${bookingReference}:`,
                        stripeError
                    )
                }
            }

            const passengerDetails = safeParseJson(booking.passenger_details)
            const searchCriteria = safeParseJson(booking.search_criteria)
            const primaryTraveler = passengerDetails.travelers[0]
            try {
                await sendFailureEmail({
                    email: primaryTraveler.contact.emailAddress,
                    firstName: primaryTraveler.name.firstName,
                    lastName: primaryTraveler.name.lastName,
                    bookingReference,
                    searchCriteria,
                })
                console.log(`✅ Failure email sent for ${bookingReference}`)
            } catch (emailError) {
                console.error(
                    `Failed to send failure email for ${bookingReference}:`,
                    emailError
                )
            }
        } catch (rollbackError) {
            console.error(
                `Rollback failed for ${bookingReference}:`,
                rollbackError
            )
        }
        throw new Error(`Failed to finalize booking: ${error.message}`)
    }
}

export async function finalizeTourBooking(bookingReference) {
    try {
        console.log(
            `Starting tour finalization for tour booking: ${bookingReference}`
        )

        const { data: booking, error } = await supabase
            .from('tour_bookings')
            .select(
                `
        *,
        package_dates (
          start_date,
          end_date,
          tour_packages (title)
        )
      `
            )
            .eq('booking_reference', bookingReference)
            .single()

        if (error || !booking) {
            throw new Error(`Tour booking ${bookingReference} not found`)
        }

        if (booking.status !== 'CONFIRMED') {
            throw new Error(
                `Tour booking ${bookingReference} is not in CONFIRMED status, current status: ${booking.status}`
            )
        }

        // Send confirmation email
        try {
            await sendTourConfirmationEmail({
                bookingReference,
                email: booking.lead_email,
                firstName: booking.lead_first_name,
                lastName: booking.lead_last_name,
                tourTitle: booking.package_dates.tour_packages.title,
                startDate: booking.package_dates.start_date,
                endDate: booking.package_dates.end_date,
                passengerCount: booking.passenger_count,
                amount:
                    booking.payment_type === 'RESERVATION'
                        ? booking.reservation_amount
                        : booking.total_amount,
            })
            console.log(
                `✅ Tour confirmation email sent for ${bookingReference}`
            )
        } catch (emailError) {
            console.error(
                `Failed to send tour confirmation email for ${bookingReference}:`,
                emailError
            )
        }

        try {
            await pusher.trigger('bookings', 'new-booking', {
                message: `New booking for ${bookingReference}`,
                bookingId: `${bookingReference}`,
            })
            console.log('✅ Notification sent successfully')
        } catch (pusherError) {
            console.error('❌ Failed to send notification:', pusherError)
            // Don't throw error - notification failure shouldn't break booking
        }

        return { status: 'CONFIRMED' }
    } catch (error) {
        console.error(
            `❌ CRITICAL FAILURE during tour finalization for ${bookingReference}: ${error.message}`
        )
        try {
            await supabase
                .from('tour_bookings')
                .update({
                    status: 'FAILED',
                    updated_at: new Date().toISOString(),
                })
                .eq('booking_reference', bookingReference)

            console.log(
                `Database updated for ${bookingReference}. Status: FAILED`
            )

            const { data: booking } = await supabase
                .from('tour_bookings')
                .select(
                    'lead_email, lead_first_name, lead_last_name, stripe_checkout_id, reservation_amount, total_amount, payment_type'
                )
                .eq('booking_reference', bookingReference)
                .single()

            if (booking.stripe_checkout_id) {
                try {
                    await stripe.refunds.create({
                        checkout_session: booking.stripe_checkout_id,
                        amount: Math.round(
                            (booking.payment_type === 'RESERVATION'
                                ? booking.reservation_amount
                                : booking.total_amount) * 100
                        ),
                    })
                    console.log(
                        `✅ Stripe refund issued for failed tour booking ${bookingReference}`
                    )
                } catch (stripeError) {
                    console.error(
                        `Failed to issue refund for ${bookingReference}:`,
                        stripeError
                    )
                }
            }

            try {
                await sendTourFailureEmail({
                    email: booking.lead_email,
                    firstName: booking.lead_first_name,
                    lastName: booking.lead_last_name,
                    bookingReference,
                })
                console.log(
                    `✅ Tour failure email sent for ${bookingReference}`
                )
            } catch (emailError) {
                console.error(
                    `Failed to send tour failure email for ${bookingReference}:`,
                    emailError
                )
            }
        } catch (rollbackError) {
            console.error(
                `Rollback failed for ${bookingReference}:`,
                rollbackError
            )
        }
        throw new Error(`Failed to finalize tour booking: ${error.message}`)
    }
}

export async function checkBookingStatus(bookingReference) {
    try {
        const result = await query(
            'SELECT status, search_criteria, pnr FROM flight_bookings WHERE booking_reference = ?',
            [bookingReference]
        )

        const { status, search_criteria, pnr } = result.rows[0]

        if (!result.rows.length) {
            throw new Error(`Booking ${bookingReference} not found`)
        }
        return {
            status: status,
            searchCriteria: search_criteria,
            pnr: pnr,
        }
    } catch (error) {
        console.error(`Failed to check status for ${bookingReference}:`, error)
        throw new Error(`Failed to check booking status: ${error.message}`)
    }
}
