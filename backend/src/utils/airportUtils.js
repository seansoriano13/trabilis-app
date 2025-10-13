import airports from '../data/airports-mini.json' with { type: 'json' }

export function getAirportByIATA(iata) {
    return airports.find((a) => a.iata === iata.toUpperCase()) || null
}

export function getAirportFull(iata) {
    const airport = getAirportByIATA(iata)
    return (
        airport || {
            iata: iata.toUpperCase(),
            name: 'Unknown Airport',
            city: 'Unknown',
            country: 'Unknown',
        }
    )
}
