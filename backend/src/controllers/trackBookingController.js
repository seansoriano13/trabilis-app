import { amadeus, logAmadeusError, logAmadeusSuccess } from '../config/amadeus.js'
import { supabase } from '../config/supabaseClient.js'
import dayjs from 'dayjs'

const qualifierMap = {
    STD: 'Scheduled',
    STA: 'Scheduled',
    ATD: 'Departed',
    ATA: 'Arrived',
    ETD: 'Estimated',
    ETA: 'Estimated',
}

function formatPoint(point) {
    if (!point) return null
    const dateTime = point.at || point.value // support both segment + schedule API
    return {
        iata: point.iataCode || null,
        date: dayjs(dateTime).format('ddd DD MMM YYYY'),
        time: dayjs(dateTime).format('HH:mm'),
        terminal: point.terminal || null,
        status: point.qualifier
            ? qualifierMap[point.qualifier] || 'Unknown'
            : 'Scheduled',
    }
}

async function fetchLiveFlightData(amadeusOrderId) {
    try {
        console.log(`[TRACK BOOKING] Fetching live data for order: ${amadeusOrderId}`)
        const response = await amadeus.booking.flightOrder(amadeusOrderId).get()
        const order = response.data
        
        logAmadeusSuccess('booking.flightOrder.get', response, {
            orderId: amadeusOrderId
        })
        
        // Extract flight segments from live order
        const flightOffer = order.flightOffers?.[0]
        if (!flightOffer) {
            console.warn('[TRACK BOOKING] No flight offers in Amadeus response')
            return null
        }
        
        const allSegments = flightOffer.itineraries.flatMap(itin => itin.segments)
        
        if (allSegments.length > 0) {
            const firstSeg = allSegments[0]
            const lastSeg = allSegments.at(-1)
            
            return {
                outbound: {
                    departure: formatPoint(firstSeg.departure),
                    arrival: formatPoint(firstSeg.arrival),
                },
                inbound: allSegments.length > 1 ? {
                    departure: formatPoint(lastSeg.departure),
                    arrival: formatPoint(lastSeg.arrival),
                } : null,
                source: 'live', // Indicate this is live data
                lastUpdated: new Date().toISOString()
            }
        }
        
        return null
    } catch (error) {
        console.warn('[TRACK BOOKING] Failed to fetch live data from Amadeus:', error.message)
        logAmadeusError('booking.flightOrder.get', error, {
            orderId: amadeusOrderId
        })
        return null
    }
}

export const trackBookingStatus = async (req, res) => {
    try {
        const { bookingReference, bookingType } = req.query

        const isFlight = bookingType === 'flight'

        const { data, error } = await supabase
            .from(isFlight ? 'flight_bookings' : 'tour_bookings')
            .select(
                isFlight
                    ? '*'
                    : `
                        *,
                        package_dates (
                            start_date,
                            end_date,
                            tour_packages (
                                title
                            )
                        )
                    `
            )
            .eq('booking_reference', bookingReference)
            .single()

        if (error || !data) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        const airlineCode = isFlight
            ? data.amadeus_flight_offer?.validatingAirlineCodes?.[0]
            : null

        let bookingData = null

        if (isFlight) {
            // Try to fetch live data from Amadeus first
            let liveData = null
            if (data.amadeus_order_id) {
                liveData = await fetchLiveFlightData(data.amadeus_order_id)
            }
            
            if (liveData) {
                // Use live data from Amadeus
                console.log('[TRACK BOOKING] Using live Amadeus data')
                bookingData = liveData
            } else {
                // Fallback to database data
                console.log('[TRACK BOOKING] Using database fallback data')
                const flightOffer = typeof data.amadeus_flight_offer === 'string'
                    ? JSON.parse(data.amadeus_flight_offer)
                    : data.amadeus_flight_offer

                const allSegments = flightOffer.itineraries.flatMap(
                    (itinerary) => itinerary.segments
                )

                if (allSegments.length > 0) {
                    const firstSeg = allSegments[0]
                    const lastSeg = allSegments.at(-1)

                    bookingData = {
                        outbound: {
                            departure: formatPoint(firstSeg.departure),
                            arrival: formatPoint(firstSeg.arrival),
                        },
                        inbound: allSegments.length > 1 ? {
                            departure: formatPoint(lastSeg.departure),
                            arrival: formatPoint(lastSeg.arrival),
                        } : null,
                        source: 'database', // Indicate this is cached data
                        lastUpdated: data.updated_at || data.created_at
                    }
                }
            }
        } else if (bookingType === 'tour') {
            bookingData = {
                tour: {
                    title: data.package_dates?.tour_packages?.title || null,
                    start_date: data.package_dates?.start_date || null,
                    end_date: data.package_dates?.end_date || null,
                    status: data.status || null,
                    passenger_count: data.passenger_count || null,
                    total_amount: data.total_amount || null,
                    payment_type: data.payment_type || null,
                    flight_details: data.flight_details || null,
                    booking_reference: data.booking_reference || null,
                    lead_first_name: data.lead_first_name || null,
                    lead_last_name: data.lead_last_name || null,
                    lead_email: data.lead_email || null,
                    lead_phone: data.lead_phone || null,
                },
            }
        }

        res.status(200).json({ bookingReference, bookingData, airlineCode })
    } catch (err) {
        console.error('Error in trackBookingStatus:', err)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
