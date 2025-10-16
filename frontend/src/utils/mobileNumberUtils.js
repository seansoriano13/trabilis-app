// Utility functions for handling mobile number display
// Handles both old string format and new jsonb format

/**
 * Formats a mobile number for display
 * @param {string|object} mobileNumber - Either a string or an object with {number, countryCallingCode}
 * @returns {string} Formatted mobile number for display
 */
export const formatMobileNumber = (mobileNumber) => {
    if (!mobileNumber) return 'N/A'
    
    // Handle new jsonb format
    if (typeof mobileNumber === 'object' && mobileNumber.number && mobileNumber.countryCallingCode) {
        return `${mobileNumber.countryCallingCode}${mobileNumber.number}`
    }
    
    // Handle legacy string format
    if (typeof mobileNumber === 'string') {
        return mobileNumber
    }
    
    return 'N/A'
}

/**
 * Gets the tel: href for a mobile number
 * @param {string|object} mobileNumber - Either a string or an object with {number, countryCallingCode}
 * @returns {string} tel: href
 */
export const getMobileTelHref = (mobileNumber) => {
    if (!mobileNumber) return 'tel:'
    
    // Handle new jsonb format
    if (typeof mobileNumber === 'object' && mobileNumber.number && mobileNumber.countryCallingCode) {
        return `tel:${mobileNumber.countryCallingCode}${mobileNumber.number}`
    }
    
    // Handle legacy string format
    if (typeof mobileNumber === 'string') {
        return `tel:${mobileNumber}`
    }
    
    return 'tel:'
}

/**
 * Validates if a mobile number is in the correct format
 * @param {string|object} mobileNumber - Either a string or an object with {number, countryCallingCode}
 * @returns {boolean} True if valid format
 */
export const isValidMobileNumber = (mobileNumber) => {
    if (!mobileNumber) return false
    
    // Handle new jsonb format
    if (typeof mobileNumber === 'object' && mobileNumber.number && mobileNumber.countryCallingCode) {
        return mobileNumber.number.match(/^[0-9]{10,11}$/) && 
               mobileNumber.countryCallingCode.match(/^\+[0-9]{1,4}$/)
    }
    
    // Handle legacy string format
    if (typeof mobileNumber === 'string') {
        return mobileNumber.match(/^\+?[0-9]{10,15}$/)
    }
    
    return false
}
