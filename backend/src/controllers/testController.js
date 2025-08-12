import { sendConfirmationEmail } from '../services/emailService.js'

export const sendTestEmail = async (req, res) => {
    const { bookingReference } = req.body

    if (!bookingReference) {
        return res.status(400).json({
            error: 'Missing bookingReference in request body',
        })
    }

    try {
        await sendConfirmationEmail(bookingReference)
        res.status(200).json({
            message: '✅ Email process completed successfully.',
        })
    } catch (err) {
        console.error('❌ Email process failed:', err)
        res.status(500).json({
            error: 'Email process failed',
            details: err.message,
        })
    }
}
