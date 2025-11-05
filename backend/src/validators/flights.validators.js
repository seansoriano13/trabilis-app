export function validateFlexibleDatesBody(body) {
  const errors = []
  const { origin, destination, departureDate, travelerCount, cabinClass, window } = body || {}

  if (!origin || !destination) {
    errors.push('Origin and destination are required')
  }

  const iataCodeRegex = /^[A-Z]{3}$/
  if (origin && !iataCodeRegex.test(origin)) {
    errors.push('Invalid origin IATA code')
  }
  if (destination && !iataCodeRegex.test(destination)) {
    errors.push('Invalid destination IATA code')
  }

  if (travelerCount && typeof travelerCount !== 'object') {
    errors.push('travelerCount must be an object')
  }

  if (window !== undefined) {
    const coerced = Number(window)
    if (isNaN(coerced) || coerced < 0 || !Number.isInteger(coerced)) {
      errors.push('window must be a non-negative integer')
    }
  }

  return {
    error: errors.length ? { message: errors.join('; ') } : null,
    value: { origin, destination, departureDate, travelerCount, cabinClass, window: window === undefined ? undefined : Number(window) },
  }
}


