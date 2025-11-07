import { query } from '../config/db.js'
import { supabase } from '../config/supabaseClient.js'
import { v4 as uuidv4 } from 'uuid'
import stripe from '../config/stripe.js'
import {
    amadeus,
    logAmadeusError,
    logAmadeusSuccess,
} from '../config/amadeus.js'
import { checkBookingStatus } from '../services/bookingService.js'
import { autoAssignBooking } from '../services/assignmentService.js'

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

        // Validate search criteria matches passenger count
        const { adults, children } = searchCriteria.travelerCount || {}
        const totalPassengers = (adults || 0) + (children || 0)
        const actualPassengers = passengerDetails.travelers.length

        if (totalPassengers !== actualPassengers) {
            console.error(
                `❌ Passenger count mismatch: Search criteria has ${totalPassengers} passengers, but ${actualPassengers} provided`
            )
            return res.status(400).json({
                error: 'Passenger count mismatch. Please ensure all passengers are properly filled out.',
                details: {
                    expected: totalPassengers,
                    provided: actualPassengers,
                    searchCriteria: searchCriteria.travelerCount,
                },
            })
        }

        // Price the flight offer with retry logic (NO ORDER CREATION YET!)
        console.log('Attempting to price flight offer...')
        let priceCheckResponse
        let confirmedFlightOffer = flightOffer
        const maxPricingRetries = 2
        let pricingRetryCount = 0

        while (pricingRetryCount <= maxPricingRetries) {
            try {
                const pricingData = {
                    data: {
                        type: 'flight-offers-pricing',
                        flightOffers: [flightOffer],
                    },
                }

                console.log(
                    `[FLIGHT BOOKING] Pricing attempt ${pricingRetryCount + 1} for flight ${flightOffer.id}`
                )

                priceCheckResponse =
                    await amadeus.shopping.flightOffers.pricing.post(
                        pricingData
                    )

                // Log successful pricing response
                logAmadeusSuccess(
                    'flightOffers.pricing.post',
                    priceCheckResponse,
                    {
                        originalPrice: flightOffer.price?.total,
                        flightOfferId: flightOffer.id,
                    }
                )

                confirmedFlightOffer = priceCheckResponse.data.flightOffers?.[0]
                if (!confirmedFlightOffer) {
                    console.error(
                        '[FLIGHT BOOKING] Pricing failed: No flight offer returned'
                    )
                    return res.status(400).json({
                        error: 'Flight no longer available, please choose another flight',
                    })
                }
                console.log(
                    `[FLIGHT BOOKING] ✅ Price confirmed: ${confirmedFlightOffer.price.total} ${confirmedFlightOffer.price.currency}`
                )
                break // Success, exit retry loop
            } catch (amadeusError) {
                // Enhanced error logging for pricing failures
                const errorInfo = logAmadeusError(
                    'flightOffers.pricing.post',
                    amadeusError,
                    {
                        flightOfferId: flightOffer.id,
                        originalPrice: flightOffer.price?.total,
                        travelerCount: passengerDetails.travelers.length,
                    }
                )

                // Handle ServerError (500) - usually temporary Amadeus issues
                if (
                    amadeusError.code === 'ServerError' ||
                    amadeusError.response?.status === 500
                ) {
                    if (pricingRetryCount < maxPricingRetries) {
                        console.log(
                            `[FLIGHT BOOKING] Server error, retrying in 2s... (${pricingRetryCount + 1}/${maxPricingRetries})`
                        )
                        pricingRetryCount++
                        await new Promise((resolve) =>
                            setTimeout(resolve, 2000)
                        ) // Wait 2 seconds
                        continue
                    } else {
                        return res.status(503).json({
                            error: 'Flight booking service temporarily unavailable',
                            details:
                                'The flight booking service is experiencing technical difficulties. Please try again in a few minutes.',
                            errorCode: amadeusError.code,
                            suggestion:
                                'Please try again later or contact support if the issue persists',
                        })
                    }
                }

                if (amadeusError.response?.data?.errors) {
                    const errors = amadeusError.response.data.errors

                    // Handle Amadeus system errors (test environment issues)
                    const systemError = errors.find((err) => err.code === 141)
                    if (systemError) {
                        console.error(
                            '[FLIGHT BOOKING] Amadeus system error detected:',
                            systemError
                        )
                        return res.status(503).json({
                            error: 'Flight booking service temporarily unavailable',
                            details:
                                'The flight booking service is experiencing technical difficulties. Please try again in a few minutes.',
                            errorCode: systemError.code,
                            suggestion:
                                'Please try again later or contact support if the issue persists',
                        })
                    }

                    const unavailabilityError = errors.find(
                        (err) =>
                            err.code === 34651 ||
                            err.title.includes('SEGMENT SELL FAILURE')
                    )
                    if (unavailabilityError) {
                        console.error(
                            '[FLIGHT BOOKING] Segment sell failure detected:',
                            unavailabilityError
                        )
                        return res.status(400).json({
                            error: 'Flight no longer available, please choose another flight',
                            errorCode: unavailabilityError.code,
                            errorDetail: unavailabilityError.detail,
                        })
                    }
                }
                throw new Error(
                    `Amadeus pricing failed: ${
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

        // Create flight booking record FIRST with PENDING_PAYMENT status (before Stripe session)
        // This ensures the booking exists before payment can be processed
        let bookingData
        try {
            const { data: insertedBooking, error } = await supabase
                .from('flight_bookings')
                .insert({
                    booking_reference: bookingReference,
                    status: 'PENDING_PAYMENT',
                    amadeus_flight_offer: confirmedFlightOffer,
                    passenger_details: passengerDetails,
                    total_amount: totalAmount,
                    currency: currency,
                    search_criteria: searchCriteria,
                    stripe_checkout_id: null, // Will be updated after Stripe session creation
                    e_ticket_numbers: null,
                    amadeus_order_id: null,
                    ticketing_deadline: null,
                    ticketed_at: null,
                    cancelled_at: null,
                    cancellation_reason: null,
                    amadeus_cancellation_status: 'NOT_APPLICABLE',
                })
                .select()
                .single()

            if (error) {
                throw new Error(`Database insert error: ${error.message}`)
            }

            bookingData = insertedBooking
            console.log(
                `✅ Flight booking created: ${bookingReference} (ID: ${bookingData.id})`
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

        // Create Stripe checkout session AFTER booking is created
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
                cancel_url: `${process.env.FRONTEND_URL}/flight-booking/cancel?returned_from_payment=true`,
                metadata: {
                    booking_reference: bookingReference,
                    product_type: 'FLIGHT',
                    // Only store essential data in Stripe metadata (under 500 char limit)
                    total_amount: totalAmount.toString(),
                    currency: currency,
                    passenger_count:
                        passengerDetails.travelers.length.toString(),
                },
            })

            // Update booking with Stripe session ID
            const { error: updateError } = await supabase
                .from('flight_bookings')
                .update({ stripe_checkout_id: session.id })
                .eq('booking_reference', bookingReference)

            if (updateError) {
                console.error(
                    `⚠️ Failed to update booking with Stripe session ID: ${updateError.message}`
                )
                // Don't fail - booking exists, just log the warning
            }
        } catch (stripeError) {
            console.error('Stripe session creation failed:', stripeError)
            // Cleanup: Mark booking as failed since Stripe session creation failed
            try {
                await supabase
                    .from('flight_bookings')
                    .update({ status: 'BOOKING_FAILED' })
                    .eq('booking_reference', bookingReference)
                console.log(
                    `⚠️ Booking ${bookingReference} marked as BOOKING_FAILED due to Stripe error`
                )
            } catch (cleanupError) {
                console.error(
                    `❌ Failed to cleanup booking after Stripe error:`,
                    cleanupError
                )
            }
            throw new Error(`Stripe error: ${stripeError.message}`)
        }

        console.log(
            `✅ Booking initiated successfully for ${bookingReference} - Awaiting payment`
        )
        res.status(200).json({
            checkoutUrl: session.url,
            bookingReference: bookingReference,
            status: 'PENDING_PAYMENT',
        })
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

// Keep existing functions unchanged for now
export const cancelFlightBooking = async (req, res) => {
    const { booking_reference } = req.query
    if (!booking_reference) {
        return res.status(400).json({ error: 'Booking reference is required' })
    }

    try {
        const { data, error: dbError } = await supabase
            .from('flight_bookings')
            .select(
                'stripe_checkout_id, total_amount, status, amadeus_order_id'
            )
            .eq('booking_reference', booking_reference)
            .single()

        if (dbError || !data) {
            return res
                .status(404)
                .json({ error: `Booking ${booking_reference} not found` })
        }
        const { stripe_checkout_id, total_amount, status, amadeus_order_id } =
            data

        if (status === 'CANCELLED' || status.includes('TICKETING_FAILED')) {
            return res.status(400).json({
                error: `Booking ${booking_reference} is already cancelled or failed`,
            })
        }

        // Cancel with Amadeus if order exists and booking is not just pending payment
        if (amadeus_order_id && status !== 'PENDING_PAYMENT') {
            try {
                await amadeus.booking.flightOrder(amadeus_order_id).delete()
                console.log(`✅ Amadeus order ${amadeus_order_id} cancelled`)

                // Update cancellation status
                await supabase
                    .from('flight_bookings')
                    .update({ amadeus_cancellation_status: 'SUCCESS' })
                    .eq('booking_reference', booking_reference)
            } catch (amadeusError) {
                console.warn(
                    'Amadeus cancellation failed:',
                    amadeusError.message
                )

                // Update cancellation status
                await supabase
                    .from('flight_bookings')
                    .update({ amadeus_cancellation_status: 'FAILED' })
                    .eq('booking_reference', booking_reference)

                // Continue with database cancellation even if Amadeus fails
            }
        }

        // Handle refund based on status
        if (stripe_checkout_id && status === 'PENDING_PAYMENT') {
            // For pending payment, no refund needed (payment not processed yet)
            console.log(
                `No refund needed for ${booking_reference} - payment not processed`
            )
        } else if (stripe_checkout_id) {
            // For other statuses, issue refund (but per non-refundable policy, this might be 0)
            console.log(
                `Refund processing for ${booking_reference} - amount: ${total_amount}`
            )
            // Note: Per non-refundable policy, this might be 0 or partial
        }

        // Update database status
        const { error: updateError } = await supabase
            .from('flight_bookings')
            .update({
                status: 'CANCELLED',
                cancelled_at: new Date().toISOString(),
            })
            .eq('booking_reference', booking_reference)

        if (updateError) {
            throw new Error(`Database update error: ${updateError.message}`)
        }
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
        const { status, searchCriteria } =
            await checkBookingStatus(booking_reference)
        res.status(200).json({ status, searchCriteria })
    } catch (error) {
        console.error(`Failed to get status for ${booking_reference}:`, error)
        res.status(400).json({
            error: `Failed to get booking status: ${error.message}`,
        })
    }
}
