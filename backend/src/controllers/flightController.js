// import { amadeus } from '../config/amadeus.js'

// export const searchFlights = async (req, res) => {
//     const { tripType, date, origin, destination, adultCount, childCount } =
//         req.body
//     const tripTypeValue =
//         typeof tripType === 'string' ? tripType : tripType?.value

//     console.log(
//         tripType.value,
//         `${date}`,
//         origin.value,
//         destination.value,
//         adultCount,
//         childCount
//     )

//     if (!tripTypeValue) {
//         return res.status(400).json({ error: 'Invalid trip type' })
//     }

//     try {
//         if (tripTypeValue === 'one-way') {
//             const flightResponse =
//                 await amadeus.shopping.flightOffersSearch.get({
//                     originLocationCode: origin.value,
//                     destinationLocationCode: destination.value,
//                     departureDate: `${date}`,
//                     adults: `${adultCount}`,
//                 })
//             console.log('✅ Amadeus success response:', flightResponse)
//             res.status(200).json({
//                 flights: {
//                     outbound: flightResponse.data,
//                 },
//             })
//         } else {
//         }
//     } catch (error) {
//         return res.status(500).json({
//             error: 'Amadeus API error',
//             details: error.message,
//         })
//     }
// }

import { amadeus } from '../config/amadeus.js'
import { mockFlightOffers } from '../mock/flightResultMockData.js'

export const searchFlights = async (req, res) => {
    const { tripType, date, origin, destination, adultCount, childCount } =
        req.body

    const tripTypeValue =
        typeof tripType === 'string' ? tripType : tripType?.value

    if (!tripTypeValue) {
        return res.status(400).json({ error: 'Invalid trip type' })
    }

    console.log('🔍 Search Params:', {
        tripType: tripTypeValue,
        date,
        origin: origin?.value,
        destination: destination?.value,
        adultCount,
        childCount,
    })

    try {
        if (tripTypeValue === 'one-way') {
            // 🔧 STUB RESPONSE (disable real API)
            console.log('🛑 Amadeus API call disabled — returning mock data')

            return res.status(200).json({
                outbound: mockFlightOffers.data,
            })
        } else {
            return res.status(400).json({ error: 'Round-trip not implemented' })
        }
    } catch (error) {
        console.error('❌ Amadeus API error:', error)
        return res.status(500).json({
            error: 'Amadeus API error',
            details: error.message,
        })
    }
}
