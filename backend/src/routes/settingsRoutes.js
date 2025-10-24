import express from 'express'
import {
  getRecycleBin,
  restoreTour,
  permanentlyDeleteTour,
} from '../controllers/admin/settingsController.js'

const router = express.Router()

// Recycle Bin Routes
router.get('/recycle-bin', getRecycleBin)
router.post('/recycle-bin/:id/restore', restoreTour)
router.delete('/recycle-bin/:id', permanentlyDeleteTour)

export default router
