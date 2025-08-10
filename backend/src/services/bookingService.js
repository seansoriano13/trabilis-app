import pool from '../config/db.js'
import { amadeus } from '../config/amadeus.js'
import stripe from '../config/stripe.js'
import { sendConfirmationEmail } from './emailService.js'

export async function finalizeFlightBooking(bookingReference) {
    let connection
    try {
        connection = await pool.getConnection()
        console.log(`Starting finalization for booking: ${bookingReference}`)

        const [rows] = await connection.execute(
            'SELECT amadeus_order_id, status, passenger_details, search_criteria FROM flight_bookings WHERE booking_reference = ?',
            [bookingReference]
        )
        if (rows.length === 0) {
            throw new Error(`Booking ${bookingReference} not found`)
        }
        const booking = rows[0]
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
            await connection.execute(
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

        await connection.commit()
        return { status: 'TICKETED', eTicketNumbers, pnr }
    } catch (error) {
        console.error(
            `❌ CRITICAL FAILURE during finalization for ${bookingReference}: ${error.message}`
        )
        try {
            await connection.execute(
                'UPDATE flight_bookings SET status = ? WHERE booking_reference = ?',
                [`TICKETING_FAILED: ${error.message}`, bookingReference]
            )
            console.log(
                `Database updated for ${bookingReference}. Status: TICKETING_FAILED: ${error.message}`
            )

            const [bookingRows] = await connection.execute(
                'SELECT total_amount, currency, stripe_checkout_id, passenger_details, search_criteria FROM flight_bookings WHERE booking_reference = ?',
                [bookingReference]
            )
            const booking = bookingRows[0]
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
                    throw new Error(`Refund failed: ${stripeError.message}`)
                }
            }

            const passengerDetails = JSON.parse(booking.passenger_details)
            const searchCriteria = JSON.parse(booking.search_criteria)
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

            await connection.commit()
        } catch (rollbackError) {
            console.error(
                `Rollback failed for ${bookingReference}:`,
                rollbackError
            )
        }
        throw new Error(`Failed to finalize booking: ${error.message}`)
    } finally {
        if (connection) {
            try {
                await connection.release()
                console.log(
                    `Database connection released for ${bookingReference}`
                )
            } catch (releaseError) {
                console.error(
                    `Error releasing database connection for ${bookingReference}:`,
                    releaseError
                )
            }
        }
    }
}

export async function checkBookingStatus(bookingReference) {
    let connection
    try {
        connection = await pool.getConnection()
        const [rows] = await connection.execute(
            'SELECT status, search_criteria, pnr FROM flight_bookings WHERE booking_reference = ?',
            [bookingReference]
        )
        if (rows.length === 0) {
            throw new Error(`Booking ${bookingReference} not found`)
        }
        return {
            status: rows[0].status,
            searchCriteria: JSON.parse(rows[0].search_criteria),
            pnr: rows[0].pnr,
        }
    } catch (error) {
        console.error(`Failed to check status for ${bookingReference}:`, error)
        throw new Error(`Failed to check booking status: ${error.message}`)
    } finally {
        if (connection) {
            try {
                await connection.release()
            } catch (releaseError) {
                console.error(
                    `Error releasing database connection for ${bookingReference}:`,
                    releaseError
                )
            }
        }
    }
}
