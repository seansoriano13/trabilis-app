export const capitalizeWords = (str) =>
    str
        .toLowerCase()
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

export const formatPhoneForAmadeus = (phone, countryCallingCode = '63') => {
    // Remove non-digits from phone number
    const digits = phone.replace(/\D/g, '')

    let number = digits

    // Handle 11-digit numbers starting with 0 (e.g., 09123456789)
    if (digits.length === 11 && digits.startsWith('0')) {
        number = digits.slice(1) // Strip leading 0
    }

    // Handle full international number (e.g., 639123456789)
    if (digits.length === 12 && digits.startsWith(countryCallingCode)) {
        number = digits.slice(countryCallingCode.length)
    }

    // Ensure countryCallingCode is digits only
    const cleanCountryCode = countryCallingCode.replace(/\D/g, '')

    return {
        deviceType: 'MOBILE',
        countryCallingCode: cleanCountryCode,
        number,
    }
}
