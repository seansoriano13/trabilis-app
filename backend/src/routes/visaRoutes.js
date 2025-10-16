import express from 'express'
import { submitVisaInquiry, getVisaInquiries, updateVisaInquiryStatus, trackVisaInquiry, createVisaInquiryCheckout, markInquiryReadyForPayment, revertInquiryPayment } from '../controllers/visaInquiryController.js'
import { adminAuthMiddleware } from '../middlewares/adminAuthMIddleware.js'

const router = express.Router()

// Public route for submitting visa inquiries
router.post('/inquiry', submitVisaInquiry)
router.get('/inquiries/track', trackVisaInquiry)
router.post('/inquiries/:inquiry_reference/create-checkout', createVisaInquiryCheckout)

// Protected admin routes
router.use(adminAuthMiddleware)
router.get('/inquiries', getVisaInquiries)
router.put('/inquiries/:id/status', updateVisaInquiryStatus)
router.post('/inquiries/:id/mark-ready-for-payment', markInquiryReadyForPayment)
router.post('/inquiries/:id/revert-payment', revertInquiryPayment)

export default router

