import {
  amadeus,
  logAmadeusError,
  logAmadeusSuccess,
} from '../config/amadeus.js'
import { FLEX_SEARCH_MAX_DAYS } from '../config/flexSearch.js'
import { validateFlexibleDatesBody } from '../validators/flights.validators.js'
import { searchAcrossDates } from '../services/amadeus/flightSearchService.js'

// Enhanced search parameters logging
export const searchFlights = async (req, res) => {
  const { tripType, date, origin, destination, travelerCount, cabinClass } =
    req.body

  // Log incoming request parameters (simplified)
  console.log('[FLIGHT SEARCH] Request:', {
    tripType: typeof tripType === 'string' ? tripType : tripType?.value,
    date: Array.isArray(date) ? date : [date],
    origin: origin?.value,
    destination: destination?.value,
    travelers: `${travelerCount.adults}A${travelerCount.children}C`,
  })

  const tripTypeValue =
    typeof tripType === 'string' ? tripType : tripType?.value
  const cabinClassValue =
    typeof cabinClass === 'string' ? cabinClass : cabinClass?.value
  const originCode = origin?.value
  const destinationCode = destination?.value

  // Validate required fields
  if (!tripTypeValue || !['one-way', 'round-trip'].includes(tripTypeValue)) {
    console.error('[FLIGHT SEARCH] Validation failed: Invalid trip type', {
      tripTypeValue,
    })
    return res.status(400).json({ error: 'Invalid or missing trip type' })
  }

  if (!originCode || !destinationCode) {
    console.error(
      '[FLIGHT SEARCH] Validation failed: Missing origin/destination',
      { originCode, destinationCode }
    )
    return res
      .status(400)
      .json({ error: 'Origin and destination are required' })
  }

  if (!travelerCount?.adults || travelerCount.adults < 1) {
    console.error('[FLIGHT SEARCH] Validation failed: Invalid traveler count', {
      travelerCount,
    })
    return res
      .status(400)
      .json({ error: 'At least one adult traveler is required' })
  }

  if (!cabinClassValue) {
    console.error('[FLIGHT SEARCH] Validation failed: Missing cabin class', {
      cabinClassValue,
    })
    return res.status(400).json({ error: 'Cabin class is required' })
  }

  try {
    if (tripTypeValue === 'one-way') {
      console.log(
        '[FLIGHT SEARCH] Making one-way flight search request to Amadeus'
      )

      // Check if date is a range (contains comma) or single date
      const isDateRange = typeof date === 'string' && date.includes(',')

      const searchParams = {
        originLocationCode: originCode,
        destinationLocationCode: destinationCode,
        departureDate: date, // Can be single date or range like "2024-12-20,2024-12-27"
        adults: travelerCount.adults,
        children: travelerCount.children,
        travelClass: cabinClassValue,
        currencyCode: 'PHP',
      }

      const flightResponse = await amadeus.shopping.flightOffersSearch.get(
        searchParams
      )

      // // Log successful response
      // logAmadeusSuccess('flightOffersSearch.get', flightResponse, {
      //     searchType: 'one-way',
      //     origin: originCode,
      //     destination: destinationCode,
      //     date: date
      //     })

      // Check if Amadeus returned flights
      if (!flightResponse.data || flightResponse.data.length === 0) {
        console.warn(
          '[FLIGHT SEARCH] No flights found for criteria:',
          searchParams
        )
        return res.status(404).json({
          message: 'No flights found for the given criteria',
          flights: { outbound: [] },
        })
      }

      // Filter flights that support the requested passenger mix
      const supportedFlights = flightResponse.data.filter((flight) => {
        if (!flight.travelerPricings || flight.travelerPricings.length === 0) {
          return false // Skip flights without pricing info
        }

        const availableTypes = flight.travelerPricings.map(
          (p) => p.travelerType
        )
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
        const hasAllTypes = uniqueRequiredTypes.every((type) =>
          availableTypes.includes(type)
        )

        return hasAllTypes
      })

      console.log(
        `[FLIGHT SEARCH] Found ${flightResponse.data.length} flights, ${supportedFlights.length} support passenger mix`
      )

      res.status(200).json({
        flights: {
          outbound: supportedFlights,
        },
      })
    } else {
      console.log(
        '[FLIGHT SEARCH] Making round-trip flight search request to Amadeus'
      )

      const searchParams = {
        originLocationCode: originCode,
        destinationLocationCode: destinationCode,
        departureDate: date[0],
        returnDate: date[1],
        adults: travelerCount.adults,
        children: travelerCount.children,
        travelClass: cabinClassValue,
        currencyCode: 'PHP',
      }

      const flightResponse = await amadeus.shopping.flightOffersSearch.get(
        searchParams
      )

      // // Log successful response
      // logAmadeusSuccess('flightOffersSearch.get', flightResponse, {
      //     searchType: 'round-trip',
      //     origin: originCode,
      //     destination: destinationCode,
      //     departureDate: date[0],
      //     returnDate: date[1]
      // })

      // Ensure data exists
      if (!flightResponse.data || flightResponse.data.length === 0) {
        console.warn(
          '[FLIGHT SEARCH] Round-trip: No flights found for criteria:',
          searchParams
        )
        return res.status(404).json({
          message: 'No flights found for the given criteria',
          flights: { outbound: [] },
        })
      }

      // Filter flights that support the requested passenger mix (round-trip)
      const supportedFlights = flightResponse.data.filter((flight) => {
        if (!flight.travelerPricings || flight.travelerPricings.length === 0) {
          return false // Skip flights without pricing info
        }

        const availableTypes = flight.travelerPricings.map(
          (p) => p.travelerType
        )
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
        const hasAllTypes = uniqueRequiredTypes.every((type) =>
          availableTypes.includes(type)
        )

        return hasAllTypes
      })

      console.log(
        `[FLIGHT SEARCH] Round-trip: ${flightResponse.data.length} flights, ${supportedFlights.length} support passenger mix`
      )

      res.status(200).json({
        flights: {
          outbound: supportedFlights,
        },
      })
    }
  } catch (error) {
    // Enhanced error logging
    const errorInfo = logAmadeusError('flightOffersSearch.get', error, {
      searchParams: {
        tripType: tripTypeValue,
        origin: originCode,
        destination: destinationCode,
        date: Array.isArray(date) ? date : [date],
        travelerCount,
        cabinClass: cabinClassValue,
      },
    })

    // Return appropriate error response based on error type
    if (error.response?.status === 400) {
      console.error(
        '[FLIGHT SEARCH] Bad request error - likely invalid search parameters'
      )
      return res.status(400).json({
        error: 'Invalid search parameters',
        details: error.response?.data?.errors || error.message,
      })
    } else if (error.response?.status === 401) {
      console.error(
        '[FLIGHT SEARCH] Authentication error - check Amadeus API credentials'
      )
      return res.status(500).json({
        error: 'API authentication failed',
        details: 'Please contact support',
      })
    } else if (error.response?.status === 429) {
      console.error('[FLIGHT SEARCH] Rate limit exceeded')
      return res.status(429).json({
        error: 'Too many requests',
        details: 'Please try again later',
      })
    } else {
      console.error('[FLIGHT SEARCH] Unexpected error occurred')
      return res.status(500).json({
        error: 'Amadeus API error',
        details: error.message,
        errorId: errorInfo.timestamp,
      })
    }
  }
}

