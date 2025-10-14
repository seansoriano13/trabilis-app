#!/usr/bin/env node

/**
 * PDF Generation Test with Custom Payload
 * Usage: node test-pdf-with-payload.js [flight|tour] [payload-file.json]
 * 
 * Examples:
 * node test-pdf-with-payload.js flight
 * node test-pdf-with-payload.js tour
 * node test-pdf-with-payload.js flight custom-payload.json
 */

import { generateFlightItineraryPDF, generateTourSummaryPDF } from '../src/services/brevoEmailService.js'
import { mockFlightOffers } from '../src/mock/flightResultMockData.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get command line arguments
const [,, testType = 'flight', payloadFile] = process.argv

console.log('🧪 PDF Generation Test with Custom Payload\n')
console.log(`📋 Test Type: ${testType}`)
console.log(`📄 Payload File: ${payloadFile || 'Using default mock data'}\n`)

// Default mock data
const defaultFlightPayload = {
    booking_reference: 'TRB-FLT-TEST123',
    pnr: 'TESTPNR123',
    status: 'TICKETED',
    e_ticket_numbers: ['ET123456789', 'ET987654321'],
    currency: 'PHP',
    amadeus_flight_offer: mockFlightOffers.data[0],
    passenger_details: {
        travelers: [
            {
                title: 'Mr',
                name: { firstName: 'John', lastName: 'Doe' },
                type: 'ADULT',
                dateOfBirth: '1990-01-15',
                documents: [
                    { number: 'P123456789', expiryDate: '2030-01-15', nationality: 'US' }
                ],
                contact: { emailAddress: 'john.doe@example.com' }
            },
            {
                title: 'Ms',
                name: { firstName: 'Jane', lastName: 'Doe' },
                type: 'ADULT',
                dateOfBirth: '1992-05-20',
                documents: [
                    { number: 'P987654321', expiryDate: '2032-05-20', nationality: 'US' }
                ],
                contact: { emailAddress: 'jane.doe@example.com' }
            }
        ]
    },
    search_criteria: {
        origin: 'MNL',
        destination: 'LAX',
        departureDate: '2024-02-15',
        returnDate: '2024-02-22',
        passengers: 2,
        cabinClass: 'ECONOMY'
    }
}

const defaultTourPayload = {
    bookingReference: 'TRB-TOUR-TEST123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1-555-0123',
    tourTitle: 'Amazing Philippines Adventure',
    startDate: '2024-03-15',
    endDate: '2024-03-22',
    passengerCount: 2,
    passengers: [
        {
            name: { firstName: 'John', lastName: 'Doe' },
            type: 'Adult',
            contact: { emailAddress: 'test@example.com' },
            dateOfBirth: '1990-01-15'
        },
        {
            name: { firstName: 'Jane', lastName: 'Doe' },
            type: 'Adult',
            contact: { emailAddress: 'test@example.com' },
            dateOfBirth: '1992-05-20'
        }
    ],
    paymentType: 'FULL',
    amount: '₱45,000.00',
    reservationAmount: '₱15,000.00',
    status: 'CONFIRMED',
    inclusions: [
        'Hotel accommodation (4-star)',
        'All meals (breakfast, lunch, dinner)',
        'Airport transfers',
        'Guided city tours',
        'Entrance fees to attractions',
        'Professional tour guide'
    ],
    exclusions: [
        'International flights',
        'Personal expenses',
        'Travel insurance',
        'Optional activities',
        'Tips and gratuities'
    ],
    notes: [
        'Please arrive at the hotel by 2:00 PM',
        'Bring comfortable walking shoes',
        'Camera recommended for photos'
    ],
    requirements: [
        'Valid passport (6 months validity)',
        'Travel insurance (recommended)',
        'Vaccination certificate if required',
        'Emergency contact information'
    ],
    paymentTerms: [
        'Full payment required 30 days before departure',
        'Cancellation policy: 50% refund if cancelled 15+ days before',
        'No refund for cancellations within 14 days'
    ],
    itinerary: [
        {
            day_number: 1,
            title: 'Arrival in Manila',
            description: 'Welcome to the Philippines! Airport pickup and transfer to hotel. Brief city orientation and welcome dinner.',
            image_url: 'https://example.com/day1.jpg'
        },
        {
            day_number: 2,
            title: 'Manila City Tour',
            description: 'Explore historic Intramuros, visit Rizal Park, and experience local culture at the National Museum.',
            image_url: 'https://example.com/day2.jpg'
        },
        {
            day_number: 3,
            title: 'Tagaytay Adventure',
            description: 'Day trip to Tagaytay for stunning views of Taal Volcano. Visit local markets and enjoy fresh produce.',
            image_url: 'https://example.com/day3.jpg'
        },
        {
            day_number: 4,
            title: 'Free Day',
            description: 'Free time to explore Manila at your own pace. Optional activities available upon request.',
            image_url: 'https://example.com/day4.jpg'
        },
        {
            day_number: 5,
            title: 'Departure',
            description: 'Check out from hotel and transfer to airport for your departure flight.',
            image_url: 'https://example.com/day5.jpg'
        }
    ],
    tourDescription: 'Experience the best of the Philippines with our comprehensive 5-day adventure tour. From historic Manila to the stunning landscapes of Tagaytay, this tour offers a perfect blend of culture, history, and natural beauty.',
    package_date_id: 123,
    tour_package_id: 456,
    totalSlots: 20,
    availableSlots: 18,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
}

