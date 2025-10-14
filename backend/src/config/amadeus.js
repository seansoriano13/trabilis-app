import Amadeus from 'amadeus'
import dotenv from 'dotenv'

dotenv.config()

// Enhanced Amadeus configuration with minimal logging
export const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_API_KEY,
    clientSecret: process.env.AMADEUS_API_SECRET,
    hostname: process.env.AMADEUS_HOSTNAME || 'test', // 'test' for sandbox, 'production' for live
    logLevel: process.env.AMADEUS_LOG_LEVEL || 'silent' // Silent to avoid verbose flight data logging
})

// Log Amadeus configuration status (only once on startup)
console.log('[AMADEUS CONFIG] Initialized:', {
    apiKey: process.env.AMADEUS_API_KEY ? '✅ Set' : '❌ Missing',
    hostname: process.env.AMADEUS_HOSTNAME || 'test',
    logLevel: process.env.AMADEUS_LOG_LEVEL || 'silent'
})

// Test API key validity by making a simple request
async function testAmadeusConnection() {
    try {
        const response = await amadeus.referenceData.urls.checkinLinks.get({
            airlineCode: 'BA'
        })
        console.log('[AMADEUS CONFIG] ✅ API key is valid and working')
    } catch (error) {
        console.error('[AMADEUS CONFIG] ❌ API key test failed:', error.message)
    }
}

// Run the test
testAmadeusConnection()

// Helper function to log Amadeus API errors (simplified)
export const logAmadeusError = (operation, error, additionalData = {}) => {
    console.error(`[AMADEUS ERROR] ${operation} failed:`, {
        message: error.message,
        code: error.code,
        status: error.response?.status
    })
    return { timestamp: new Date().toISOString(), operation, error: error.message }
}

// Helper function to log successful Amadeus API calls (simplified)
export const logAmadeusSuccess = (operation, response, additionalData = {}) => {
    console.log(`[AMADEUS SUCCESS] ${operation}: ${response.status} - ${response.data?.length || 0} results`)
    return { timestamp: new Date().toISOString(), operation, status: response.status }
}
