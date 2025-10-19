import express from 'express'
import {
    sendTestEmail,
    sendTestNotification,
    generateMockPDF,
    generateRealPDF,
    listBookingReferences,
    testFlightConfirmationEmail,
    testTourConfirmationEmail,
    testFailureEmail,
    testTourFailureEmail,
    testVisaInquiryEmail,
    testCancellationVerificationEmail,
    testBrevoApi,
    debugFlightEmail,
    debugBookingStatus,
    debugWebhookUpdate,
    debugAmadeusAPI,
    debugFinalization,
} from '../controllers/testController.js'

const router = express.Router()

router.post('/send-email', sendTestEmail)
router.post('/notify', sendTestNotification)
router.get('/mock-pdf', generateMockPDF)
router.get('/real-pdf', generateRealPDF)
router.get('/list-bookings', listBookingReferences)

// Email testing routes
router.post('/email/flight-confirmation', testFlightConfirmationEmail)
router.post('/email/tour-confirmation', testTourConfirmationEmail)
router.post('/email/flight-failure', testFailureEmail)
router.post('/email/tour-failure', testTourFailureEmail)
router.post('/email/visa-inquiry', testVisaInquiryEmail)
router.post(
    '/email/cancellation-verification',
    testCancellationVerificationEmail
)
router.post('/email/brevo-test', testBrevoApi)

// Debug routes
router.get('/debug/flight-email', debugFlightEmail)
router.get('/debug/booking-status', debugBookingStatus)
router.get('/debug/webhook-update', debugWebhookUpdate)
router.get('/debug/amadeus-api', debugAmadeusAPI)
router.get('/debug/finalization', debugFinalization)

export default router
