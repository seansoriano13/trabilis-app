import { supabase } from '../config/supabaseClient.js'
import {
    amadeus,
    logAmadeusError,
    logAmadeusSuccess,
} from '../config/amadeus.js'
import stripe from '../config/stripe.js'
import { sendConfirmationEmail, sendFailureEmail } from './brevoEmailService.js'
import Pusher from 'pusher'

const pusher = new Pusher({
    appId: '2048372',
    key: '371c6201af1a663a4f58',
    secret: 'b4a5985ecd6d27690c8b',
    cluster: 'ap1',
    useTLS: true,
})

// Concurrent request protection
const processingBookings = new Set()

/**
 * Creates Amadeus order after successful payment
 * This function is called asynchronously from the Stripe webhook
 */
export async function createAmadeusOrder(bookingReference) {
    console.log(
        `🚀 Starting Amadeus order creation for booking: ${bookingReference}`
    )

    // Check if already processing
    if (processingBookings.has(bookingReference)) {
        throw new Error(
            `Order creation already in progress for ${bookingReference}`
        )
    }

    // Add to processing set
    processingBookings.add(bookingReference)

    try {
        // 1. Atomic status check and update to prevent race conditions
        const { data: booking, error: updateError } = await supabase
            .from('flight_bookings')
            .update({
                status: 'PROCESSING_ORDER',
                processing_started_at: new Date().toISOString(),
            })
            .eq('booking_reference', bookingReference)
            .eq('status', 'PAID_PENDING_BOOKING') // Only update if still in this status
            .select()
            .single()

        if (updateError || !booking) {
            throw new Error(
                `Booking ${bookingReference} is not in PAID_PENDING_BOOKING status or already being processed`
            )
        }

        // 3. Re-price flight offer (prices may have changed since initial pricing)
        console.log(
            `[AMADEUS ORDER] Re-pricing flight offer for ${bookingReference}`
        )
        let confirmedFlightOffer
        try {
            const pricingData = {
                data: {
                    type: 'flight-offers-pricing',
                    flightOffers: [booking.amadeus_flight_offer],
                },
            }

            const priceCheckResponse =
                await amadeus.shopping.flightOffers.pricing.post(pricingData)
            confirmedFlightOffer = priceCheckResponse.data.flightOffers?.[0]

            if (!confirmedFlightOffer) {
                throw new Error(
                    'Flight offer no longer available after re-pricing'
                )
            }

            logAmadeusSuccess(
                'flightOffers.pricing.post (re-pricing)',
                priceCheckResponse,
                {
                    bookingReference,
                    originalPrice: booking.amadeus_flight_offer?.price?.total,
                    newPrice: confirmedFlightOffer.price?.total,
                }
            )

            console.log(
                `[AMADEUS ORDER] ✅ Re-pricing successful: ${confirmedFlightOffer.price.total} ${confirmedFlightOffer.price.currency}`
            )
        } catch (pricingError) {
            console.error(
                `[AMADEUS ORDER] Re-pricing failed for ${bookingReference}:`,
                pricingError
            )
            logAmadeusError(
                'flightOffers.pricing.post (re-pricing)',
                pricingError,
                {
                    bookingReference,
                }
            )
            throw new Error(`Flight re-pricing failed: ${pricingError.message}`)
        }

        // 4. Prepare travelers for Amadeus order
        const flightOfferTravelers = confirmedFlightOffer.travelerPricings || []
        const ourTravelerTypes = [
            ...new Set(
                booking.passenger_details.travelers.map((t) =>
                    t.type === 'CHILD' ? 'CHILD' : 'ADULT'
                )
            ),
        ]

        // Validate that we have pricing for all traveler types
        const pricingTypes = [
            ...new Set(flightOfferTravelers.map((p) => p.travelerType)),
        ]
        const missingTypes = ourTravelerTypes.filter(
            (type) => !pricingTypes.includes(type)
        )

        if (missingTypes.length > 0) {
            throw new Error(
                `Flight offer missing pricing for traveler types: ${missingTypes.join(', ')}`
            )
        }

        // Build Amadeus travelers
        const amadeusTravelers = booking.passenger_details.travelers.map(
            (traveler, index) => {
                const pricing = flightOfferTravelers.find(
                    (p) =>
                        p.travelerType ===
                        (traveler.type === 'CHILD' ? 'CHILD' : 'ADULT')
                )

                if (!pricing) {
                    throw new Error(
                        `No pricing found for traveler type: ${traveler.type}`
                    )
                }

                const amadeusTraveler = {
                    id: traveler.id,
                    dateOfBirth: traveler.dateOfBirth,
                    name: traveler.name,
                    gender: traveler.gender,
                }

                // Add contact information
                if (traveler.contact) {
                    amadeusTraveler.contact = {
                        emailAddress: traveler.contact.emailAddress || '',
                        phones: traveler.contact.phones || [],
                        companyName: 'Amadeus',
                        address: {
                            lines: ['1 rue de Paris'],
                            postalCode: '1227',
                            cityName: 'Makati',
                            countryCode: 'PH',
                        },
                    }
                } else {
                    amadeusTraveler.contact = {
                        emailAddress: '',
                        phones: [],
                        companyName: 'Amadeus',
                        address: {
                            lines: ['1 rue de Paris'],
                            postalCode: '1227',
                            cityName: 'Makati',
                            countryCode: 'PH',
                        },
                    }
                }

                // Add documents for adults only
                if (traveler.type === 'ADULT') {
                    if (traveler.documents && traveler.documents.length > 0) {
                        const doc = traveler.documents[0]
                        amadeusTraveler.documents = [
                            {
                                documentType: doc.documentType || 'PASSPORT',
                                birthPlace:
                                    doc.placeOfBirth || doc.birthPlace || '',
                                issuanceLocation:
                                    doc.issuanceLocation ||
                                    doc.placeOfBirth ||
                                    '',
                                issuanceDate: doc.issuanceDate || '',
                                number: doc.number || '',
                                expiryDate: doc.expiryDate || '',
                                issuanceCountry: doc.issuanceCountry || '',
                                validityCountry:
                                    doc.validityCountry ||
                                    doc.issuanceCountry ||
                                    '',
                                nationality: doc.nationality || '',
                                holder:
                                    doc.holder !== undefined
                                        ? doc.holder
                                        : true,
                            },
                        ]
                    } else {
                        amadeusTraveler.documents = [
                            {
                                documentType: 'PASSPORT',
                                birthPlace: '',
                                issuanceLocation: '',
                                issuanceDate: '',
                                number: '',
                                expiryDate: '',
                                issuanceCountry: '',
                                validityCountry: '',
                                nationality: '',
                                holder: true,
                            },
                        ]
                    }
                }

                return amadeusTraveler
            }
        )

        // 5. Create Amadeus order
        console.log(
            `[AMADEUS ORDER] Creating order for ${bookingReference} with ${amadeusTravelers.length} travelers`
        )

        const orderData = {
            data: {
                type: 'flight-order',
                flightOffers: [confirmedFlightOffer],
                travelers: amadeusTravelers,
                remarks: booking.passenger_details.remarks || {
                    general: [
                        {
                            subType: 'GENERAL_MISCELLANEOUS',
                            text: 'ONLINE BOOKING FROM TRABILIS TRAVEL - Terms and Conditions: All Guests must present valid identification at check-in. Check-in begins 3 hours prior to flight and closes 75 minutes prior to departure. Carriage subject to conditions of carriage. Transportation subject to conditions of contract. Warsaw Convention may apply for international travel. Please check figures/timings as they may change without notice. For Infants valid birth certificate is required.',
                        },
                    ],
                },
                ticketingAgreement: {
                    option: 'DELAY_TO_CANCEL',
                    delay: '6D',
                },
                contacts: booking.passenger_details.contacts,
            },
        }

        const orderResponse = await amadeus.booking.flightOrders.post(orderData)
        const orderId = orderResponse.data?.id

        if (!orderId) {
            throw new Error(
                'Amadeus order succeeded but did not return an order ID'
            )
        }

        logAmadeusSuccess('booking.flightOrders.post', orderResponse, {
            bookingReference,
            orderId,
            travelerCount: amadeusTravelers.length,
            totalPrice: confirmedFlightOffer.price?.total,
        })

        console.log(`[AMADEUS ORDER] ✅ Order created successfully: ${orderId}`)

        // 6. Extract PNR from order
        const pnr =
            orderResponse.data.associatedRecords?.find(
                (record) => record.originSystemCode === 'GDS'
            )?.reference || null

        // 7. Calculate ticketing deadline (6 days from now)
        const ticketingDeadline = new Date()
        ticketingDeadline.setDate(ticketingDeadline.getDate() + 6)

        // 8. Update booking with Amadeus order details
        const { error: finalUpdateError } = await supabase
            .from('flight_bookings')
            .update({
                status: 'BOOKED',
                amadeus_order_id: orderId,
                pnr: pnr,
                ticketing_deadline: ticketingDeadline.toISOString(),
                amadeus_flight_offer: confirmedFlightOffer, // Update with re-priced offer
                updated_at: new Date().toISOString(),
            })
            .eq('booking_reference', bookingReference)

        if (finalUpdateError) {
            throw new Error(
                `Database update error: ${finalUpdateError.message}`
            )
        }

        console.log(
            `[AMADEUS ORDER] ✅ Booking ${bookingReference} updated to BOOKED status`
        )

        // 9. Send confirmation email
        try {
            await sendConfirmationEmail(bookingReference)
            console.log(
                `[AMADEUS ORDER] ✅ Confirmation email sent for ${bookingReference}`
            )
        } catch (emailError) {
            console.error(
                `[AMADEUS ORDER] Failed to send confirmation email for ${bookingReference}:`,
                emailError
            )
            // Don't fail the whole process for email errors
        }

        // 10. Notify admin
        try {
            const { error: insertError } = await supabase
                .from('admin_notifications')
                .insert([
                    {
                        type: 'new_booking',
                        message: `New flight booking confirmed: ${bookingReference}`,
                        booking_reference: bookingReference,
                        pnr: pnr,
                        created_at: new Date().toISOString(),
                    },
                ])

            if (insertError) {
                console.error(
                    'Supabase insert error (admin notification):',
                    insertError.message
                )
            }

            await pusher.trigger('admin-notifications', 'new-booking', {
                bookingReference,
                pnr: pnr,
                status: 'BOOKED',
                needsTicketing: true,
            })

            console.log(
                `[AMADEUS ORDER] ✅ Admin notification sent for ${bookingReference}`
            )
        } catch (notificationError) {
            console.error(
                `[AMADEUS ORDER] Failed to send admin notification for ${bookingReference}:`,
                notificationError
            )
            // Don't fail the whole process for notification errors
        }

        console.log(
            `[AMADEUS ORDER] ✅ Successfully completed order creation for ${bookingReference}`
        )

        // Remove from processing set
        processingBookings.delete(bookingReference)

        return {
            success: true,
            orderId,
            pnr,
            ticketingDeadline: ticketingDeadline.toISOString(),
        }
    } catch (error) {
        console.error(
            `[AMADEUS ORDER] ❌ CRITICAL FAILURE for ${bookingReference}:`,
            error.message
        )

        // Handle failure: Issue refund and update status
        try {
            // First, try to rollback to PAID_PENDING_BOOKING if it was PROCESSING_ORDER
            await supabase
                .from('flight_bookings')
                .update({
                    status: 'PAID_PENDING_BOOKING', // Rollback to previous state
                    processing_started_at: null,
                })
                .eq('booking_reference', bookingReference)
                .eq('status', 'PROCESSING_ORDER')

            // Update booking status to failed
            const { error: failedUpdateError } = await supabase
                .from('flight_bookings')
                .update({
                    status: 'BOOKING_FAILED',
                    updated_at: new Date().toISOString(),
                })
                .eq('booking_reference', bookingReference)

            if (failedUpdateError) {
                console.error(
                    `[AMADEUS ORDER] Failed to update booking status to BOOKING_FAILED:`,
                    failedUpdateError
                )
            }

            // Get booking details for refund
            const { data: bookingData } = await supabase
                .from('flight_bookings')
                .select(
                    'stripe_checkout_id, total_amount, passenger_details, search_criteria'
                )
                .eq('booking_reference', bookingReference)
                .single()

            // Issue refund with proper error handling
            if (bookingData?.stripe_checkout_id) {
                try {
                    const refund = await stripe.refunds.create({
                        payment_intent: bookingData.stripe_checkout_id,
                        amount: Math.round(bookingData.total_amount * 100),
                        reason: 'requested_by_customer',
                        metadata: {
                            booking_reference: bookingReference,
                            reason: 'Amadeus order creation failed',
                        },
                    })

                    // Update booking with refund information
                    await supabase
                        .from('flight_bookings')
                        .update({
                            refund_id: refund.id,
                            refund_amount: refund.amount / 100,
                            refund_status: 'issued',
                        })
                        .eq('booking_reference', bookingReference)

                    console.log(
                        `[AMADEUS ORDER] ✅ Refund issued: ${refund.id} for ${bookingReference}`
                    )
                } catch (stripeError) {
                    console.error(
                        `[AMADEUS ORDER] ❌ Failed to issue refund for ${bookingReference}:`,
                        stripeError
                    )

                    // Critical: Manual intervention needed
                    await supabase.from('admin_notifications').insert({
                        type: 'refund_failed',
                        message: `URGENT: Failed to refund ${bookingReference}. Manual refund required.`,
                        booking_reference: bookingReference,
                        created_at: new Date().toISOString(),
                        priority: 'critical',
                    })
                }
            }

            // Send failure email
            try {
                const passengerDetails = bookingData?.passenger_details
                const searchCriteria = bookingData?.search_criteria
                const primaryTraveler = passengerDetails?.travelers?.[0]

                if (primaryTraveler) {
                    await sendFailureEmail({
                        email: primaryTraveler.contact?.emailAddress,
                        firstName: primaryTraveler.name?.firstName,
                        lastName: primaryTraveler.name?.lastName,
                        bookingReference,
                        searchCriteria,
                    })
                    console.log(
                        `[AMADEUS ORDER] ✅ Failure email sent for ${bookingReference}`
                    )
                }
            } catch (emailError) {
                console.error(
                    `[AMADEUS ORDER] Failed to send failure email for ${bookingReference}:`,
                    emailError
                )
            }
        } catch (rollbackError) {
            console.error(
                `[AMADEUS ORDER] Rollback failed for ${bookingReference}:`,
                rollbackError
            )
        }

        // Remove from processing set
        processingBookings.delete(bookingReference)

        throw new Error(`Failed to create Amadeus order: ${error.message}`)
    }
}

