import { amadeus } from '../config/amadeus.js'
import pool from '../config/db.js'
import stripe from '../config/stripe.js'
import { sendConfirmationEmail, sendFailureEmail } from './emailService.js'

export const finalizeFlightBooking = async (bookingReference) => {
    console.log(`Starting finalization for booking: ${bookingReference}`)
    let connection
    let booking // Declare booking at the top

    try {
        // Get a connection from the pool
        connection = await pool.getConnection()

        // Query booking details
        const [rows] = await connection.execute(
            'SELECT amadeus_flight_offer, passenger_details, stripe_checkout_id FROM flight_bookings WHERE booking_reference = ?',
            [bookingReference]
        )

        if (!rows.length) {
            console.error(
                `Finalization Error: Booking not found with reference ${bookingReference}`
            )
            throw new Error(`Booking not found: ${bookingReference}`)
        }

        booking = rows[0] // Assign booking here
        let parsedFlightOffer, passengerDetails

        // Parse JSON data
        try {
            parsedFlightOffer = JSON.parse(booking.amadeus_flight_offer)
            passengerDetails = JSON.parse(booking.passenger_details)
        } catch (parseError) {
            console.error(
                `Error parsing booking data for ${bookingReference}:`,
                parseError
            )
            throw new Error(
                `Invalid booking data format: ${parseError.message}`
            )
        }

        // Validate passenger details
        if (
            !passengerDetails.travelers ||
            !Array.isArray(passengerDetails.travelers) ||
            !passengerDetails.travelers.length
        ) {
            console.error(
                `Invalid traveler data for ${bookingReference}: No travelers provided`
            )
            throw new Error('At least one traveler is required')
        }

        for (const [index, traveler] of passengerDetails.travelers.entries()) {
            if (
                !traveler.id ||
                !traveler.dateOfBirth ||
                !traveler.name?.firstName ||
                !traveler.name?.lastName
            ) {
                console.error(
                    `Invalid traveler data for ${bookingReference}: Missing required fields for traveler ${
                        index + 1
                    }`
                )
                throw new Error(
                    `Missing required fields for traveler ${
                        traveler.id || index + 1
                    }`
                )
            }
            if (
                !traveler.contact?.emailAddress &&
                (!traveler.contact?.phones?.length ||
                    !traveler.contact.phones[0]?.number)
            ) {
                console.error(
                    `Invalid traveler data for ${bookingReference}: No contact method for traveler ${
                        index + 1
                    }`
                )
                throw new Error(
                    `At least one contact method is required for traveler ${
                        traveler.id || index + 1
                    }`
                )
            }
            if (
                !traveler.contact?.phones[0]?.countryCallingCode ||
                !/^\d+$/.test(traveler.contact.phones[0].countryCallingCode)
            ) {
                console.error(
                    `Invalid traveler data for ${bookingReference}: Invalid countryCallingCode for traveler ${
                        index + 1
                    }`
                )
                throw new Error(
                    `Country calling code must be digits only for traveler ${
                        traveler.id || index + 1
                    }`
                )
            }
            if (
                traveler.documents?.[0]?.documentType === 'PASSPORT' &&
                traveler.documents[0].holder !== true
            ) {
                console.error(
                    `Invalid traveler data for ${bookingReference}: Passport holder field missing or invalid for traveler ${
                        index + 1
                    }`
                )
                throw new Error(
                    `Passport holder field must be true for traveler ${
                        traveler.id || index + 1
                    }`
                )
            }
        }

        console.log(
            `Attempting to create Amadeus order for ${bookingReference}...`
        )

        // Construct Amadeus API request
        const orderResponse = await amadeus.booking.flightOrders.post({
            data: {
                type: 'flight-order',
                flightOffers: [parsedFlightOffer],
                travelers: passengerDetails.travelers,
                remarks: passengerDetails.remarks || undefined,
                ticketingAgreement:
                    passengerDetails.ticketingAgreement || undefined,
                contacts: passengerDetails.contacts || undefined,
            },
        })

        console.log(
            `✅ Amadeus order created successfully for ${bookingReference}!`
        )

        const pnr = orderResponse.data?.associatedRecords?.[0]?.reference
        if (!pnr) {
            console.error(
                `Amadeus order succeeded but did not return a PNR for ${bookingReference}`
            )
            throw new Error('Amadeus order succeeded but did not return a PNR.')
        }

        // Extract e-ticket numbers (if available)
        const eTicketNumbers =
            orderResponse.data?.ticketingDetails?.tickets?.map(
                (ticket) => ticket.ticketNumber
            ) || null
        console.log(
            `E-ticket numbers: ${
                eTicketNumbers ? eTicketNumbers.join(', ') : 'None'
            }`
        )

        // Update database with confirmed status, PNR, and e-ticket numbers
        await connection.execute(
            'UPDATE flight_bookings SET status = ?, pnr = ?, e_ticket_numbers = ? WHERE booking_reference = ?',
            [
                'CONFIRMED_TICKETED',
                pnr,
                eTicketNumbers ? JSON.stringify(eTicketNumbers) : null,
                bookingReference,
            ]
        )
        console.log(
            `✅ Database updated for ${bookingReference}. Status: CONFIRMED_TICKETED, PNR: ${pnr}, E-tickets: ${
                eTicketNumbers ? eTicketNumbers.join(', ') : 'None'
            }`
        )

        await connection.commit()

        // Send confirmation email
        try {
            await sendConfirmationEmail(bookingReference)
            console.log(`✅ Confirmation email sent for ${bookingReference}`)
        } catch (emailError) {
            console.error(
                `Warning: Failed to send confirmation email for ${bookingReference}:`,
                emailError
            )
            // Continue despite email failure
        }

        return { pnr, eTicketNumbers, status: 'CONFIRMED_TICKETED' }
    } catch (error) {
        // Log detailed Amadeus errors if available
        if (error.response?.data?.errors) {
            console.error(
                `Amadeus API errors for ${bookingReference}:`,
                JSON.stringify(error.response.data.errors, null, 2)
            )
        }

        console.error(
            `❌ CRITICAL FAILURE during finalization for ${bookingReference}:`,
            error.message || error.description
        )

        try {
            // Update database with failed status
            await connection.execute(
                "UPDATE flight_bookings SET status = 'TICKETING_FAILED' WHERE booking_reference = ?",
                [bookingReference]
            )
            console.log(
                `Database updated for ${bookingReference}. Status: TICKETING_FAILED`
            )

            // Attempt refund if stripe_checkout_id exists
            if (booking && booking.stripe_checkout_id) {
                const session = await stripe.checkout.sessions.retrieve(
                    booking.stripe_checkout_id
                )
                const paymentIntentId = session.payment_intent

                if (paymentIntentId && session.payment_status === 'paid') {
                    await stripe.refunds.create({
                        payment_intent: paymentIntentId,
                    })
                    console.log(
                        `✅ Stripe refund issued for failed booking ${bookingReference}`
                    )
                } else {
                    console.log(
                        `No refund needed for ${bookingReference}: Payment not completed`
                    )
                }
            }

            // Send failure email
            try {
                await sendFailureEmail(bookingReference)
                console.log(`✅ Failure email sent for ${bookingReference}`)
            } catch (emailError) {
                console.error(
                    `Warning: Failed to send failure email for ${bookingReference}:`,
                    emailError
                )
            }
        } catch (refundOrDbError) {
            console.error(
                `❌ CRITICAL: AUTOMATED REFUND OR DB UPDATE FAILED for ${bookingReference}:`,
                refundOrDbError
            )
        }

        throw new Error(
            `Failed to finalize booking: ${
                error.response?.data?.errors
                    ? JSON.stringify(error.response.data.errors)
                    : error.message || 'Unknown error'
            }`
        )
    } finally {
        // Release connection
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
