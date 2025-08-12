import express from 'express'
import { sendTestEmail } from '../controllers/testController.js'

const router = express.Router()

router.post('/send-email', sendTestEmail)

export default router
