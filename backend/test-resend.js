import { Resend } from 'resend'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

async function testResendConnection() {
    try {
        console.log('🧪 Testing Resend connection...')
        console.log('🔑 API Key present:', !!process.env.RESEND_API_KEY)
        console.log('📧 From email:', process.env.RESEND_FROM_EMAIL || 'Trabilis <onboarding@resend.dev>')
        
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY not found in environment variables')
        }

        // Test sending a simple email
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Trabilis <onboarding@resend.dev>',
            to: ['arkadatax03@gmail.com'], // Test email to your own address
            subject: 'Test Email from Trabilis',
            html: '<p>This is a test email to verify Resend integration.</p>',
        })

        if (error) {
            console.error('❌ Resend test failed:', error)
            return false
        }

        console.log('✅ Resend connection successful!')
        console.log('📧 Email ID:', data?.id)
        return true
    } catch (err) {
        console.error('❌ Resend test error:', err.message)
        return false
    }
}

// Run the test
testResendConnection()
    .then(success => {
        if (success) {
            console.log('\n🎉 Resend integration is working!')
            console.log('📝 Next steps:')
            console.log('1. Add RESEND_API_KEY to your .env file')
            console.log('2. Add RESEND_FROM_EMAIL to your .env file')
            console.log('3. Deploy to Render with the new environment variables')
        } else {
            console.log('\n❌ Resend integration needs configuration')
            console.log('📝 Required:')
            console.log('1. Get API key from https://resend.com')
            console.log('2. Add RESEND_API_KEY to your .env file')
            console.log('3. Add RESEND_FROM_EMAIL to your .env file')
        }
        process.exit(success ? 0 : 1)
    })
    .catch(err => {
        console.error('💥 Test script error:', err)
        process.exit(1)
    })