async function loadPayload() {
    if (payloadFile) {
        try {
            console.log(`📂 Loading custom payload from: ${payloadFile}`)
            const payloadData = await fs.readFile(payloadFile, 'utf8')
            const customPayload = JSON.parse(payloadData)
            console.log(`✅ Custom payload loaded successfully`)
            return customPayload
        } catch (error) {
            console.error(`❌ Failed to load custom payload: ${error.message}`)
            console.log(`💡 Falling back to default mock data`)
            return testType === 'flight' ? defaultFlightPayload : defaultTourPayload
        }
    } else {
        console.log(`📋 Using default mock data for ${testType}`)
        return testType === 'flight' ? defaultFlightPayload : defaultTourPayload
    }
}

async function testFlightPDF(payload) {
    console.log('📄 Testing Flight PDF Generation')
    console.log('=' .repeat(50))
    
    try {
        console.log('📊 Flight booking data:')
        console.log(`- Booking Reference: ${payload.booking_reference}`)
        console.log(`- PNR: ${payload.pnr}`)
        console.log(`- Status: ${payload.status}`)
        console.log(`- Passengers: ${payload.passenger_details?.travelers?.length || 0}`)
        console.log(`- Flight Offers: ${payload.amadeus_flight_offer?.itineraries?.length || 0} itineraries`)
        
        console.log('\n🔍 Generating Flight PDF...')
        const startTime = Date.now()
        const pdfBuffer = await generateFlightItineraryPDF(payload)
        const endTime = Date.now()
        
        console.log(`✅ Flight PDF generated successfully!`)
        console.log(`📄 PDF Size: ${pdfBuffer.length} bytes (${(pdfBuffer.length / 1024).toFixed(2)} KB)`)
        console.log(`⏱️  Generation Time: ${endTime - startTime}ms`)
        
        // Save PDF to file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `test-flight-${timestamp}.pdf`
        const filepath = path.join(__dirname, filename)
        await fs.writeFile(filepath, pdfBuffer)
        console.log(`💾 PDF saved to: ${filename}`)
        
        return { success: true, size: pdfBuffer.length, time: endTime - startTime, filename }
        
    } catch (error) {
        console.error('❌ Flight PDF generation failed:', error.message)
        console.error('Stack trace:', error.stack)
        return { success: false, error: error.message }
    }
}

async function testTourPDF(payload) {
    console.log('📄 Testing Tour PDF Generation')
    console.log('=' .repeat(50))
    
    try {
        console.log('📊 Tour booking data:')
        console.log(`- Booking Reference: ${payload.bookingReference}`)
        console.log(`- Tour Title: ${payload.tourTitle}`)
        console.log(`- Duration: ${payload.startDate} to ${payload.endDate}`)
        console.log(`- Passengers: ${payload.passengerCount}`)
        console.log(`- Itinerary Days: ${payload.itinerary?.length || 0}`)
        
        console.log('\n🔍 Generating Tour PDF...')
        const startTime = Date.now()
        const pdfBuffer = await generateTourSummaryPDF(payload)
        const endTime = Date.now()
        
        console.log(`✅ Tour PDF generated successfully!`)
        console.log(`📄 PDF Size: ${pdfBuffer.length} bytes (${(pdfBuffer.length / 1024).toFixed(2)} KB)`)
        console.log(`⏱️  Generation Time: ${endTime - startTime}ms`)
        
        // Save PDF to file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `test-tour-${timestamp}.pdf`
        const filepath = path.join(__dirname, filename)
        await fs.writeFile(filepath, pdfBuffer)
        console.log(`💾 PDF saved to: ${filename}`)
        
        return { success: true, size: pdfBuffer.length, time: endTime - startTime, filename }
        
    } catch (error) {
        console.error('❌ Tour PDF generation failed:', error.message)
        console.error('Stack trace:', error.stack)
        return { success: false, error: error.message }
    }
}

// Main execution
async function main() {
    try {
        const payload = await loadPayload()
        
        let result
        if (testType === 'flight') {
            result = await testFlightPDF(payload)
        } else if (testType === 'tour') {
            result = await testTourPDF(payload)
        } else {
            console.error('❌ Invalid test type. Use "flight" or "tour"')
            process.exit(1)
        }
        
        console.log('\n' + '=' .repeat(80))
        console.log('📋 Test Summary')
        console.log('=' .repeat(50))
        
        if (result.success) {
            console.log(`✅ Test completed successfully!`)
            console.log(`📄 PDF Size: ${result.size} bytes (${(result.size / 1024).toFixed(2)} KB)`)
            console.log(`⏱️  Generation Time: ${result.time}ms`)
            console.log(`📁 File: ${result.filename}`)
        } else {
            console.log(`❌ Test failed: ${result.error}`)
            process.exit(1)
        }
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message)
        process.exit(1)
    }
}

// Show usage if no arguments provided
if (process.argv.length < 3) {
    console.log('📖 Usage:')
    console.log('  node test-pdf-with-payload.js [flight|tour] [payload-file.json]')
    console.log('\n📋 Examples:')
    console.log('  node test-pdf-with-payload.js flight')
    console.log('  node test-pdf-with-payload.js tour')
    console.log('  node test-pdf-with-payload.js flight custom-payload.json')
    console.log('  node test-pdf-with-payload.js tour custom-tour-payload.json')
    console.log('\n💡 If no payload file is provided, default mock data will be used.')
    process.exit(0)
}

main()
