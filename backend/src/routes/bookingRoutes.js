import express from 'express'
import {
    initiateFlightBooking,
    cancelFlightBooking,
    getBookingStatus,
} from '../controllers/flightBookingController.js'
import { trackBookingStatus } from '../controllers/trackBookingController.js'
import { getCancellationInfo } from '../services/cancellationService.js'

const router = express.Router()

router.post('/flights', initiateFlightBooking)
router.get('/track-booking', trackBookingStatus)
router.get('/cancel', cancelFlightBooking)
router.get('/status', getBookingStatus)

// Add missing cancellation endpoints that CancellationModal.jsx expects
router.get('/cancellation-info', async (req, res) => {
    try {
        const { booking_reference } = req.query
        if (!booking_reference) {
            return res.status(400).json({
                success: false,
                error: 'Booking reference is required',
            })
        }
        const info = await getCancellationInfo(booking_reference)
        res.json(info)
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        })
    }
})

router.post('/cancel', async (req, res) => {
    // This route is for client-side cancellation (not admin)
    // Will redirect to email verification flow
    res.status(400).json({
        success: false,
        error: 'Direct cancellation not allowed. Please use email verification.',
        redirectTo: '/api/v1/cancel-booking/request',
    })
})

export default router
