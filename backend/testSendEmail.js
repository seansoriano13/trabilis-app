import pool from './src/config/db.js'
import { sendConfirmationEmail } from './src/services/emailService.js'
;(async () => {
    try {
        const bookingReference = 'TRB-FLT-0168d9aa-6dea-43be-9a2a-bbd5592ca8bc'
        await sendConfirmationEmail(bookingReference)
        console.log('✅ Email process completed successfully.')
    } catch (err) {
        console.error('❌ Email process failed:', err)
    } finally {
        await pool.end()
    }
})()
