#!/usr/bin/env node

/**
 * Simple PDF Generation Test
 * Quick test for PDF generation with mock data
 */

import { generateFlightItineraryPDF, generateTourSummaryPDF } from '../src/services/brevoEmailService.js'
import { mockFlightOffers } from '../src/mock/flightResultMockData.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🧪 Simple PDF Generation Test\n')

// Test Flight PDF
console.log('📄 Testing Flight PDF Generation...')
try {
    const mockFlightBooking = {
        booking_reference: 'TRB-FLT-TEST123',
        pnr: 'TESTPNR123',
        status: 'TICKETED',
        e_ticket_numbers: ['ET123456789'],
        currency: 'PHP',
        amadeus_flight_offer: mockFlightOffers.data[0],
        passenger_details: {
            travelers: [
                {
                    title: 'Mr',
                    name: { firstName: 'John', lastName: 'Doe' },
                    type: 'ADULT',
                    dateOfBirth: '1990-01-15',
                    documents: [{ number: 'P123456789', expiryDate: '2030-01-15' }],
                    contact: { emailAddress: 'john.doe@example.com' }
                }
            ]
        }
    }

    const flightPdf = await generateFlightItineraryPDF(mockFlightBooking)
    console.log(`✅ Flight PDF generated: ${flightPdf.length} bytes`)
    
    // Save to file
    const outputPath = path.join(__dirname, 'test-flight.pdf')
    await fs.writeFile(outputPath, flightPdf)
    console.log(`💾 Saved to: ${outputPath}`)
    
} catch (error) {
    console.error('❌ Flight PDF failed:', error.message)
}

// Test Tour PDF
console.log('\n📄 Testing Tour PDF Generation...')
try {
    const mockTourBooking = {
        bookingReference: 'TRB-TOUR-TEST123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        tourTitle: 'Test Tour Package',
        startDate: '2024-03-15',
        endDate: '2024-03-22',
        passengerCount: 1,
        passengers: [{
            name: { firstName: 'John', lastName: 'Doe' },
            type: 'Adult',
            contact: { emailAddress: 'test@example.com' },
            dateOfBirth: '1990-01-15'
        }],
        amount: '₱25,000.00',
        status: 'CONFIRMED',
        itinerary: [
            { day_number: 1, title: 'Day 1', description: 'Arrival and welcome' },
            { day_number: 2, title: 'Day 2', description: 'City tour and sightseeing' }
        ]
    }

    const tourPdf = await generateTourSummaryPDF(mockTourBooking)
    console.log(`✅ Tour PDF generated: ${tourPdf.length} bytes`)
    
    // Save to file
    const outputPath = path.join(__dirname, 'test-tour.pdf')
    await fs.writeFile(outputPath, tourPdf)
    console.log(`💾 Saved to: ${outputPath}`)
    
} catch (error) {
    console.error('❌ Tour PDF failed:', error.message)
}

console.log('\n✨ Test completed!')
