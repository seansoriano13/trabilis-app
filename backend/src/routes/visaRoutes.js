import express from 'express'
import { submitVisaInquiry, getVisaInquiries, updateVisaInquiryStatus, trackVisaInquiry } from '../controllers/visaInquiryController.js'
import { adminAuthMiddleware } from '../middlewares/adminAuthMIddleware.js'

const router = express.Router()

// Public route for submitting visa inquiries
router.post('/inquiry', submitVisaInquiry)
router.get('/inquiries/track', trackVisaInquiry)

// Protected admin routes
router.use(adminAuthMiddleware)
router.get('/inquiries', getVisaInquiries)
router.put('/inquiries/:id/status', updateVisaInquiryStatus)

export default router

