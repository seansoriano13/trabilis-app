// assignmentService.js
import { supabase } from '../config/supabaseClient.js'

/**
 * Auto-assigns a booking to appropriate staff member using round-robin approach
 * @param {string} bookingType - 'tour', 'flight', 'visa-inquiry', or 'visa-processing'
 * @param {number} bookingId - The ID of the booking to assign
 * @returns {Object} - Assignment result with staff info
 */
const autoAssignBooking = async (bookingType, bookingId) => {
    try {
        // Get appropriate staff role and table name
        const staffRole = getStaffRole(bookingType)
        const tableName = getTableName(bookingType)

        // Get all active staff for the appropriate role, ordered by last assignment (oldest first)
        const { data: staff, error: staffError } = await supabase
            .from('admins')
            .select('id, first_name, last_name, email, last_assigned_at')
            .eq('role', staffRole)
            .order('last_assigned_at', { ascending: true, nullsFirst: true })

        if (staffError) {
            console.error(`Error fetching ${staffRole} staff:`, staffError)
            throw new Error(`Failed to fetch ${staffRole} staff`)
        }

        if (!staff || staff.length === 0) {
            console.warn(`No ${staffRole} staff found for auto-assignment`)
            return { success: false, error: `No ${staffRole} staff available` }
        }

        // Select the staff member who was assigned least recently (round-robin)
        const assignedStaff = staff[0]

        // Update the booking with assignment
        const { error: bookingError } = await supabase
            .from(tableName)
            .update({
                assigned_to: assignedStaff.id,
                assigned_at: new Date().toISOString(),
                assignment_status: 'pending'
            })
            .eq('id', bookingId)

        if (bookingError) {
            console.error(`Error updating ${bookingType} booking:`, bookingError)
            throw new Error(`Failed to assign ${bookingType} booking`)
        }

        // Update the staff member's last_assigned_at timestamp
        const { error: staffUpdateError } = await supabase
            .from('admins')
            .update({ last_assigned_at: new Date().toISOString() })
            .eq('id', assignedStaff.id)

        if (staffUpdateError) {
            console.error('Error updating staff assignment timestamp:', staffUpdateError)
            // Don't throw error here as the main assignment was successful
        }

        console.log(`Auto-assigned ${bookingType} booking ${bookingId} to ${assignedStaff.first_name} ${assignedStaff.last_name}`)

        return {
            success: true,
            assignedStaff: {
                id: assignedStaff.id,
                name: `${assignedStaff.first_name} ${assignedStaff.last_name}`,
                email: assignedStaff.email
            }
        }

    } catch (error) {
        console.error('Auto-assignment error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Manually reassigns a booking to a specific staff member
 * @param {string} bookingType - 'tour', 'flight', 'visa-inquiry', or 'visa-processing'
 * @param {number} bookingId - The ID of the booking to reassign
 * @param {string} staffId - The ID of the staff member to assign to
 * @param {string} assignedBy - The ID of the admin making the reassignment
 * @returns {Object} - Reassignment result
 */
const manualReassignBooking = async (bookingType, bookingId, staffId, assignedBy) => {
    try {
        // Get staff info
        const { data: staff, error: staffError } = await supabase
            .from('admins')
            .select('id, first_name, last_name, email')
            .eq('id', staffId)
            .single()

        if (staffError || !staff) {
            throw new Error('Invalid staff member')
        }

        // Get table name for the booking type
        const tableName = getTableName(bookingType)

        // Update the booking with new assignment
        const { error: bookingError } = await supabase
            .from(tableName)
            .update({
                assigned_to: staffId,
                assigned_by: assignedBy,
                assigned_at: new Date().toISOString(),
                assignment_status: 'pending'
            })
            .eq('id', bookingId)

        if (bookingError) {
            throw new Error(`Failed to reassign ${bookingType} booking`)
        }

        // Update staff's last_assigned_at
        await supabase
            .from('admins')
            .update({ last_assigned_at: new Date().toISOString() })
            .eq('id', staffId)

        return {
            success: true,
            assignedStaff: {
                id: staff.id,
                name: `${staff.first_name} ${staff.last_name}`,
                email: staff.email
            }
        }

    } catch (error) {
        console.error('Manual reassignment error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Gets assignment statistics for dashboard
 * @returns {Object} - Assignment statistics
 */
const getAssignmentStats = async () => {
    try {
        // Get total accounting staff
        const { count: totalAccountingStaff } = await supabase
            .from('admins')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'accounting')

        // Get total travel consultant staff
        const { count: totalTravelConsultants } = await supabase
            .from('admins')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'travel_consultant')

        // Get pending assignments for each booking type
        const { count: pendingTours } = await supabase
            .from('tour_bookings')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_status', 'pending')

        const { count: pendingFlights } = await supabase
            .from('flight_bookings')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_status', 'pending')

        const { count: pendingVisaInquiries } = await supabase
            .from('visa_inquiries')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_status', 'pending')

        const { count: pendingVisaProcessings } = await supabase
            .from('visa_processings')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_status', 'pending')

        // Get in-progress assignments for each booking type
        const { count: inProgressTours } = await supabase
            .from('tour_bookings')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_status', 'in_progress')

        const { count: inProgressFlights } = await supabase
            .from('flight_bookings')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_status', 'in_progress')

        const { count: inProgressVisaInquiries } = await supabase
            .from('visa_inquiries')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_status', 'in_progress')

        const { count: inProgressVisaProcessings } = await supabase
            .from('visa_processings')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_status', 'in_progress')

        return {
            success: true,
            stats: {
                totalAccountingStaff: totalAccountingStaff || 0,
                totalTravelConsultants: totalTravelConsultants || 0,
                pendingAssignments: (pendingTours || 0) + (pendingFlights || 0) + (pendingVisaInquiries || 0) + (pendingVisaProcessings || 0),
                inProgressAssignments: (inProgressTours || 0) + (inProgressFlights || 0) + (inProgressVisaInquiries || 0) + (inProgressVisaProcessings || 0),
                pendingTours: pendingTours || 0,
                pendingFlights: pendingFlights || 0,
                pendingVisaInquiries: pendingVisaInquiries || 0,
                pendingVisaProcessings: pendingVisaProcessings || 0,
                inProgressTours: inProgressTours || 0,
                inProgressFlights: inProgressFlights || 0,
                inProgressVisaInquiries: inProgressVisaInquiries || 0,
                inProgressVisaProcessings: inProgressVisaProcessings || 0
            }
        }

    } catch (error) {
        console.error('Assignment stats error:', error)
        return { success: false, error: error.message }
    }
}

// Helper functions
const getTableName = (bookingType) => {
    const tableMap = {
        'tour': 'tour_bookings',
        'flight': 'flight_bookings',
        'visa-inquiry': 'visa_inquiries',
        'visa-processing': 'visa_processings'
    }
    return tableMap[bookingType]
}

const getStaffRole = (bookingType) => {
    // Visa assignments go to travel consultants, others to accounting
    return ['visa-inquiry', 'visa-processing'].includes(bookingType) 
        ? 'travel_consultant' 
        : 'accounting'
}

export {
    autoAssignBooking,
    manualReassignBooking,
    getAssignmentStats
}
