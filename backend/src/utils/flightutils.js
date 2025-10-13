import dayjs from 'dayjs'
import { Duration } from 'luxon'
import { getAirlineInfo } from './airlinesUtils.js'
import { getAircraftName } from './aircraftUtils.js'
import { getAirportFull } from './airportUtils.js'

export function getStopsLabel(stops) {
    if (stops === 0) return 'Non Stop'
    if (stops === 1) return '1 Stop'
    if (stops === 2) return '2 Stops'
    return 'Multiple Stops'
}

export function formatSegment(segment) {
    const airline = getAirlineInfo(segment.carrierCode)
    const aircraft = getAircraftName(segment.aircraft?.code)

    const dep = segment.departure
    const arr = segment.arrival

    const departure = {
        iata: dep.iataCode,
        city: getAirportFull(dep.iataCode).city,
        airport: getAirportFull(dep.iataCode).name,
        terminal: dep.terminal,
        time: dayjs(dep.at).format('ddd, MMM D h:mm A'),
    }

    const arrival = {
        iata: arr.iataCode,
        city: getAirportFull(arr.iataCode).city,
        airport: getAirportFull(arr.iataCode).name,
        terminal: arr.terminal,
        time: dayjs(arr.at).format('ddd, MMM D h:mm A'),
    }

    const stopsLabel = getStopsLabel(segment.numberOfStops)
    const duration = Duration.fromISO(segment.duration).toFormat("h'h' m'm'")

    return { airline, aircraft, departure, arrival, stopsLabel, duration }
}
