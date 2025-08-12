import express from 'express'
import { sendTestEmail } from '../controllers/testController.js'

const router = express.Router()

router.get('/send-email', sendTestEmail)

export default router
