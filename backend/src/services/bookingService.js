import { supabase } from '../config/supabaseClient.js'

/**
 * Check booking status for a given booking reference
 * @param {string} bookingReference - The booking reference to check
 * @param {string} bookingType - The type of booking ('flight' or 'tour')
 * @returns {Object} - Object containing status, searchCriteria, and pnr
 */
export async function checkBookingStatus(
    bookingReference,
    bookingType = 'flight'
) {
    try {
        const tableName =
            bookingType === 'flight' ? 'flight_bookings' : 'tour_bookings'
        const selectFields =
            bookingType === 'flight'
                ? 'status, search_criteria, pnr'
                : 'status, package_dates(*)'

        const { data, error } = await supabase
            .from(tableName)
            .select(selectFields)
            .eq('booking_reference', bookingReference)
            .single()

        if (error || !data) {
            throw new Error(`Booking ${bookingReference} not found`)
        }

        return {
            status: data.status,
            searchCriteria: data.search_criteria,
            pnr: data.pnr,
            bookingType: bookingType,
        }
    } catch (error) {
        console.error(`Failed to check status for ${bookingReference}:`, error)
        throw new Error(`Failed to check booking status: ${error.message}`)
    }
}
