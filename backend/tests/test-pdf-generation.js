#!/usr/bin/env node

/**
 * PDF Generation Test Script
 * Tests both Flight and Tour PDF generation with mock data
 */

import { generateFlightItineraryPDF, generateTourSummaryPDF } from '../src/services/brevoEmailService.js'
import { mockFlightOffers } from '../src/mock/flightResultMockData.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create output directory for test PDFs
const outputDir = path.join(__dirname, 'test-pdfs')
await fs.mkdir(outputDir, { recursive: true })

console.log('🧪 Starting PDF Generation Tests...\n')

// Test 1: Flight PDF Generation with Mock Data
console.log('📄 Test 1: Flight PDF Generation')
console.log('=' .repeat(50))

try {
    // Create comprehensive mock flight booking data
    const mockFlightBooking = {
        booking_reference: 'TRB-FLT-TEST123',
        pnr: 'TESTPNR123',
        status: 'TICKETED',
        e_ticket_numbers: ['ET123456789', 'ET987654321'],
        currency: 'PHP',
        amadeus_flight_offer: mockFlightOffers.data[0], // Use first mock flight offer
        passenger_details: {
            travelers: [
                {
                    title: 'Mr',
                    name: {
                        firstName: 'John',
                        lastName: 'Doe',
                    },
                    type: 'ADULT',
                    dateOfBirth: '1990-01-15',
                    documents: [
                        {
                            number: 'P123456789',
                            expiryDate: '2030-01-15',
                            nationality: 'US',
                        },
                    ],
                    contact: {
                        emailAddress: 'john.doe@example.com',
                    },
                },
                {
                    title: 'Ms',
                    name: {
                        firstName: 'Jane',
                        lastName: 'Doe',
                    },
                    type: 'ADULT',
                    dateOfBirth: '1992-05-20',
                    documents: [
                        {
                            number: 'P987654321',
                            expiryDate: '2032-05-20',
                            nationality: 'US',
                        },
                    ],
                    contact: {
                        emailAddress: 'jane.doe@example.com',
                    },
                },
            ],
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

    console.log('📊 Mock flight booking data prepared:')
    console.log(`- Booking Reference: ${mockFlightBooking.booking_reference}`)
    console.log(`- PNR: ${mockFlightBooking.pnr}`)
    console.log(`- Status: ${mockFlightBooking.status}`)
    console.log(`- Passengers: ${mockFlightBooking.passenger_details.travelers.length}`)
    console.log(`- Flight Offers: ${mockFlightBooking.amadeus_flight_offer?.itineraries?.length || 0} itineraries`)

    // Generate Flight PDF
    console.log('\n🔍 Generating Flight PDF...')
    const flightPdfBuffer = await generateFlightItineraryPDF(mockFlightBooking)
    
    console.log(`✅ Flight PDF generated successfully!`)
    console.log(`📄 PDF Size: ${flightPdfBuffer.length} bytes`)
    console.log(`📄 PDF Size: ${(flightPdfBuffer.length / 1024).toFixed(2)} KB`)

    // Save Flight PDF to file
    const flightPdfPath = path.join(outputDir, 'test-flight-itinerary.pdf')
    await fs.writeFile(flightPdfPath, flightPdfBuffer)
    console.log(`💾 Flight PDF saved to: ${flightPdfPath}`)

} catch (error) {
    console.error('❌ Flight PDF generation failed:', error.message)
    console.error('Stack trace:', error.stack)
}

console.log('\n' + '=' .repeat(80) + '\n')

// Test 2: Tour PDF Generation with Mock Data
console.log('📄 Test 2: Tour PDF Generation')
console.log('=' .repeat(50))

try {
    // Create comprehensive mock tour booking data
    const mockTourBooking = {
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

    console.log('📊 Mock tour booking data prepared:')
    console.log(`- Booking Reference: ${mockTourBooking.bookingReference}`)
    console.log(`- Tour Title: ${mockTourBooking.tourTitle}`)
    console.log(`- Duration: ${mockTourBooking.startDate} to ${mockTourBooking.endDate}`)
    console.log(`- Passengers: ${mockTourBooking.passengerCount}`)
    console.log(`- Itinerary Days: ${mockTourBooking.itinerary.length}`)

    // Generate Tour PDF
    console.log('\n🔍 Generating Tour PDF...')
    const tourPdfBuffer = await generateTourSummaryPDF(mockTourBooking)
    
    console.log(`✅ Tour PDF generated successfully!`)
    console.log(`📄 PDF Size: ${tourPdfBuffer.length} bytes`)
    console.log(`📄 PDF Size: ${(tourPdfBuffer.length / 1024).toFixed(2)} KB`)

    // Save Tour PDF to file
    const tourPdfPath = path.join(outputDir, 'test-tour-summary.pdf')
    await fs.writeFile(tourPdfPath, tourPdfBuffer)
    console.log(`💾 Tour PDF saved to: ${tourPdfPath}`)

} catch (error) {
    console.error('❌ Tour PDF generation failed:', error.message)
    console.error('Stack trace:', error.stack)
}

console.log('\n' + '=' .repeat(80) + '\n')

// Test 3: Test with Real Booking Data (if available)
console.log('📄 Test 3: Real Booking Data Test')
console.log('=' .repeat(50))

try {
    const { getBookingByBookingReference } = await import('./src/services/brevoEmailService.js')
    
    // Try to get a real booking from the database
    console.log('🔍 Attempting to fetch real booking data...')
    
    // You can modify this to use an actual booking reference from your database
    const testBookingRef = 'TRB-FLT-20240115-001' // Replace with actual booking reference
    
    try {
        const realBooking = await getBookingByBookingReference(testBookingRef)
        console.log(`✅ Real booking found: ${realBooking.booking_reference}`)
        console.log(`📊 Status: ${realBooking.status}`)
        console.log(`👥 Passengers: ${realBooking.passenger_details?.travelers?.length || 0}`)
        
        // Generate PDF with real data
        console.log('\n🔍 Generating PDF with real booking data...')
        const realPdfBuffer = await generateFlightItineraryPDF(realBooking)
        
        console.log(`✅ Real booking PDF generated successfully!`)
        console.log(`📄 PDF Size: ${realPdfBuffer.length} bytes`)
        console.log(`📄 PDF Size: ${(realPdfBuffer.length / 1024).toFixed(2)} KB`)
        
        // Save real PDF to file
        const realPdfPath = path.join(outputDir, `real-booking-${testBookingRef}.pdf`)
        await fs.writeFile(realPdfPath, realPdfBuffer)
        console.log(`💾 Real booking PDF saved to: ${realPdfPath}`)
        
    } catch (realBookingError) {
        console.log(`⚠️  No real booking found with reference: ${testBookingRef}`)
        console.log(`💡 To test with real data, update the testBookingRef variable with an actual booking reference`)
    }
    
} catch (error) {
    console.error('❌ Real booking test failed:', error.message)
}

console.log('\n' + '=' .repeat(80) + '\n')

// Summary
console.log('📋 Test Summary')
console.log('=' .repeat(50))

try {
    const files = await fs.readdir(outputDir)
    console.log(`✅ Generated ${files.length} test PDF files:`)
    files.forEach(file => {
        console.log(`   - ${file}`)
    })
    console.log(`\n📁 All test PDFs saved in: ${outputDir}`)
    console.log(`\n🎉 PDF generation tests completed successfully!`)
    
} catch (error) {
    console.error('❌ Error reading output directory:', error.message)
}

console.log('\n' + '=' .repeat(80))
console.log('✨ Test completed! Check the test-pdfs directory for generated files.')
