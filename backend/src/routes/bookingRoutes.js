import express from 'express'
import { initiateFlightBooking } from '../controllers/bookingController.js'

const router = express.Router()

router.post('/flights', initiateFlightBooking)

export default router
