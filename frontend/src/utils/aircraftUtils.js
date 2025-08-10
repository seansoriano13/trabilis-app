import aircraftMap from '../data/aircraftTypes'

export const getAircraftName = (code) =>
    aircraftMap[code] || `Aircraft Code: ${code}`

export const getAllAircraftEntries = () =>
    Object.entries(aircraftMap).map(([code, name]) => ({ code, name }))

export const hasAircraftCode = (code) => code in aircraftMap

export const getAircraftOptions = () =>
    Object.entries(aircraftMap).map(([code, name]) => ({
        value: code,
        label: name,
    }))
