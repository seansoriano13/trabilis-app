import { supabase } from '../config/supabaseClient.js'
import { sendConfirmationEmail } from '../services/emailService.js'
import Pusher from 'pusher'

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

const pusher = new Pusher({
    appId: '2048372',
    key: '371c6201af1a663a4f58',
    secret: 'b4a5985ecd6d27690c8b',
    cluster: 'ap1',
    useTLS: true,
})

export const sendTestNotification = async (req, res) => {
    try {
        const { bookingReference, pnr } = req.body

        if (!bookingReference || !pnr) {
            return res.status(400).json({
                success: false,
                message: 'bookingReference and pnr are required',
            })
        }

        // Save to Supabase so it persists after reload
        const { error: insertError } = await supabase
            .from('admin_notifications')
            .insert([
                {
                    type: 'new_booking',
                    message: `Booking ${bookingReference} finalized with PNR: ${pnr}`,
                    booking_reference: bookingReference,
                    created_at: new Date().toISOString(),
                },
            ])

        if (insertError) {
            console.error('Supabase insert error:', insertError.message)
            return res.status(500).json({
                success: false,
                message: 'Failed to save notification in database',
            })
        }

        // Send real-time notification
        await pusher.trigger('admin-notifications', 'new-booking', {
            bookingReference,
            pnr,
        })

        return res.status(200).json({
            success: true,
            message: 'Test notification sent successfully',
        })
    } catch (err) {
        console.error('Pusher error:', err)
        return res.status(500).json({
            success: false,
            message: 'Failed to send test notification',
        })
    }
}
