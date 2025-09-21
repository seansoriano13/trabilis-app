import express from 'express'
import {
    sendTestEmail,
    sendTestNotification,
    generateMockPDF,
} from '../controllers/testController.js'

const router = express.Router()

router.post('/send-email', sendTestEmail)
router.post('/notify', sendTestNotification)
router.get('/mock-pdf', generateMockPDF)

export default router
