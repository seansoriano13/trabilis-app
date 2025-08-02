function isValidString(val) {
    return typeof val === 'string' && val.trim() !== ''
}

function isValidDateArray(date) {
    return (
        date &&
        ((Array.isArray(date) && date.length > 0) || date instanceof Date || typeof date === 'string')
    )
}