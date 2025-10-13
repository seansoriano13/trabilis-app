import express from 'express'
import { handleStripeWebhook, testFlightPDFGeneration } from '../controllers/webhookController.js'

const router = express.Router()

router.post(
    '/stripe',
    express.raw({ type: 'application/json' }),
    handleStripeWebhook
)

// Test endpoint for Flight PDF generation
router.get('/test-flight-pdf/:bookingReference', testFlightPDFGeneration)

export default router
