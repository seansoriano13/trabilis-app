import { amadeus } from '../../config/amadeus.js'
import { FLEX_SEARCH_MAX_DAYS } from '../../config/flexSearch.js'

export async function searchAcrossDates({ origin, destination, departureDate, travelerCount, cabinClass, window }) {
  const days = Math.min(Number(window ?? FLEX_SEARCH_MAX_DAYS), FLEX_SEARCH_MAX_DAYS)
  const baseDate = new Date(departureDate || new Date().toISOString().split('T')[0])
  const datesToSearch = []
  for (let i = -days; i <= days; i++) {
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() + i)
    datesToSearch.push(date.toISOString().split('T')[0])
  }

  const searchPromises = datesToSearch.map(async (date) => {
    try {
      const searchParams = {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: date,
        adults: travelerCount?.adults || 1,
        children: travelerCount?.children || 0,
        travelClass: cabinClass || 'ECONOMY',
        currencyCode: 'PHP',
      }

      const flightResponse = await amadeus.shopping.flightOffersSearch.get(searchParams)
      if (flightResponse.data && flightResponse.data.length > 0) {
        const cheapest = flightResponse.data.reduce((min, f) => {
          const p = parseFloat(f?.price?.total || Infinity)
          return p < parseFloat(min?.price?.total || Infinity) ? f : min
        }, flightResponse.data[0])

        const parsed = parseFloat(cheapest?.price?.total ?? 'NaN')
        const safePrice = Number.isFinite(parsed) ? parsed : null
        const currency = cheapest?.price?.currency || 'PHP'

        return {
          date,
          price: safePrice,
          currency,
          flights: flightResponse.data,
        }
      }
      return { date, price: null, currency: 'PHP', flights: [] }
    } catch (_) {
      return { date, price: null, currency: 'PHP', flights: [] }
    }
  })

  const results = await Promise.all(searchPromises)
  return { dates: datesToSearch, results }
}


