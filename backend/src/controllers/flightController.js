import { amadeus } from '../config/amadeus.js'

export const searchFlights = async (req, res) => {
    const { tripType, date, origin, destination, travelerCount, cabinClass } =
        req.body
    const tripTypeValue =
        typeof tripType === 'string' ? tripType : tripType?.value

    if (!tripTypeValue) {
        return res.status(400).json({ error: 'Invalid trip type' })
    }

    try {
        if (tripTypeValue === 'one-way') {
            console.log('🔍 Search Params(oneway):', {
                originLocationCode: origin.value,
                destinationLocationCode: destination.value,
                departureDate: date,
                adults: travelerCount.adults,
                children: travelerCount.children,
                travelClass: cabinClass.value,
                currencyCode: 'PHP',
            })
            // const flightResponse =
            //     await amadeus.shopping.flightOffersSearch.get({
            //         originLocationCode: origin.value,
            //         destinationLocationCode: destination.value,
            //         departureDate: date,
            //         adults: travelerCount.adults,
            //         children: travelerCount.children,
            //         travelClass: cabinClass.value,
            //         currencyCode: 'PHP',
            //     })
            console.log(
                '✅ Amadeus success response (one-way):'
            )
            res.status(200).json({
                flights: {
                    outbound: flightResponse.data,
                },
            })
        } else {
            console.log('🔍 Search Params(roundtrip):', {
                tripType: tripType.value,
                originLocationCode: origin.value,
                destinationLocationCode: destination.value,
                departureDate: date[0],
                returnDate: date[1],
                adults: travelerCount.adults,
                children: travelerCount.children,
                travelClass: cabinClass.value,
                currencyCode: 'PHP',
            })
            // const flightResponse =
            //     await amadeus.shopping.flightOffersSearch.get({
            //         originLocationCode: origin.value,
            //         destinationLocationCode: destination.value,
            //         departureDate: date[0],
            //         returnDate: date[1],
            //         adults: travelerCount.adults,
            //         children: travelerCount.children,
            //         travelClass: cabinClass.value,
            //         currencyCode: 'PHP',
            //     })
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
