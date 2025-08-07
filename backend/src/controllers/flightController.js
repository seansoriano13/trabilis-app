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
            console.log('🔍 Search Params(oneway):', {
                originLocationCode: originCode,
                destinationLocationCode: destinationCode,
                departureDate: date,
                adults: travelerCount.adults,
                children: travelerCount.children,
                travelClass: cabinClassValue,
                currencyCode: 'PHP',
            })

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

            console.log('✅ Amadeus success response (one-way):')
            res.status(200).json({
                flights: {
                    outbound: flightResponse.data,
                },
            })
        } else {
            console.log('🔍 Search Params(roundtrip):', {
                originLocationCode: originCode,
                destinationLocationCode: destinationCode,
                departureDate: date[0],
                returnDate: date[1],
                adults: travelerCount.adults,
                children: travelerCount.children,
                travelClass: cabinClassValue,
                currencyCode: 'PHP',
            })

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

            console.log('✅ Amadeus success response(round-trip):')
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

// import { mockFlightOffers } from '../mock/flightResultMockData.js'
// import { flightResultMockDataOneWay } from '../mock/flightResultMockDataOneWay.js'

// export const searchFlights = async (req, res) => {
//     const { tripType, date, origin, destination, travelerCount, cabinClass } =
//         req.body

//     const tripTypeValue =
//         typeof tripType === 'string' ? tripType : tripType?.value

//     if (!tripTypeValue) {
//         return res.status(400).json({ error: 'Invalid trip type' })
//     }

//     try {
//         // 🛑 Amadeus API call disabled — returning mock data
//         console.log('🛑 Amadeus API call disabled — returning mock data')

//         const outboundFlights = []
//         const inboundFlights = []

//         for (const offer of flightResultMockDataOneWay.data) {
//             const { itineraries } = offer

//             if (itineraries.length >= 1) {
//                 outboundFlights.push({
//                     ...offer,
//                     direction: 'outbound',
//                     segments: itineraries[0].segments,
//                 })
//             }

//             if (tripTypeValue === 'round-trip' && itineraries.length >= 2) {
//                 inboundFlights.push({
//                     ...offer,
//                     direction: 'inbound',
//                     segments: itineraries[1].segments,
//                 })
//             }
//         }

//         return res.status(200).json({
//             flights: {
//                 outbound: outboundFlights,
//                 ...(tripTypeValue === 'round-trip' && {
//                     inbound: inboundFlights,
//                 }),
//             },
//         })
//     } catch (error) {
//         console.error('❌ Amadeus API error:', error)
//         return res.status(500).json({
//             error: 'Amadeus API error',
//             details: error.message,
//         })
//     }
// }
