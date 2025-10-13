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

            // Check if Amadeus returned flights
            if (!flightResponse.data || flightResponse.data.length === 0) {
                return res.status(404).json({
                    message: 'No flights found for the given criteria',
                    flights: { outbound: [] },
                })
            }

            // Filter flights that support the requested passenger mix
            const supportedFlights = flightResponse.data.filter(flight => {
                if (!flight.travelerPricings || flight.travelerPricings.length === 0) {
                    return false // Skip flights without pricing info
                }

                const availableTypes = flight.travelerPricings.map(p => p.travelerType)
                const requiredTypes = []
                
                // Add adult types
                for (let i = 0; i < travelerCount.adults; i++) {
                    requiredTypes.push('ADULT')
                }
                
                // Add child types
                for (let i = 0; i < (travelerCount.children || 0); i++) {
                    requiredTypes.push('CHILD')
                }

                // Check if all required types are available
                const uniqueRequiredTypes = [...new Set(requiredTypes)]
                const hasAllTypes = uniqueRequiredTypes.every(type => availableTypes.includes(type))
                
                if (!hasAllTypes) {
                    console.log(`Flight ${flight.id} filtered out - missing pricing for:`, 
                        uniqueRequiredTypes.filter(type => !availableTypes.includes(type)))
                }
                
                return hasAllTypes
            })

            console.log(`Search returned ${flightResponse.data.length} flights, ${supportedFlights.length} support passenger mix`)

            res.status(200).json({
                flights: {
                    outbound: supportedFlights,
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
            // Filter flights that support the requested passenger mix (round-trip)
            const supportedFlights = flightResponse.data.filter(flight => {
                if (!flight.travelerPricings || flight.travelerPricings.length === 0) {
                    return false // Skip flights without pricing info
                }

                const availableTypes = flight.travelerPricings.map(p => p.travelerType)
                const requiredTypes = []
                
                // Add adult types
                for (let i = 0; i < travelerCount.adults; i++) {
                    requiredTypes.push('ADULT')
                }
                
                // Add child types
                for (let i = 0; i < (travelerCount.children || 0); i++) {
                    requiredTypes.push('CHILD')
                }

                // Check if all required types are available
                const uniqueRequiredTypes = [...new Set(requiredTypes)]
                const hasAllTypes = uniqueRequiredTypes.every(type => availableTypes.includes(type))
                
                if (!hasAllTypes) {
                    console.log(`Round-trip flight ${flight.id} filtered out - missing pricing for:`, 
                        uniqueRequiredTypes.filter(type => !availableTypes.includes(type)))
                }
                
                return hasAllTypes
            })

            console.log(`Round-trip search returned ${flightResponse.data.length} flights, ${supportedFlights.length} support passenger mix`)

            res.status(200).json({
                flights: {
                    outbound: supportedFlights,
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
