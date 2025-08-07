export const getAirportInfoByIata = (iata, airports) => {
    const a = airports.find((a) => a.value === iata)
    const cleanName = a?.name?.replace(/airport/i, '').trim() || ''
    return {
        city: a?.city || iata,
        name: cleanName,
    }
}
