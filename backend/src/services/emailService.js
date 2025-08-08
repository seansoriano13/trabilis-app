import pool from '../config/db.js'

/**
 * Simulates sending a final booking confirmation email to the customer.
 * For now, it logs to the console.
 * In the future, this is where Nodemailer and PDFKit logic will go.
 * @param {string} bookingReference - The reference of the booking to confirm.
 * @throws {Error} If the booking is not found or required data is missing.
 */
export const sendConfirmationEmail = async (bookingReference) => {
    console.log(
        `--- Preparing to send CONFIRMATION email for ${bookingReference}... ---`
    )

    let connection
    try {
        connection = await pool.getConnection()

        // Fetch booking details including flight offer, PNR, and e-ticket numbers
        const [rows] = await connection.execute(
            'SELECT passenger_details, pnr, e_ticket_numbers, amadeus_flight_offer FROM flight_bookings WHERE booking_reference = ?',
            [bookingReference]
        )

        if (rows.length === 0) {
            console.error(
                `EMAIL_SERVICE_ERROR: Could not find booking ${bookingReference} to send confirmation.`
            )
            throw new Error(`Booking ${bookingReference} not found`)
        }

        const booking = rows[0]
        let passengerDetails, flightOffer
        try {
            passengerDetails = JSON.parse(booking.passenger_details)
            flightOffer = JSON.parse(booking.amadeus_flight_offer)
        } catch (parseError) {
            console.error(
                `Error parsing booking data for ${bookingReference}:`,
                parseError
            )
            throw new Error(
                `Invalid booking data format: ${parseError.message}`
            )
        }

        const travelers = passengerDetails.travelers || []
        if (!travelers.length) {
            console.error(
                `No travelers found in passenger_details for ${bookingReference}`
            )
            throw new Error(`No travelers found for ${bookingReference}`)
        }

        const leadPassenger = travelers[0] // Assume first traveler is lead
        const pnr = booking.pnr || 'Pending'
        const eTicketNumbers = booking.e_ticket_numbers
            ? JSON.parse(booking.e_ticket_numbers)
            : null

        // Construct flight itinerary summary
        const itinerarySummary =
            flightOffer.itineraries
                ?.map((itinerary, index) => {
                    const segments = itinerary.segments
                        .map((segment) => {
                            return `${segment.departure.iataCode} to ${segment.arrival.iataCode} on ${segment.departure.at} (${segment.carrierCode} ${segment.number})`
                        })
                        .join(', ')
                    return `Flight ${index + 1}: ${segments}`
                })
                .join('\n') || 'Flight details unavailable'

        // Simulated email content
        console.log(`
            ==================================================
            EMAIL TO: ${leadPassenger.contact.emailAddress}
            SUBJECT: ✅ Your Flight Booking is Confirmed! (Ref: ${bookingReference})
            --------------------------------------------------
            Hello ${leadPassenger.name.firstName} ${
            leadPassenger.name.lastName
        },

            Great news! Your flight booking with Lindela Travel and Tours is confirmed.

            **Booking Reference**: ${bookingReference}
            **Passenger Name Record (PNR)**: ${pnr}
            **E-Ticket Numbers**: ${
                eTicketNumbers ? eTicketNumbers.join(', ') : 'Pending issuance'
            }

            **Travelers**:
            ${travelers
                .map((t, i) => `- ${t.name.firstName} ${t.name.lastName}`)
                .join('\n')}

            **Itinerary**:
            ${itinerarySummary}

            You can use the PNR to manage your booking directly on the airline's website.

            Your official e-ticket and itinerary PDF will be attached to this email once available.
            (PDF generation will be implemented soon!)

            Thank you for booking with us!

            Sincerely,
            The Lindela Team
            ==================================================
        `)
    } catch (error) {
        console.error(
            `❌ FAILED to send confirmation email for ${bookingReference}:`,
            error
        )
        throw error // Propagate error to caller
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

/**
 * Simulates sending a booking failure and refund notification email.
 * @param {object} params - Email parameters including email, firstName, lastName, bookingReference, and searchCriteria.
 * @throws {Error} If required data is missing.
 */
export const sendFailureEmail = async ({
    email,
    firstName,
    lastName,
    bookingReference,
    searchCriteria,
}) => {
    console.log(
        `--- Preparing to send FAILURE email for ${bookingReference}... ---`
    )

    try {
        // Simulated email content
        console.log(`
            ==================================================
            EMAIL TO: ${email}
            SUBJECT: ❗ Important Update Regarding Your Flight Booking (Ref: ${bookingReference})
            --------------------------------------------------
            Hello ${firstName} ${lastName},

            We are writing to inform you that there was an issue processing your flight booking (Ref: ${bookingReference}).
            Unfortunately, we were unable to confirm your ticket with the airline at this time. This can sometimes happen due to last-second availability changes.

            Please be assured that a FULL REFUND for your payment has already been processed via Stripe. You should see it reflected on your statement within 5-10 business days.

            We sincerely apologize for this inconvenience. Please feel free to try booking again or contact our support team at support@lindelatravel.com for assistance.

            Sincerely,
            The Lindela Team
            ==================================================
        `)
    } catch (error) {
        console.error(
            `❌ FAILED to send failure email for ${bookingReference}:`,
            error
        )
        throw error // Propagate error to caller
    }
}
