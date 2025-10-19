import brevo from '@getbrevo/brevo'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function testBrevoEmail() {
    try {
        console.log('🔍 Testing Brevo Email Service...')
        console.log('📧 API Key configured:', !!process.env.BREVO_API_KEY)
        console.log('📧 From Email:', process.env.BREVO_FROM_EMAIL)

        // Initialize Brevo API client
        const apiInstance = new brevo.TransactionalEmailsApi()
        apiInstance.setApiKey(
            brevo.TransactionalEmailsApiApiKeys.apiKey,
            process.env.BREVO_API_KEY
        )

        // Create a simple test email
        const sendSmtpEmail = new brevo.SendSmtpEmail()
        sendSmtpEmail.subject =
            'Test Email from Trabilis - ' + new Date().toISOString()
        sendSmtpEmail.htmlContent = `
            <h2>🧪 Test Email</h2>
            <p>This is a test email to verify Brevo API is working.</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            <p><strong>From:</strong> ${process.env.BREVO_FROM_EMAIL}</p>
            <p>If you receive this email, the Brevo API is working correctly!</p>
        `
        sendSmtpEmail.sender = {
            name: 'Trabilis Test',
            email:
                process.env.BREVO_FROM_EMAIL || 'lindelatravelctws@gmail.com',
        }
        sendSmtpEmail.to = [
            {
                email: 'arkadatax03@gmail.com',
                name: 'Test User',
            },
        ]

        console.log('📧 Sending test email...')
        const result = await apiInstance.sendTransacEmail(sendSmtpEmail)

        console.log('✅ Brevo API test successful!')
        console.log('📧 Message ID:', result.messageId)
        console.log('📧 Response:', result.response)

        console.log('\n🔍 Next Steps:')
        console.log('1. Check your email inbox (and spam folder)')
        console.log(
            '2. If not received, check Brevo dashboard for delivery status'
        )
        console.log('3. Verify sender email in Brevo account')
    } catch (err) {
        console.error('❌ Brevo API test failed:', err.message)
        console.error('📧 Error details:', err)

        if (err.message.includes('Invalid API key')) {
            console.log('\n🔧 Solution: Check your BREVO_API_KEY in .env file')
        } else if (err.message.includes('sender')) {
            console.log('\n🔧 Solution: Verify sender email in Brevo account')
        }
    }
}

testBrevoEmail()