/**
 * Check if booking is approaching ticketing deadline
 */
export async function checkTicketingDeadlines() {
    try {
        const now = new Date()
        const urgentThreshold = new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48 hours from now

        // Find bookings approaching deadline
        const { data: urgentBookings } = await supabase
            .from('flight_bookings')
            .select('*')
            .eq('status', 'BOOKED')
            .lte('ticketing_deadline', urgentThreshold.toISOString())
            .is('ticketed_at', null) // Not yet ticketed

        if (urgentBookings && urgentBookings.length > 0) {
            console.log(
                `[TICKETING MONITOR] Found ${urgentBookings.length} urgent bookings`
            )

            // Notify admin about urgent bookings
            await pusher.trigger('admin-alerts', 'urgent-ticketing', {
                count: urgentBookings.length,
                bookings: urgentBookings.map((b) => ({
                    bookingReference: b.booking_reference,
                    deadline: b.ticketing_deadline,
                    hoursRemaining: Math.round(
                        (new Date(b.ticketing_deadline) - now) /
                            (1000 * 60 * 60)
                    ),
                })),
            })
        }

        return urgentBookings || []
    } catch (error) {
        console.error('[TICKETING MONITOR] Error checking deadlines:', error)
        return []
    }
}

/**
 * Mark expired bookings as EXPIRED status
 */
