import express from 'express'
import {
    initiateFlightBooking,
    cancelFlightBooking,
    getBookingStatus,
} from '../controllers/flightBookingController.js'
import { trackBookingStatus } from '../controllers/trackBookingController.js'

const router = express.Router()

router.post('/flights', initiateFlightBooking)
router.get('/track-booking', trackBookingStatus)
router.get('/cancel', cancelFlightBooking)
router.get('/status', getBookingStatus)

export default router
