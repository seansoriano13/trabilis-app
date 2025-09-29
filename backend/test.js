import dotenv from 'dotenv'
import { sendTourConfirmationEmail } from './src/services/brevoEmailService.js'

dotenv.config()
;(async () => {
    try {
        const bookingDetails = {
            bookingReference: 'TRB-TOUR-09143491',
            firstName: 'Reserve',
            lastName: 'Me',
            email: 'guitarisean@gmail.com',
            phone: '09927831240',
            passengerCount: 1,
            paymentType: 'RESERVATION',
            amount: 10000,
            status: 'CONFIRMED',
            tourTitle: 'Life changing HOLYLAND',
            startDate: '2026-08-28',
            endDate: '2026-11-07',
            inclusions: 'As per package',
            exclusions: '-',
            notes: '-',
            itinerary: '<p>Itinerary details not provided</p>',
            ratePerPax: 'N/A',
            availableSlots: 20,
            totalSlots: 'N/A',
            requirements: '-',
            paymentTerms: '-',
            tourDescription: '-',
            mainImageUrl: '',
            panellumUrl: '',
        }

        await sendTourConfirmationEmail(bookingDetails)

        console.log('✅ Test email sent successfully!')
    } catch (err) {
        console.error('❌ Error sending test email:', err)
    }
})()
