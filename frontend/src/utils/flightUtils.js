import { Duration } from 'luxon'

export function formatIso(isoString) {
    if (!isoString) return 'Invalid Time'

    return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })
}

export function getDuration(start, end) {
    if (!start || !end) return 'N/A'

    if (start > end) return 'Invalid Duration'

    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffMs = endDate - startDate
    const minutes = Math.floor(diffMs / 1000 / 60)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    return `${hours}h ${remainingMinutes}m`
}

export const formatToLongDate = (date) => {
    const [start, end] = Array.isArray(date) ? date : [date]
    if (!start || !(start instanceof Date)) return ''

    const toFormatted = (d) =>
        d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })

    return end ? [toFormatted(start), toFormatted(end)] : toFormatted(start)
}

export const formatToYMD = (date) => {
    const d = Array.isArray(date) ? date[0] : date
    if (!d || !(d instanceof Date)) return ''
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

export const getTotalMinutes = (flight) => {
    if (!flight?.itineraries?.[0]?.segments?.[0]?.duration) return Infinity
    return Duration.fromISO(flight.itineraries[0].segments[0].duration).as(
        'minutes'
    )
}

export const getScore = (flight) => {
    if (
        !flight?.price?.total ||
        !flight.itineraries?.[0]?.segments?.[0]?.duration
    ) {
        return Infinity
    }
    const price = parseFloat(flight.price.total)
    const duration = getTotalMinutes(flight)
    return price * 0.7 + duration * 0.3
}

