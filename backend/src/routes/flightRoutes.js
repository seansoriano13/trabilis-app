import express from 'express'
import { searchFlights } from '../controllers/flightController.js'
// import { getFlexibleFlightDates } from '../controllers/flightController.js' // Disabled for now

const router = express.Router()

router.post('/search', searchFlights)
// router.post('/flexible-dates', getFlexibleFlightDates) // Disabled for now

export default router
