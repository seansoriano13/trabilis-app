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
