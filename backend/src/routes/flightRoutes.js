import express from 'express'
import { searchFlights, getFlexibleFlightDates } from '../controllers/flightController.js'

const router = express.Router()

router.post('/search', searchFlights)
router.post('/flexible-dates', getFlexibleFlightDates)

export default router
