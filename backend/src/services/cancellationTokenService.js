import { supabase } from '../config/supabaseClient.js'
import crypto from 'crypto'
import { sendCancellationVerificationEmail } from './brevoEmailService.js'

/**
 * Generate a secure random token
 */
function generateSecureToken() {
    return crypto.randomBytes(32).toString('hex')
}

/**
 * Create a cancellation verification token
 */
export async function createCancellationToken(bookingReference, email, cancellationReason = null, ipAddress = null, userAgent = null) {
    try {
        console.log(`[CANCELLATION TOKEN] Creating token for booking: ${bookingReference}`)
        
        // Validate booking exists and get details
        const { data: booking, error: bookingError } = await supabase
            .from('flight_bookings')
            .select('booking_reference, status, passenger_details, total_amount, currency')
            .eq('booking_reference', bookingReference)
            .single()

        if (bookingError || !booking) {
            throw new Error(`Booking ${bookingReference} not found`)
        }

        // Validate email matches booking
        const primaryTraveler = booking.passenger_details?.travelers?.[0]
        const bookingEmail = primaryTraveler?.contact?.emailAddress
        
        if (!bookingEmail || bookingEmail.toLowerCase() !== email.toLowerCase()) {
            throw new Error('Email address does not match the booking')
        }

        // Check if booking can be cancelled
        if (!['PENDING_PAYMENT', 'PAID_PENDING_BOOKING', 'BOOKED'].includes(booking.status)) {
            throw new Error(`Booking cannot be cancelled. Current status: ${booking.status}`)
        }

        // Generate secure token
        const token = generateSecureToken()
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiration

        // Create token record
        const { data: tokenData, error: tokenError } = await supabase
            .from('cancellation_tokens')
            .insert({
                token,
                booking_reference: bookingReference,
                email: email.toLowerCase(),
                expires_at: expiresAt.toISOString(),
                ip_address: ipAddress,
                user_agent: userAgent,
                cancellation_reason: cancellationReason,
                status: 'PENDING'
            })
            .select()
            .single()

        if (tokenError) {
            throw new Error(`Failed to create cancellation token: ${tokenError.message}`)
        }

        // Send verification email
        try {
            await sendCancellationVerificationEmail({
                email,
                firstName: primaryTraveler?.name?.firstName || 'Valued Customer',
                lastName: primaryTraveler?.name?.lastName || '',
                bookingReference,
                token,
                totalAmount: booking.total_amount,
                currency: booking.currency,
                cancellationReason
            })
            
            console.log(`[CANCELLATION TOKEN] ✅ Verification email sent to ${email}`)
        } catch (emailError) {
            console.error(`[CANCELLATION TOKEN] Failed to send verification email:`, emailError)
            // Don't fail token creation for email errors
        }

        console.log(`[CANCELLATION TOKEN] ✅ Token created successfully: ${token}`)
        return {
            success: true,
            token,
            expiresAt: expiresAt.toISOString(),
            message: 'Verification email sent. Please check your inbox and click the link to confirm cancellation.'
        }

    } catch (error) {
        console.error(`[CANCELLATION TOKEN] Failed to create token for ${bookingReference}:`, error)
        throw error
    }
}

/**
 * Verify and use a cancellation token
 */
export async function verifyCancellationToken(token, ipAddress = null, userAgent = null) {
    try {
        console.log(`[CANCELLATION TOKEN] Verifying token: ${token}`)
        
        // Get token details
        const { data: tokenData, error: tokenError } = await supabase
            .from('cancellation_tokens')
            .select('*')
            .eq('token', token)
            .single()

        if (tokenError || !tokenData) {
            throw new Error('Invalid or expired cancellation token')
        }

        // Check if token is still valid
        if (tokenData.status !== 'PENDING') {
            throw new Error(`Token has already been ${tokenData.status.toLowerCase()}`)
        }

        // Check expiration
        const now = new Date()
        const expiresAt = new Date(tokenData.expires_at)
        
        if (now > expiresAt) {
            // Mark as expired
            await supabase
                .from('cancellation_tokens')
                .update({ status: 'EXPIRED' })
                .eq('id', tokenData.id)
            
            throw new Error('Cancellation token has expired')
        }

        // Mark token as used
        const { error: updateError } = await supabase
            .from('cancellation_tokens')
            .update({ 
                status: 'USED',
                used_at: now.toISOString()
            })
            .eq('id', tokenData.id)

        if (updateError) {
            throw new Error(`Failed to mark token as used: ${updateError.message}`)
        }

        console.log(`[CANCELLATION TOKEN] ✅ Token verified successfully for booking: ${tokenData.booking_reference}`)
        
        return {
            success: true,
            bookingReference: tokenData.booking_reference,
            email: tokenData.email,
            cancellationReason: tokenData.cancellation_reason,
            tokenData
        }

    } catch (error) {
        console.error(`[CANCELLATION TOKEN] Token verification failed:`, error)
        throw error
    }
}

/**
 * Get token status (for checking if link was clicked)
 */
export async function getTokenStatus(token) {
    try {
        const { data: tokenData, error } = await supabase
            .from('cancellation_tokens')
            .select('status, expires_at, used_at, booking_reference')
            .eq('token', token)
            .single()

        if (error || !tokenData) {
            return { valid: false, status: 'INVALID' }
        }

        const now = new Date()
        const expiresAt = new Date(tokenData.expires_at)
        
        if (now > expiresAt && tokenData.status === 'PENDING') {
            return { valid: false, status: 'EXPIRED' }
        }

        return {
            valid: tokenData.status === 'PENDING',
            status: tokenData.status,
            expiresAt: tokenData.expires_at,
            usedAt: tokenData.used_at,
            bookingReference: tokenData.booking_reference
        }
    } catch (error) {
        console.error(`[CANCELLATION TOKEN] Failed to get token status:`, error)
        return { valid: false, status: 'ERROR' }
    }
}

/**
 * Clean up expired tokens (run periodically)
 */
export async function cleanupExpiredTokens() {
    try {
        const now = new Date().toISOString()
        
        const { data: expiredTokens, error } = await supabase
            .from('cancellation_tokens')
            .update({ status: 'EXPIRED' })
            .lt('expires_at', now)
            .eq('status', 'PENDING')
            .select('id')

        if (error) {
            console.error('[CANCELLATION TOKEN] Failed to cleanup expired tokens:', error)
            return 0
        }

        const count = expiredTokens?.length || 0
        console.log(`[CANCELLATION TOKEN] Cleaned up ${count} expired tokens`)
        return count
    } catch (error) {
        console.error('[CANCELLATION TOKEN] Error during token cleanup:', error)
        return 0
    }
}

/**
 * Invalidate all tokens for a booking (if booking is cancelled through other means)
 */
export async function invalidateBookingTokens(bookingReference) {
    try {
        const { data, error } = await supabase
            .from('cancellation_tokens')
            .update({ status: 'INVALIDATED' })
            .eq('booking_reference', bookingReference)
            .eq('status', 'PENDING')
            .select('id')

        if (error) {
            console.error(`[CANCELLATION TOKEN] Failed to invalidate tokens for ${bookingReference}:`, error)
            return 0
        }

        const count = data?.length || 0
        console.log(`[CANCELLATION TOKEN] Invalidated ${count} tokens for booking ${bookingReference}`)
        return count
    } catch (error) {
        console.error(`[CANCELLATION TOKEN] Error invalidating tokens:`, error)
        return 0
    }
}
