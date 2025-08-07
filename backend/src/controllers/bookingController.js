import pool from '../config/db.js'
import { v4 as uuidv4 } from 'uuid'
import stripe from '../config/stripe.js'
import { amadeus } from '../config/amadeus.js'

export const initiateFlightBooking = async (req, res) => {
    let connection
    try {
        const { flightOffer, passengerDetails } = req.body

        // Validate request body
        if (
            !flightOffer ||
            !passengerDetails ||
            !passengerDetails.travelers ||
            !Array.isArray(passengerDetails.travelers) ||
            passengerDetails.travelers.length === 0
        ) {
            console.error(
                'Validation failed: Missing or invalid flight or passenger details'
            )
            return res
                .status(400)
                .json({
                    error: 'Missing or invalid flight or passenger details',
                })
        }

        // Validate required traveler fields
        for (const [index, traveler] of passengerDetails.travelers.entries()) {
            if (
                !traveler.id ||
                !traveler.dateOfBirth ||
                !traveler.name?.firstName ||
                !traveler.name?.lastName
            ) {
                console.error(
                    `Validation failed: Missing required fields for traveler ${
                        index + 1
                    }`
                )
                return res
                    .status(400)
                    .json({
                        error: `Missing required fields for traveler ${
                            index + 1
                        }`,
                    })
            }
            if (
                !traveler.contact?.emailAddress &&
                (!traveler.contact?.phones?.length ||
                    !traveler.contact.phones[0]?.number)
            ) {
                console.error(
                    `Validation failed: No contact method for traveler ${
                        index + 1
                    }`
                )
                return res
                    .status(400)
                    .json({
                        error: `At least one contact method is required for traveler ${
                            index + 1
                        }`,
                    })
            }
            if (
                !traveler.contact?.phones[0]?.countryCallingCode ||
                !/^\d+$/.test(traveler.contact.phones[0].countryCallingCode)
            ) {
                console.error(
                    `Validation failed: Invalid countryCallingCode for traveler ${
                        index + 1
                    }`
                )
                return res
                    .status(400)
                    .json({
                        error: `Country calling code must be digits only (e.g., 34) for traveler ${
                            index + 1
                        }`,
                    })
            }
            if (
                traveler.documents?.[0]?.documentType === 'PASSPORT' &&
                traveler.documents[0].holder !== true
            ) {
                console.error(
                    `Validation failed: Passport holder field missing or invalid for traveler ${
                        index + 1
                    }`
                )
                return res
                    .status(400)
                    .json({
                        error: `Passport holder field must be true for traveler ${
                            index + 1
                        }`,
                    })
            }
        }

        // Get a connection from the pool
        connection = await pool.getConnection()

        // Price the flight offer
        console.log('Attempting to price flight offer...')
        const priceCheckResponse =
            await amadeus.shopping.flightOffers.pricing.post({
                data: {
                    type: 'flight-offers-pricing',
                    flightOffers: [flightOffer],
                },
            })

        const confirmedFlightOffer = priceCheckResponse.data.flightOffers?.[0]
        if (!confirmedFlightOffer) {
            console.error('Pricing failed: No flight offer returned')
            throw new Error('Flight offer pricing failed')
        }

        console.log(
            `✅ Price confirmed. Original: ${flightOffer.price.total}, Confirmed: ${confirmedFlightOffer.price.total}`
        )

        // Validate total_amount and currency
        const totalAmount = parseFloat(confirmedFlightOffer.price.total)
        if (isNaN(totalAmount)) {
            console.error('Invalid total_amount: Not a valid number')
            throw new Error('Invalid total amount')
        }
        const currency = confirmedFlightOffer.price.currency || 'PHP'
        if (!currency || currency.length !== 3) {
            console.error('Invalid currency: Must be a 3-letter code')
            throw new Error('Invalid currency code')
        }

        // Generate booking reference
        const bookingReference = `TRB-FLT-${uuidv4()}`

        // Insert booking into database
        await connection.execute(
            `INSERT INTO flight_bookings (
                booking_reference, 
                status, 
                amadeus_flight_offer, 
                passenger_details, 
                total_amount, 
                currency,
                e_ticket_numbers
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                bookingReference,
                'PENDING_PAYMENT',
                JSON.stringify(confirmedFlightOffer),
                JSON.stringify(passengerDetails),
                totalAmount,
                currency,
                null,
            ]
        )

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: `Flight from 
                                ${flightOffer.itineraries[0].segments[0].departure.iataCode} 
                                to 
                                ${flightOffer.itineraries[0].segments[0].arrival.iataCode}`,
                            description:
                                'Flight booking with Lindela Travel and Tours',
                        },
                        unit_amount: Math.round(totalAmount * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/flight-booking/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/`,
            metadata: {
                booking_reference: bookingReference,
            },
        })

        // Update booking with Stripe session ID
        await connection.execute(
            'UPDATE flight_bookings SET stripe_checkout_id = ? WHERE booking_reference = ?',
            [session.id, bookingReference]
        )

        await connection.commit()

        console.log(`✅ Booking initiated successfully for ${bookingReference}`)
        res.status(200).json({ checkoutUrl: session.url })
    } catch (error) {
        console.error(
            `Insert booking failed for ${
                req.body?.bookingReference || 'unknown'
            }:`,
            error.message || error.description
        )
        if (connection) {
            await connection.rollback()
        }
        res.status(500).json({ error: error.message || 'Server error' })
    } finally {
        if (connection) {
            try {
                await connection.release()
                console.log(`Database connection released`)
            } catch (releaseError) {
                console.error(
                    'Error releasing database connection:',
                    releaseError
                )
            }
        }
    }
}
