import express from 'express'
import {
  getRatings,
  updateRatingEmailDelay,
  getRatingEmailDelay,
  resendRatingEmail,
} from '../controllers/admin/ratingsController.js'
import { adminAuthMiddleware } from '../middlewares/adminAuthMiddleware.js'
import { processRatingSubmission } from '../services/ratingEmailService.js'

const router = express.Router()

// Admin routes (protected)
router.get('/', adminAuthMiddleware, getRatings)
router.get('/email-delay', adminAuthMiddleware, getRatingEmailDelay)
router.put('/email-delay', adminAuthMiddleware, updateRatingEmailDelay)
router.post('/resend/:bookingId', adminAuthMiddleware, resendRatingEmail)

// Public route for rating submission
router.post('/submit/:token', async (req, res) => {
  try {
    const { token } = req.params
    const { rating } = req.body

    const result = await processRatingSubmission(token, rating)
    res.json(result)
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
})

export default router
