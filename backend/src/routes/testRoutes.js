import express from 'express'
import {
    sendTestEmail,
    sendTestNotification,
} from '../controllers/testController.js'

const router = express.Router()

router.post('/send-email', sendTestEmail)
router.post('/notify', sendTestNotification)

export default router
