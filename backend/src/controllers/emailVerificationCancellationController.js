import {
    createCancellationToken,
    verifyCancellationToken,
    getTokenStatus,
} from '../services/cancellationTokenService.js'
import { cancelFlightBooking } from '../services/cancellationService.js'
import { sendCancellationConfirmationEmail } from '../services/brevoEmailService.js'
import { supabase } from '../config/supabaseClient.js'

/**
 * Request cancellation (sends verification email)
 */
export const requestCancellation = async (req, res) => {
    try {
        const { booking_reference, email, reason } = req.body

        if (!booking_reference || !email) {
            return res.status(400).json({
                success: false,
                error: 'Booking reference and email are required',
            })
        }

        // Get client IP and user agent for security
        const ipAddress =
            req.ip ||
            req.connection.remoteAddress ||
            req.headers['x-forwarded-for']
        const userAgent = req.headers['user-agent']

        // Create cancellation token and send verification email
        const result = await createCancellationToken(
            booking_reference,
            email,
            reason,
            ipAddress,
            userAgent
        )

        res.json({
            success: true,
            message: result.message,
            expiresAt: result.expiresAt,
        })
    } catch (error) {
        console.error('Error requesting cancellation:', error)
        res.status(400).json({
            success: false,
            error: error.message,
        })
    }
}

/**
 * Verify cancellation token and complete cancellation
 */
export const verifyCancellation = async (req, res) => {
    try {
        const { token } = req.body

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Cancellation token is required',
            })
        }

        // Get client IP and user agent for security
        const ipAddress =
            req.ip ||
            req.connection.remoteAddress ||
            req.headers['x-forwarded-for']
        const userAgent = req.headers['user-agent']

        // Verify token
        const tokenData = await verifyCancellationToken(
            token,
            ipAddress,
            userAgent
        )

        // Perform actual cancellation
        const cancellationResult = await cancelFlightBooking(
            tokenData.bookingReference,
            tokenData.cancellationReason,
            'client_email_verified'
        )

        // Send confirmation email
        try {
            const { data: booking } = await supabase
                .from('flight_bookings')
                .select(
                    'passenger_details, total_amount, currency, cancelled_at'
                )
                .eq('booking_reference', tokenData.bookingReference)
                .single()

            if (booking) {
                const primaryTraveler =
                    booking.passenger_details?.travelers?.[0]
                await sendCancellationConfirmationEmail({
                    email: tokenData.email,
                    firstName:
                        primaryTraveler?.name?.firstName || 'Valued Customer',
                    lastName: primaryTraveler?.name?.lastName || '',
                    bookingReference: tokenData.bookingReference,
                    totalAmount: booking.total_amount,
                    currency: booking.currency,
                    cancelledAt: booking.cancelled_at,
                })
            }
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError)
            // Don't fail the cancellation for email errors
        }

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: cancellationResult,
        })
    } catch (error) {
        console.error('Error verifying cancellation:', error)
        res.status(400).json({
            success: false,
            error: error.message,
        })
    }
}

/**
 * Check token status (for frontend polling)
 */
export const checkTokenStatus = async (req, res) => {
    try {
        const { token } = req.query

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token is required',
            })
        }

        const status = await getTokenStatus(token)

        res.json({
            success: true,
            data: status,
        })
    } catch (error) {
        console.error('Error checking token status:', error)
        res.status(400).json({
            success: false,
            error: error.message,
        })
    }
}

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (req, res) => {
    try {
        const { booking_reference, email } = req.body

        if (!booking_reference || !email) {
            return res.status(400).json({
                success: false,
                error: 'Booking reference and email are required',
            })
        }

        // Get client IP and user agent for security
        const ipAddress =
            req.ip ||
            req.connection.remoteAddress ||
            req.headers['x-forwarded-for']
        const userAgent = req.headers['user-agent']

        // Create new token (this will invalidate any existing tokens)
        const result = await createCancellationToken(
            booking_reference,
            email,
            null, // No reason for resend
            ipAddress,
            userAgent
        )

        res.json({
            success: true,
            message: 'Verification email resent successfully',
            expiresAt: result.expiresAt,
        })
    } catch (error) {
        console.error('Error resending verification email:', error)
        res.status(400).json({
            success: false,
            error: error.message,
        })
    }
}
