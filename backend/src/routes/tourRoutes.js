import express from 'express'
import { getAllTours, getTour } from '../controllers/tourController.js'
import TourBookingController from '../controllers/tourBookingController.js'

const router = express.Router()

router.get('/tours', getAllTours)
router.post('/tour/booking', TourBookingController.initiateTourBooking)
router.get('/tour/booking', TourBookingController.getBooking)
router.get('/tour/:id', getTour)
router.patch('/tours/booking/cancel/:id', TourBookingController.cancelBooking)

export default router
