import express from 'express'
import {
  getRecycleBin,
  restoreTour,
  permanentlyDeleteTour,
  getItineraryImageLimit,
  updateItineraryImageLimit,
} from '../controllers/admin/settingsController.js'

const router = express.Router()

// Recycle Bin Routes
router.get('/recycle-bin', getRecycleBin)
router.post('/recycle-bin/:id/restore', restoreTour)
router.delete('/recycle-bin/:id', permanentlyDeleteTour)

// Itinerary Settings Routes
router.get('/itinerary-image-limit', getItineraryImageLimit)
router.put('/itinerary-image-limit', updateItineraryImageLimit)

export default router
