import { query } from '../config/db.js'
import { v4 as uuidv4 } from 'uuid'
import stripe from '../config/stripe.js'
import { amadeus } from '../config/amadeus.js'
import { checkBookingStatus } from '../services/bookingService.js'

export const initiateFlightBooking = async (req, res) => {
    try {
        const { flightOffer, passengerDetails, searchCriteria } = req.body

        // Validate request body
        if (
            !flightOffer ||
            !passengerDetails ||
            !passengerDetails.travelers ||
            !Array.isArray(passengerDetails.travelers) ||
            passengerDetails.travelers.length === 0 ||
            !searchCriteria
        ) {
            console.error(
                'Validation failed: Missing or invalid flight, passenger, or search details'
            )
            return res.status(400).json({
                error: 'Missing or invalid flight, passenger, or search details',
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
                return res.status(400).json({
                    error: `Missing required fields for traveler ${index + 1}`,
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
                return res.status(400).json({
                    error: `At least one contact method is required for traveler ${
                        index + 1
                    }`,
                })
            }
            if (
                traveler.contact?.phones?.length &&
                (!traveler.contact.phones[0]?.countryCallingCode ||
                    !/^\d+$/.test(
                        traveler.contact.phones[0].countryCallingCode
                    ))
            ) {
                console.error(
                    `Validation failed: Invalid countryCallingCode for traveler ${
                        index + 1
                    }`
                )
                return res.status(400).json({
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
                return res.status(400).json({
                    error: `Passport holder field must be true for traveler ${
                        index + 1
                    }`,
                })
            }
        }

        // Price the flight offer
        console.log('Attempting to price flight offer...')
        let priceCheckResponse
        let confirmedFlightOffer = flightOffer
        try {
            priceCheckResponse =
                await amadeus.shopping.flightOffers.pricing.post({
                    data: {
                        type: 'flight-offers-pricing',
                        flightOffers: [flightOffer],
                    },
                })
            confirmedFlightOffer = priceCheckResponse.data.flightOffers?.[0]
            if (!confirmedFlightOffer) {
                console.error('Pricing failed: No flight offer returned')
                return res.status(400).json({
                    error: 'Flight no longer available, please choose another flight',
                })
            }
            console.log(
                `✅ Price confirmed. Original: ${flightOffer.price.total}, Confirmed: ${confirmedFlightOffer.price.total}`
            )
        } catch (amadeusError) {
            console.error(
                'Pricing error:',
                amadeusError.response?.data || amadeusError
            )
            if (amadeusError.response?.data?.errors) {
                const errors = amadeusError.response.data.errors
                const unavailabilityError = errors.find(
                    (err) =>
                        err.code === 34651 ||
                        err.title.includes('SEGMENT SELL FAILURE')
                )
                if (unavailabilityError) {
                    return res.status(400).json({
                        error: 'Flight no longer available, please choose another flight',
                    })
                }
            }
            throw new Error(
                `Amadeus pricing failed: ${
                    amadeusError.message || 'Unknown error'
                }`
            )
        }

        // Create Amadeus order with retry logic
        console.log('Attempting to create Amadeus order...')
        let orderResponse
        let orderId
        const maxRetries = 2
        let retryCount = 0

        while (retryCount <= maxRetries) {
            try {
                orderResponse = await amadeus.booking.flightOrders.post({
                    data: {
                        type: 'flight-order',
                        flightOffers: [confirmedFlightOffer],
                        travelers: passengerDetails.travelers,
                        remarks: passengerDetails.remarks || undefined,
                        ticketingAgreement:
                            passengerDetails.ticketingAgreement || undefined,
                        contacts: passengerDetails.contacts || undefined,
                    },
                })
                orderId = orderResponse.data?.id
                if (!orderId) {
                    throw new Error(
                        'Amadeus order succeeded but did not return an order ID'
                    )
                }
                console.log(
                    `✅ Amadeus order created successfully with ID: ${orderId}`
                )
                break
            } catch (amadeusError) {
                console.error(
                    `Order creation error (attempt ${retryCount + 1}):`,
                    amadeusError.response?.data || amadeusError
                )
                if (amadeusError.response?.data?.errors) {
                    const errors = amadeusError.response.data.errors
                    const unavailabilityError = errors.find(
                        (err) =>
                            err.code === 34651 ||
                            err.title.includes('SEGMENT SELL FAILURE')
                    )
                    if (unavailabilityError && retryCount < maxRetries) {
                        console.log(
                            `Retrying pricing due to unavailability error...`
                        )
                        retryCount++
                        try {
                            priceCheckResponse =
                                await amadeus.shopping.flightOffers.pricing.post(
                                    {
                                        data: {
                                            type: 'flight-offers-pricing',
                                            flightOffers: [
                                                confirmedFlightOffer,
                                            ],
                                        },
                                    }
                                )
                            confirmedFlightOffer =
                                priceCheckResponse.data.flightOffers?.[0]
                            if (!confirmedFlightOffer) {
                                console.error(
                                    'Retry pricing failed: No flight offer returned'
                                )
                                return res.status(400).json({
                                    error: 'Flight no longer available, please choose another flight',
                                })
                            }
                            console.log(
                                `✅ Retry price confirmed. Confirmed: ${confirmedFlightOffer.price.total}`
                            )
                            continue
                        } catch (retryError) {
                            console.error(
                                'Retry pricing failed:',
                                retryError.response?.data || retryError
                            )
                            return res.status(400).json({
                                error: 'Flight no longer available, please choose another flight',
                            })
                        }
                    }
                    if (unavailabilityError) {
                        return res.status(400).json({
                            error: 'Flight no longer available, please choose another flight',
                        })
                    }
                }
                throw new Error(
                    `Amadeus order creation failed: ${
                        amadeusError.message || 'Unknown error'
                    }`
                )
            }
        }

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
        const bookingReference = `TRB-FLT-${uuidv4().slice(0, 8)}`

        try {
            await query(
                `INSERT INTO flight_bookings (
                    booking_reference, 
                    status, 
                    amadeus_flight_offer, 
                    passenger_details, 
                    total_amount, 
                    currency,
                    e_ticket_numbers,
                    amadeus_order_id,
                    search_criteria
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    bookingReference,
                    'PENDING_PAYMENT',
                    JSON.stringify(confirmedFlightOffer),
                    JSON.stringify(passengerDetails),
                    totalAmount,
                    currency,
                    null,
                    orderId,
                    JSON.stringify(searchCriteria),
                ]
            )
        } catch (dbError) {
            console.error('Database insertion failed:', dbError)
            throw new Error(`Database error: ${dbError.message}`)
        }

        const routeSummary = flightOffer.itineraries
            .map((itin) => {
                const firstSeg = itin.segments[0]
                const lastSeg = itin.segments[itin.segments.length - 1]
                return `${firstSeg.departure.iataCode} → ${lastSeg.arrival.iataCode}`
            })
            .join(' / ')

        // Create Stripe checkout session
        let session
        try {
            session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: currency.toLowerCase(),
                            product_data: {
                                name: `Flight ${routeSummary}`,
                                description:
                                    'Flight booking with Lindela Travel and Tours',
                            },
                            unit_amount: Math.round(totalAmount * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL}/flight-booking/success?session_id={CHECKOUT_SESSION_ID}&booking_reference=${bookingReference}`,
                cancel_url: `${process.env.FRONTEND_URL}/flight-booking/cancel?booking_reference=${bookingReference}`,
                metadata: {
                    booking_reference: bookingReference,
                    amadeus_order_id: orderId,
                },
            })
        } catch (stripeError) {
            console.error('Stripe session creation failed:', stripeError)
            throw new Error(`Stripe error: ${stripeError.message}`)
        }

        // Update booking with Stripe session ID
        try {
            await query(
                'UPDATE flight_bookings SET stripe_checkout_id = ? WHERE booking_reference = ?',
                [session.id, bookingReference]
            )
        } catch (dbError) {
            console.error('Database update failed:', dbError)
            throw new Error(`Database error: ${dbError.message}`)
        }

        console.log(`✅ Booking initiated successfully for ${bookingReference}`)
        res.status(200).json({ checkoutUrl: session.url })
    } catch (error) {
        console.error(
            `Insert booking failed for ${
                req.body?.bookingReference || 'unknown'
            }:`,
            error.message || error
        )
        return res.status(400).json({
            error: `Booking failed: ${error.message || 'Unknown error'}`,
        })
    }
}

export const cancelFlightBooking = async (req, res) => {
    const { booking_reference } = req.query
    if (!booking_reference) {
        return res.status(400).json({ error: 'Booking reference is required' })
    }

    try {
        const result = await query(
            'SELECT stripe_checkout_id, total_amount, status FROM flight_bookings WHERE booking_reference = ?',
            [booking_reference]
        )
        if (!result.rows.length) {
            return res
                .status(404)
                .json({ error: `Booking ${booking_reference} not found` })
        }
        const { stripe_checkout_id, total_amount, status } = result.rows[0]
        if (status === 'CANCELLED' || status.includes('TICKETING_FAILED')) {
            return res.status(400).json({
                error: `Booking ${booking_reference} is already cancelled or failed`,
            })
        }
        if (stripe_checkout_id) {
            await stripe.refunds.create({
                checkout_session: stripe_checkout_id,
                amount: Math.round(total_amount * 100),
            })
            console.log(`Refund issued for ${booking_reference}`)
        }
        await query(
            'UPDATE flight_bookings SET status = ? WHERE booking_reference = ?',
            ['CANCELLED', booking_reference]
        )
        console.log(`Booking ${booking_reference} cancelled successfully`)
        res.status(200).json({ message: 'Booking cancelled successfully' })
    } catch (error) {
        console.error(`Cancellation failed for ${booking_reference}:`, error)
        res.status(400).json({
            error: `Failed to cancel booking: ${error.message}`,
        })
    }
}

export const getBookingStatus = async (req, res) => {
    const { booking_reference } = req.query
    if (!booking_reference) {
        return res.status(400).json({ error: 'Booking reference is required' })
    }

    try {
        const { status, searchCriteria } = await checkBookingStatus(
            booking_reference
        )
        res.status(200).json({ status, searchCriteria })
    } catch (error) {
        console.error(`Failed to get status for ${booking_reference}:`, error)
        res.status(400).json({
            error: `Failed to get booking status: ${error.message}`,
        })
    }
}
