import { sendConfirmationEmail } from '../services/emailService.js'

export const sendTestEmail = async (req, res) => {
    const bookingReference = 'TRB-FLT-0168d9aa-6dea-43be-9a2a-bbd5592ca8bc'

    try {
        await sendConfirmationEmail(bookingReference)
        res.status(200).json({ message: '✅ Email process completed successfully.' })
    } catch (err) {
        console.error('❌ Email process failed:', err)
        res.status(500).json({ error: 'Email process failed', details: err.message })
    }
}
