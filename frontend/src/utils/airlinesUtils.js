import airlines from '../data/airlines.json'

export const getAirlineInfo = (id) => {
    return (
        airlines.find((airline) => airline.id === id) || {
            name: id,
            logo: null,
        }
    )
}
