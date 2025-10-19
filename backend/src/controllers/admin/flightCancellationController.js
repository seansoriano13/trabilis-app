import { supabase } from '../../config/supabaseClient.js'
import { cancelFlightBooking, cancelMultipleBookings, getCancellationInfo } from '../../services/cancellationService.js'

/**
 * Cancel single flight booking (admin)
 */
export const cancelFlightBookingAdmin = async (req, res) => {
    try {
        const { id } = req.params
        const { reason, adminSignature } = req.body

        if (!id) {
            return res.status(400).json({ 
                success: false,
                error: 'Booking ID is required',
            })
        }

        // Get booking details
        const { data: booking, error: fetchError } = await supabase
            .from('flight_bookings')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !booking) {
            return res.status(404).json({ 
                success: false,
                error: 'Booking not found',
            })
        }

        // Validate admin signature (simple validation)
        if (!adminSignature || adminSignature.trim().length < 3) {
            return res.status(400).json({
                success: false,
                error: 'Admin signature is required for cancellation'
            })
        }

        // Get cancellation info to validate eligibility
        const cancellationInfo = await getCancellationInfo(booking.booking_reference)
        
        if (!cancellationInfo.canCancel) {
            return res.status(400).json({
                success: false,
                error: `Cannot cancel booking: ${cancellationInfo.blockReason}`,
                details: {
                    status: cancellationInfo.status,
                    hasDeparted: cancellationInfo.hasDeparted
                }
            })
        }

        // Perform cancellation
        const result = await cancelFlightBooking(
            booking.booking_reference, 
            reason || `Cancelled by admin (${adminSignature})`, 
            'admin'
        )

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: result,
            adminSignature: adminSignature
        })
    } catch (error) {
        console.error('Error cancelling flight booking:', error)
        res.status(500).json({ 
            success: false,
            error: 'Failed to cancel booking',
            message: error.message,
        })
    }
}

/**
 * Cancel multiple flight bookings (admin)
 */
export const cancelMultipleFlightBookings = async (req, res) => {
    try {
        const { bookingIds, reason, adminSignature } = req.body

        if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Booking IDs array is required'
            })
        }

        if (!adminSignature || adminSignature.trim().length < 3) {
            return res.status(400).json({
                success: false,
                error: 'Admin signature is required for bulk cancellation'
            })
        }

        // Get booking references
        const { data: bookings, error: fetchError } = await supabase
            .from('flight_bookings')
            .select('booking_reference')
            .in('id', bookingIds)

        if (fetchError) {
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch bookings'
            })
        }

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No bookings found'
            })
        }

        const bookingReferences = bookings.map(b => b.booking_reference)
        const cancellationReason = reason || `Bulk cancelled by admin (${adminSignature})`

        // Perform bulk cancellation
        const result = await cancelMultipleBookings(
            bookingReferences, 
            cancellationReason, 
            'admin'
        )

        res.json({
            success: true,
            message: `Bulk cancellation completed: ${result.successful} successful, ${result.failed} failed`,
            data: result,
            adminSignature: adminSignature
        })
    } catch (error) {
        console.error('Error in bulk cancellation:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to perform bulk cancellation',
            message: error.message
        })
    }
}

/**
 * Get cancellation eligibility for multiple bookings
 */
export const getBulkCancellationInfo = async (req, res) => {
    try {
        const { bookingIds } = req.query

        if (!bookingIds) {
            return res.status(400).json({
                success: false,
                error: 'Booking IDs are required'
            })
        }

        const ids = Array.isArray(bookingIds) ? bookingIds : bookingIds.split(',')
        
        // Get booking details
        const { data: bookings, error: fetchError } = await supabase
            .from('flight_bookings')
            .select('id, booking_reference, status, total_amount, currency, amadeus_flight_offer')
            .in('id', ids)

        if (fetchError) {
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch bookings'
            })
        }

        // Get cancellation info for each booking
        const cancellationInfos = await Promise.all(
            bookings.map(async (booking) => {
                try {
                    const info = await getCancellationInfo(booking.booking_reference)
                    return {
                        id: booking.id,
                        bookingReference: booking.booking_reference,
                        status: booking.status,
                        totalAmount: booking.total_amount,
                        currency: booking.currency,
                        ...info
                    }
                } catch (error) {
                    return {
                        id: booking.id,
                        bookingReference: booking.booking_reference,
                        status: booking.status,
                        totalAmount: booking.total_amount,
                        currency: booking.currency,
                        canCancel: false,
                        blockReason: 'Error checking cancellation eligibility',
                        error: error.message
                    }
                }
            })
        )

        const canCancelAll = cancellationInfos.every(info => info.canCancel)
        const canCancelSome = cancellationInfos.some(info => info.canCancel)
        const totalAmount = cancellationInfos
            .filter(info => info.canCancel)
            .reduce((sum, info) => sum + (info.totalAmount || 0), 0)

        res.json({
            success: true,
            data: {
                bookings: cancellationInfos,
                summary: {
                    total: cancellationInfos.length,
                    canCancel: cancellationInfos.filter(info => info.canCancel).length,
                    cannotCancel: cancellationInfos.filter(info => !info.canCancel).length,
                    canCancelAll,
                    canCancelSome,
                    totalRefundableAmount: totalAmount
                }
            }
        })
    } catch (error) {
        console.error('Error getting bulk cancellation info:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get cancellation information',
            message: error.message
        })
    }
}

/**
 * Get cancellation statistics for dashboard
 */
export const getCancellationStats = async (req, res) => {
    try {
        const { period = '30' } = req.query // days
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - parseInt(period))

        // Get cancellation statistics
        const { data: stats, error: statsError } = await supabase
            .from('flight_bookings')
            .select('status, cancelled_at, amadeus_cancellation_status, total_amount')
            .gte('cancelled_at', startDate.toISOString())
            .not('cancelled_at', 'is', null)

        if (statsError) {
            throw statsError
        }

        const totalCancelled = stats.length
        const amadeusSuccess = stats.filter(s => s.amadeus_cancellation_status === 'SUCCESS').length
        const amadeusFailed = stats.filter(s => s.amadeus_cancellation_status === 'FAILED').length
        const notApplicable = stats.filter(s => s.amadeus_cancellation_status === 'NOT_APPLICABLE').length
        
        const totalRefunded = stats.reduce((sum, s) => sum + (s.total_amount || 0), 0)

        res.json({
            success: true,
            data: {
                period: `${period} days`,
                totalCancelled,
                amadeusCancellation: {
                    successful: amadeusSuccess,
                    failed: amadeusFailed,
                    notApplicable: notApplicable
                },
                totalRefunded,
                averageRefund: totalCancelled > 0 ? totalRefunded / totalCancelled : 0
            }
        })
    } catch (error) {
        console.error('Error getting cancellation stats:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get cancellation statistics',
            message: error.message
        })
    }
}
