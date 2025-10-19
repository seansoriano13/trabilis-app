import express from 'express'
import { 
    requestCancellation, 
    verifyCancellation, 
    checkTokenStatus, 
    resendVerificationEmail 
} from '../controllers/emailVerificationCancellationController.js'

const router = express.Router()

// Request cancellation (sends verification email)
router.post('/request', requestCancellation)

// Verify cancellation token and complete cancellation
router.post('/verify', verifyCancellation)

// Check token status (for frontend polling)
router.get('/status', checkTokenStatus)

// Resend verification email
router.post('/resend', resendVerificationEmail)

export default router
