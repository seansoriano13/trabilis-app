#!/usr/bin/env node

/**
 * PDF Testing Summary
 * Shows all available testing options and their status
 */

import { generateFlightItineraryPDF, generateTourSummaryPDF } from '../src/services/brevoEmailService.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🧪 PDF Generation Testing Summary')
console.log('=' .repeat(60))
console.log()

// Check if test files exist
const testFiles = [
    'test-pdf-simple.js',
    'test-pdf-generation.js', 
    'test-pdf-with-payload.js',
    'example-flight-payload.json',
    'example-tour-payload.json',
    'PDF-TESTING-README.md'
]

console.log('📁 Test Files Status:')
console.log('-' .repeat(30))

for (const file of testFiles) {
    try {
        await fs.access(path.join(__dirname, file))
        console.log(`✅ ${file}`)
    } catch {
        console.log(`❌ ${file} - Missing`)
    }
}

console.log()

// Test PDF generation functions
console.log('🔧 PDF Generation Functions:')
console.log('-' .repeat(30))

try {
    const flightPdf = typeof generateFlightItineraryPDF
    const tourPdf = typeof generateTourSummaryPDF
    console.log(`✅ generateFlightItineraryPDF - ${flightPdf}`)
    console.log(`✅ generateTourSummaryPDF - ${tourPdf}`)
} catch (error) {
    console.log(`❌ PDF functions - ${error.message}`)
}

console.log()

// Show usage examples
console.log('🚀 Quick Start Commands:')
console.log('-' .repeat(30))
console.log('1. Simple test:')
console.log('   node test-pdf-simple.js')
console.log()
console.log('2. Comprehensive test:')
console.log('   node test-pdf-generation.js')
console.log()
console.log('3. Custom payload test:')
console.log('   node test-pdf-with-payload.js flight')
console.log('   node test-pdf-with-payload.js tour')
console.log('   node test-pdf-with-payload.js flight example-flight-payload.json')
console.log('   node test-pdf-with-payload.js tour example-tour-payload.json')
console.log()

// Show API endpoints
console.log('🌐 Available API Endpoints:')
console.log('-' .repeat(30))
console.log('GET  /api/test/mock-pdf                    - Generate mock flight PDF')
console.log('GET  /api/test/real-pdf?bookingReference=X - Generate real booking PDF')
console.log('POST /api/test/flight-email                - Test flight confirmation email')
console.log('POST /api/test/tour-email                  - Test tour confirmation email')
console.log('GET  /api/test/booking-references          - List available booking references')
console.log()

// Show example payload structure
console.log('📄 Example Payload Structure:')
console.log('-' .repeat(30))
console.log('Flight Payload:')
console.log('  - booking_reference: string')
console.log('  - pnr: string')
console.log('  - status: string')
console.log('  - amadeus_flight_offer: object')
console.log('  - passenger_details: object')
console.log()
console.log('Tour Payload:')
console.log('  - bookingReference: string')
console.log('  - email: string')
console.log('  - tourTitle: string')
console.log('  - itinerary: array')
console.log('  - passengers: array')
console.log()

// Check environment
console.log('🔧 Environment Check:')
console.log('-' .repeat(30))
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`)
console.log(`BREVO_API_KEY: ${process.env.BREVO_API_KEY ? '✅ Set' : '❌ Not set'}`)
console.log(`BREVO_FROM_EMAIL: ${process.env.BREVO_FROM_EMAIL || 'Not set'}`)
console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Not set'}`)
console.log(`SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}`)
console.log()

console.log('✨ Ready for testing! Choose a command above to get started.')
console.log('📖 For detailed instructions, see PDF-TESTING-README.md')