export async function markExpiredBookings() {
    try {
        const now = new Date()

        // Find expired bookings
        const { data: expiredBookings } = await supabase
            .from('flight_bookings')
            .select('*')
            .eq('status', 'BOOKED')
            .lt('ticketing_deadline', now.toISOString())
            .is('ticketed_at', null) // Not yet ticketed

        if (expiredBookings && expiredBookings.length > 0) {
            console.log(
                `[TICKETING MONITOR] Marking ${expiredBookings.length} bookings as EXPIRED`
            )

            // Update status to EXPIRED
            const { error } = await supabase
                .from('flight_bookings')
                .update({
                    status: 'EXPIRED',
                    updated_at: new Date().toISOString(),
                })
                .eq('status', 'BOOKED')
                .lt('ticketing_deadline', now.toISOString())
                .is('ticketed_at', null)

            if (error) {
                console.error(
                    '[TICKETING MONITOR] Failed to update expired bookings:',
                    error
                )
            } else {
                console.log(
                    `[TICKETING MONITOR] ✅ Updated ${expiredBookings.length} bookings to EXPIRED`
                )
            }
        }

        return expiredBookings || []
    } catch (error) {
        console.error(
            '[TICKETING MONITOR] Error marking expired bookings:',
            error
        )
        return []
    }
}