// Get flexible flight dates using optimized batch approach
export const getFlexibleFlightDates = async (req, res) => {
  const { error, value } = validateFlexibleDatesBody(req.body)
  if (error) {
    return res.status(400).json({ error: error.message })
  }
  const {
    origin,
    destination,
    departureDate,
    travelerCount,
    cabinClass,
    window,
  } = value

  // Log incoming request parameters
  console.log('[FLEXIBLE DATES API] Request received:', {
    origin,
    destination,
    departureDate,
    travelerCount,
    cabinClass,
    timestamp: new Date().toISOString(),
  })

  // Input validated by validator above

  try {
    console.log('[FLEXIBLE DATES API] Using optimized batch search approach')

    const { dates, results } = await searchAcrossDates({
      origin,
      destination,
      departureDate,
      travelerCount,
      cabinClass,
      window,
    })

    console.log(
      `[FLEXIBLE DATES API] Completed: ${
        results.filter((r) => r.price).length
      }/${results.length} dates have prices`
    )

    res.status(200).json({
      data: results.map((r) => ({
        type: 'flight-offer',
        origin,
        destination,
        departureDate: r.date,
        returnDate: null,
        price: r.price,
        currency: r.currency,
        flights: r.flights,
        links: [],
      })),
      meta: {
        total: results.length,
        origin,
        destination,
        searchParams: {
          origin,
          destination,
          dates,
          travelerCount,
          cabinClass,
        },
      },
    })
  } catch (error) {
    const errorInfo = logAmadeusError(
      'shopping.flightOffersSearch.get',
      error,
      {
        searchParams: {
          origin,
          destination,
          departureDate,
          travelerCount,
          cabinClass,
        },
      }
    )

    console.error('[FLEXIBLE DATES API] Unexpected error occurred')
    return res.status(500).json({
      error: 'Amadeus API error',
      details: error.message,
      errorId: errorInfo.timestamp,
    })
  }
}
