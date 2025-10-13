import airlines from '../data/airlines.json' with { type: 'json' }

export const getAirlineInfo = (id) => {
    return (
        airlines.find((airline) => airline.id === id) || {
            name: id,
            logo: null,
        }
    )
}
