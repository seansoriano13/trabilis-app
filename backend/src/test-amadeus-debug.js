// Test script to verify Amadeus debug logging is working
import { amadeus, logAmadeusError, logAmadeusSuccess } from './config/amadeus.js'

console.log('🧪 Testing Amadeus Debug Logging...')

// Test 1: Configuration logging
console.log('\n📋 Test 1: Configuration Status')
console.log('Amadeus instance created:', !!amadeus)

// Test 2: Helper functions
console.log('\n🔧 Test 2: Helper Functions')
try {
    // Test logAmadeusSuccess
    const mockResponse = {
        status: 200,
        statusText: 'OK',
        data: { test: 'data' },
        headers: {}
    }
    logAmadeusSuccess('test.operation', mockResponse, { testParam: 'value' })
    
    // Test logAmadeusError
    const mockError = {
        message: 'Test error',
        code: 'TEST_ERROR',
        response: {
            status: 400,
            statusText: 'Bad Request',
            data: { errors: [{ code: 400, title: 'Test Error', detail: 'Test error detail' }] },
            headers: {}
        },
        config: {
            url: '/test',
            method: 'GET',
            params: {},
            data: {}
        }
    }
    logAmadeusError('test.operation', mockError, { testParam: 'value' })
    
    console.log('✅ Helper functions working correctly')
} catch (error) {
    console.error('❌ Helper functions failed:', error)
}

// Test 3: API Connection (if credentials are available)
console.log('\n🌐 Test 3: API Connection Test')
if (process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET) {
    try {
        // Test a simple API call that should fail gracefully
        console.log('Testing API connection...')
        await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: 'INVALID',
            destinationLocationCode: 'INVALID',
            departureDate: '2024-01-01',
            adults: 1
        })
    } catch (error) {
        console.log('✅ API error handling working (expected error):')
        logAmadeusError('test.api.connection', error, { test: 'connection' })
    }
} else {
    console.log('⚠️ Skipping API test - credentials not available')
}

console.log('\n🎉 Amadeus Debug Logging Test Complete!')
console.log('\n📝 What to look for in logs:')
console.log('- [AMADEUS CONFIG] messages showing initialization status')
console.log('- [AMADEUS DEBUG/INFO/WARN/ERROR] messages for API operations')
console.log('- [AMADEUS SUCCESS] messages for successful operations')
console.log('- [AMADEUS ERROR] messages with detailed error information')
console.log('- [FLIGHT SEARCH] messages for search operations')
console.log('- [FLIGHT BOOKING] messages for booking operations')
