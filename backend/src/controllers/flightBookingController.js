import { query } from '../config/db.js'
import { supabase } from '../config/supabaseClient.js'
import { v4 as uuidv4 } from 'uuid'
import stripe from '../config/stripe.js'
import { amadeus } from '../config/amadeus.js'
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
            console.error(`❌ Passenger count mismatch: Search criteria has ${totalPassengers} passengers, but ${actualPassengers} provided`)
            return res.status(400).json({
                error: 'Passenger count mismatch. Please ensure all passengers are properly filled out.',
                details: {
                    expected: totalPassengers,
                    provided: actualPassengers,
                    searchCriteria: searchCriteria.travelerCount
                }
            })
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
        
        // Ensure travelers match the flight offer pricing structure
        const flightOfferTravelers = confirmedFlightOffer.travelerPricings || []
        console.log('Flight offer traveler pricings:', flightOfferTravelers.map((p, i) => ({ 
            index: i, 
            travelerType: p.travelerType, 
            price: p.price?.total 
        })))
        console.log('Our travelers:', passengerDetails.travelers.map((t, i) => ({ 
            index: i, 
            type: t.type, 
            id: t.id 
        })))
        console.log('Search criteria traveler count:', searchCriteria.travelerCount)
        console.log('Original flight offer traveler pricings count:', flightOffer.travelerPricings?.length || 0)
        console.log('Original flight offer traveler types:', flightOffer.travelerPricings?.map(p => p.travelerType) || [])
        console.log('Search criteria breakdown:', {
            adults: searchCriteria.travelerCount?.adults || 0,
            children: searchCriteria.travelerCount?.children || 0,
            total: (searchCriteria.travelerCount?.adults || 0) + (searchCriteria.travelerCount?.children || 0)
        })
        
        // Define our traveler types first
        const ourTravelerTypes = [...new Set(passengerDetails.travelers.map(t => t.type === 'CHILD' ? 'CHILD' : 'ADULT'))]
        
        // Check if the original flight offer had the right structure
        if (flightOffer.travelerPricings && flightOffer.travelerPricings.length > 0) {
            const originalTypes = flightOffer.travelerPricings.map(p => p.travelerType)
            const expectedTypes = ourTravelerTypes
            const missingInOriginal = expectedTypes.filter(type => !originalTypes.includes(type))
            
            if (missingInOriginal.length > 0) {
                console.warn(`⚠️ Original flight offer missing traveler types: ${missingInOriginal.join(', ')}`)
                console.warn('This suggests the flight search may not have included all passenger types')
            }
        }
        
        // Validate that we have pricing for all traveler types
        const pricingTypes = [...new Set(flightOfferTravelers.map(p => p.travelerType))]
        console.log('Our traveler types:', ourTravelerTypes)
        console.log('Pricing types available:', pricingTypes)
        
        const missingTypes = ourTravelerTypes.filter(type => !pricingTypes.includes(type))
        if (missingTypes.length > 0) {
            console.error(`❌ Flight offer missing pricing for traveler types: ${missingTypes.join(', ')}`)
            console.error('This flight may not support the requested passenger types or the search criteria may be incorrect.')
            
            // Provide a more user-friendly error message
            const missingTypesText = missingTypes.map(type => 
                type === 'CHILD' ? 'children' : type.toLowerCase() + 's'
            ).join(' and ')
            
            return res.status(400).json({
                error: `This flight does not support ${missingTypesText}. Please select a different flight or adjust your passenger selection.`,
                details: {
                    missingTypes,
                    availableTypes: pricingTypes,
                    suggestion: 'Try searching for flights that support your passenger mix',
                    searchCriteria: searchCriteria.travelerCount,
                    action: 'Please go back and search for flights with the correct passenger mix'
                }
            })
        }
        
        // Match travelers to pricing by type rather than index
        const amadeusTravelers = passengerDetails.travelers.map((traveler, index) => {
            // Find pricing that matches this traveler's type
            const pricing = flightOfferTravelers.find(p => 
                p.travelerType === (traveler.type === 'CHILD' ? 'CHILD' : 'ADULT')
            )
            
            if (!pricing) {
                console.error(`No pricing found for traveler type: ${traveler.type}`)
                console.error('Available pricing types:', flightOfferTravelers.map(p => p.travelerType))
                throw new Error(`No pricing found for traveler ${index + 1} (${traveler.type})`)
            }
            
            // Build Amadeus-compatible traveler structure
            const amadeusTraveler = {
                id: traveler.id,
                dateOfBirth: traveler.dateOfBirth,
                name: traveler.name,
                gender: traveler.gender
            }

            // Add contact information
            if (traveler.contact) {
                amadeusTraveler.contact = traveler.contact
            }

            // Add documents only if they exist and are valid
            if (traveler.documents && traveler.documents.length > 0 && traveler.documents[0].number) {
                const doc = traveler.documents[0]
                amadeusTraveler.documents = [{
                    documentType: doc.documentType || 'PASSPORT',
                    birthPlace: doc.placeOfBirth || doc.birthPlace || '',
                    issuanceLocation: doc.issuanceLocation || doc.placeOfBirth || '',
                    issuanceDate: doc.issuanceDate || '',
                    number: doc.number,
                    expiryDate: doc.expiryDate || '',
                    issuanceCountry: doc.issuanceCountry || '',
                    validityCountry: doc.validityCountry || doc.issuanceCountry || '',
                    nationality: doc.nationality || '',
                    holder: doc.holder !== undefined ? doc.holder : true
                }]
            }

            return amadeusTraveler
        })
        
        console.log(`Sending ${amadeusTravelers.length} travelers to Amadeus`)
        console.log('Final Amadeus travelers structure:', amadeusTravelers.map(t => ({
            id: t.id,
            name: t.name,
            gender: t.gender,
            hasContact: !!t.contact?.emailAddress,
            hasDocuments: !!t.documents?.[0]?.number,
            documentNumber: t.documents?.[0]?.number || 'N/A'
        })))
        
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
                        travelers: amadeusTravelers,
                        remarks: passengerDetails.remarks || {
                            general: [
                                {
                                    subType: 'GENERAL_MISCELLANEOUS',
                                    text: 'ONLINE BOOKING FROM TRABILIS TRAVEL - Terms and Conditions: All Guests must present valid identification at check-in. Check-in begins 3 hours prior to flight and closes 75 minutes prior to departure. Carriage subject to conditions of carriage. Transportation subject to conditions of contract. Warsaw Convention may apply for international travel. Please check figures/timings as they may change without notice. For Infants valid birth certificate is required.'
                                }
                            ]
                        },
                        ticketingAgreement: passengerDetails.ticketingAgreement || {
                            option: 'DELAY_TO_CANCEL',
                            delay: '6D'
                        },
                        contacts: passengerDetails.contacts || [
                            {
                                addresseeName: {
                                    firstName: 'LINDELA',
                                    lastName: 'TRAVEL AND TOURS'
                                },
                                companyName: 'Lindela Travel And Tours',
                                purpose: 'STANDARD',
                                phones: [
                                    {
                                        deviceType: 'MOBILE',
                                        countryCallingCode: '63',
                                        number: '9296106660'
                                    }
                                ],
                                emailAddress: 'lindelatravelandtours@gmail.com',
                                address: {
                                    lines: ['Unit 2215 Cityland 10 Tower II, H. V. Dela Costa Street'],
                                    postalCode: '1227',
                                    cityName: 'Makati',
                                    stateName: 'Metro Manila',
                                    countryCode: 'PH'
                                }
                            }
                        ],
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
                
                // Log detailed error information for debugging
                if (amadeusError.response?.data?.errors) {
                    const errors = amadeusError.response.data.errors
                    console.error('Detailed Amadeus errors:', errors)
                    
                    // Handle specific error codes
                    const errorCode = errors[0]?.code
                    const errorTitle = errors[0]?.title
                    const errorDetail = errors[0]?.detail
                    
                    if (errorCode === 34651) {
                        console.error('Segment sell failure - could not sell segment')
                        return res.status(400).json({
                            error: 'Flight segment unavailable. This flight segment is no longer available for booking.',
                            details: {
                                code: errorCode,
                                title: errorTitle,
                                detail: errorDetail,
                                suggestion: 'Please select a different flight or try again later'
                            }
                        })
                    }
                    
                    if (errorCode === 34652) {
                        console.error('Flight offer expired or no longer available')
                        return res.status(400).json({
                            error: 'Flight offer expired. This flight is no longer available for booking.',
                            details: {
                                code: errorCode,
                                title: errorTitle,
                                detail: errorDetail,
                                suggestion: 'Please search for new flights and try again'
                            }
                        })
                    }
                    
                    if (errorCode === 34653) {
                        console.error('Insufficient seats available')
                        return res.status(400).json({
                            error: 'Insufficient seats. Not enough seats available for your booking.',
                            details: {
                                code: errorCode,
                                title: errorTitle,
                                detail: errorDetail,
                                suggestion: 'Please try with fewer passengers or select a different flight'
                            }
                        })
                    }
                    
                    // Check for traveler pricing errors specifically
                    const travelerErrors = errors.filter(err => 
                        err.code === 4926 || 
                        err.detail?.includes('traveler') ||
                        err.detail?.includes('priced')
                    )
                    if (travelerErrors.length > 0) {
                        console.error('Traveler pricing errors:', travelerErrors)
                        console.error('Current travelers being sent:', amadeusTravelers.map(t => ({
                            id: t.id,
                            travelerType: t.travelerType,
                            type: t.type,
                            hasContact: !!t.contact?.emailAddress
                        })))
                    }
                    
                    // Generic Amadeus error handling for unhandled codes
                    if (![34651, 34652, 34653, 4926].includes(errorCode)) {
                        console.error(`Unhandled Amadeus error code: ${errorCode}`)
                        return res.status(400).json({
                            error: `Booking failed: ${errorTitle || 'Unknown error'}`,
                            details: {
                                code: errorCode,
                                title: errorTitle,
                                detail: errorDetail,
                                suggestion: 'Please try a different flight or contact support'
                            }
                        })
                    }
                    
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
                            
                            // Rebuild travelers for retry
                            const retryFlightOfferTravelers = confirmedFlightOffer.travelerPricings || []
                            const retryAmadeusTravelers = passengerDetails.travelers.map((traveler, index) => {
                                // Find pricing that matches this traveler's type
                                const pricing = retryFlightOfferTravelers.find(p => 
                                    p.travelerType === (traveler.type === 'CHILD' ? 'CHILD' : 'ADULT')
                                )
                                
                                if (!pricing) {
                                    console.error(`No pricing found for traveler type: ${traveler.type} on retry`)
                                    console.error('Available pricing types:', retryFlightOfferTravelers.map(p => p.travelerType))
                                    throw new Error(`No pricing found for traveler ${index + 1} (${traveler.type}) on retry`)
                                }
                                
                                // Build Amadeus-compatible traveler structure
                                const amadeusTraveler = {
                                    id: traveler.id,
                                    dateOfBirth: traveler.dateOfBirth,
                                    name: traveler.name,
                                    gender: traveler.gender
                                }

                                // Add contact information
                                if (traveler.contact) {
                                    amadeusTraveler.contact = traveler.contact
                                }

                                // Add documents only if they exist and are valid
                                if (traveler.documents && traveler.documents.length > 0 && traveler.documents[0].number) {
                                    const doc = traveler.documents[0]
                                    amadeusTraveler.documents = [{
                                        documentType: doc.documentType || 'PASSPORT',
                                        birthPlace: doc.placeOfBirth || doc.birthPlace || '',
                                        issuanceLocation: doc.issuanceLocation || doc.placeOfBirth || '',
                                        issuanceDate: doc.issuanceDate || '',
                                        number: doc.number,
                                        expiryDate: doc.expiryDate || '',
                                        issuanceCountry: doc.issuanceCountry || '',
                                        validityCountry: doc.validityCountry || doc.issuanceCountry || '',
                                        nationality: doc.nationality || '',
                                        holder: doc.holder !== undefined ? doc.holder : true
                                    }]
                                }

                                return amadeusTraveler
                            })
                            amadeusTravelers.splice(0, amadeusTravelers.length, ...retryAmadeusTravelers)
                            
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

        let bookingId
        try {
            const { data: bookingData, error } = await supabase
                .from('flight_bookings')
                .insert({
                    booking_reference: bookingReference,
                    status: 'PENDING_PAYMENT',
                    amadeus_flight_offer: confirmedFlightOffer,
                    passenger_details: passengerDetails,
                    total_amount: totalAmount,
                    currency: currency,
                    e_ticket_numbers: null,
                    amadeus_order_id: orderId,
                    search_criteria: searchCriteria
                })
                .select()
                .single()

            if (error) {
                throw new Error(`Database insert error: ${error.message}`)
            }

            bookingId = bookingData.id

            // Auto-assign booking to accounting staff
            try {
                const assignmentResult = await autoAssignBooking('flight', bookingId)
                if (assignmentResult.success) {
                    console.log(`Flight booking ${bookingId} auto-assigned to ${assignmentResult.assignedStaff.name}`)
                } else {
                    console.warn(`Failed to auto-assign flight booking ${bookingId}:`, assignmentResult.error)
                }
            } catch (assignmentError) {
                console.error('Auto-assignment error:', assignmentError)
                // Don't fail the booking creation if auto-assignment fails
            }

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
            const { error } = await supabase
                .from('flight_bookings')
                .update({ stripe_checkout_id: session.id })
                .eq('booking_reference', bookingReference)

            if (error) {
                throw new Error(`Database update error: ${error.message}`)
            }
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
        const { data, error: dbError } = await supabase
            .from('flight_bookings')
            .select('stripe_checkout_id, total_amount, status')
            .eq('booking_reference', booking_reference)
            .single()

        if (dbError || !data) {
            return res
                .status(404)
                .json({ error: `Booking ${booking_reference} not found` })
        }
        const { stripe_checkout_id, total_amount, status } = data
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
        const { error: updateError } = await supabase
            .from('flight_bookings')
            .update({ status: 'CANCELLED' })
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
