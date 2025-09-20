import { amadeus } from '../config/amadeus.js'
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

export const trackBookingStatus = async (req, res) => {
    try {
        const { bookingReference, bookingType } = req.query

        const { data, error } = await supabase
            .from(
                bookingType === 'flight' ? 'flight_bookings' : 'tour_bookings'
            )
            .select('*')
            .eq('booking_reference', bookingReference)
            .single()

        if (error || !data) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        const airlineCode = data.amadeus_flight_offer.validatingAirlineCodes[0]

        let bookingData = null

        if (bookingType === 'flight') {
            const flightOffer =
                typeof data.amadeus_flight_offer === 'string'
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
                    inbound:
                        allSegments.length > 1
                            ? {
                                  departure: formatPoint(lastSeg.departure),
                                  arrival: formatPoint(lastSeg.arrival),
                              }
                            : null,
                }
            }
        } else if (bookingType === 'tour') {
            // TODO: handle tour booking status
        }

        res.status(200).json({ bookingReference, bookingData, airlineCode })
    } catch (err) {
        console.error('Error in trackBookingStatus:', err)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
