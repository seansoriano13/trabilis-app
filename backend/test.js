import { getTourBookingByReference } from './src/services/emailService.js'

async function testBooking() {
    const bookingReference = 'TRB-TOUR-72115D75'
    const bookingDetails = await getTourBookingByReference(bookingReference)
    console.log('Booking details:', JSON.stringify(bookingDetails, null, 2))
}

testBooking()
