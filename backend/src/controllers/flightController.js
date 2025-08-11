import { amadeus } from '../config/amadeus.js'

export const searchFlights = async (req, res) => {
    const { tripType, date, origin, destination, travelerCount, cabinClass } =
        req.body

    const tripTypeValue =
        typeof tripType === 'string' ? tripType : tripType?.value
    const cabinClassValue =
        typeof cabinClass === 'string' ? cabinClass : cabinClass?.value
    const originCode = origin?.value
    const destinationCode = destination?.value

    // Validate required fields
    if (!tripTypeValue || !['one-way', 'round-trip'].includes(tripTypeValue)) {
        return res.status(400).json({ error: 'Invalid or missing trip type' })
    }

    if (!originCode || !destinationCode) {
        return res
            .status(400)
            .json({ error: 'Origin and destination are required' })
    }

    if (!travelerCount?.adults || travelerCount.adults < 1) {
        return res
            .status(400)
            .json({ error: 'At least one adult traveler is required' })
    }

    if (!cabinClassValue) {
        return res.status(400).json({ error: 'Cabin class is required' })
    }

    try {
        if (tripTypeValue === 'one-way') {
            const flightResponse =
                await amadeus.shopping.flightOffersSearch.get({
                    originLocationCode: originCode,
                    destinationLocationCode: destinationCode,
                    departureDate: date,
                    adults: travelerCount.adults,
                    children: travelerCount.children,
                    travelClass: cabinClassValue,
                    currencyCode: 'PHP',
                })
            res.status(200).json({
                flights: {
                    outbound: flightResponse.data,
                },
            })
        } else {
            const flightResponse =
                await amadeus.shopping.flightOffersSearch.get({
                    originLocationCode: originCode,
                    destinationLocationCode: destinationCode,
                    departureDate: date[0],
                    returnDate: date[1],
                    adults: travelerCount.adults,
                    children: travelerCount.children,
                    travelClass: cabinClassValue,
                    currencyCode: 'PHP',
                })
            res.status(200).json({
                flights: {
                    outbound: flightResponse.data,
                },
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Amadeus API error',
            details: error.message,
        })
    }
}