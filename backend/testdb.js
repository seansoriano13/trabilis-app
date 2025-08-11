import { query } from './src/config/db.js'

function safeParseJson(data, fallback = null) {
    if (data === null || data === undefined) return fallback
    if (typeof data === 'object') return data
    if (typeof data === 'string') {
        try {
            return JSON.parse(data)
        } catch {
            return fallback
        }
    }
    return fallback
}

async function testSelectBookingByReference(bookingReference) {
    try {
        const sql = `
            SELECT amadeus_order_id, status, passenger_details, search_criteria 
            FROM flight_bookings 
            WHERE booking_reference = ?
        `
        const params = [bookingReference]

        const result = await query(sql, params)
        // result is an array of rows or result.rows depending on your query function

        // Support both: result.rows (e.g. pg) or direct array (e.g. mysql2)
        const booking = result.rows ? result.rows[0] : result[0]

        if (!booking) {
            console.log('No booking found for', bookingReference)
            return
        }

        // Optionally parse JSON fields safely
        booking.passenger_details = safeParseJson(booking.passenger_details)
        booking.search_criteria = safeParseJson(booking.search_criteria)

        console.log('Flight booking:', booking)
    } catch (error) {
        console.error('Failed to fetch flight booking:', error)
    }
}

// Replace with an actual booking reference you want to test
testSelectBookingByReference('TRB-FLT-7d809c8e-812b-4d68-bedd-6b362c3b6737')
