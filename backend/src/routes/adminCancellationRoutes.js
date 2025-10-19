import express from 'express'
import {
    adminCancelFlightBooking,
    getCancellationStatus,
} from '../controllers/admin/adminCancellationController.js'
import { adminAuthMiddleware } from '../middlewares/adminAuthMiddleware.js'

const router = express.Router()

// Apply admin authentication to all routes
router.use(adminAuthMiddleware)

// Cancel flight booking (admin)
router.post('/cancel', adminCancelFlightBooking)

// Get cancellation status
router.get('/status/:booking_reference', getCancellationStatus)

export default router
