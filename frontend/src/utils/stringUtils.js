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

export const calculateAge = (birthDateString) => {
    // Input validation
    if (!birthDateString || typeof birthDateString !== 'string') {
        throw new Error('Invalid or missing birth date')
    }

    const birthDate = new Date(birthDateString)
    if (isNaN(birthDate.getTime())) {
        throw new Error('Invalid date format. Expected YYYY-MM-DD')
    }

    const today = new Date()

    // Ensure dates are in UTC to avoid time zone issues
    const todayUTC = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    )
    const birthDateUTC = new Date(
        Date.UTC(
            birthDate.getFullYear(),
            birthDate.getMonth(),
            birthDate.getDate()
        )
    )

    let age = todayUTC.getFullYear() - birthDateUTC.getFullYear()
    const monthDiff = todayUTC.getMonth() - birthDateUTC.getMonth()

    // Adjust if birthday hasn't occurred yet this year
    if (
        monthDiff < 0 ||
        (monthDiff === 0 && todayUTC.getDate() < birthDateUTC.getDate())
    ) {
        age--
    }

    // Ensure age is non-negative
    if (age < 0) {
        throw new Error('Birth date cannot be in the future')
    }

    return age
}
