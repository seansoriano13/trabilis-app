import express from 'express'
import {
    initiateFlightBooking,
    cancelFlightBooking,
    getBookingStatus,
} from '../controllers/bookingController.js'

const router = express.Router()

router.post('/flights', initiateFlightBooking)
router.get('/cancel', cancelFlightBooking)
router.get('/status', getBookingStatus)

export default router
