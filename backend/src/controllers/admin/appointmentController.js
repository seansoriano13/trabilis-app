import { supabase } from '../../config/supabaseClient.js'
import Pusher from 'pusher'

const pusher = new Pusher({
    appId: '2048372',
    key: '371c6201af1a663a4f58',
    secret: 'b4a5985ecd6d27690c8b',
    cluster: 'ap1',
    useTLS: true,
})

// Get all accounting staff
export const getAccountingStaff = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('admins')
            .select('id, email, first_name, last_name, role')
            .eq('role', 'accounting')
            .order('first_name')

        if (error) throw error

        res.json({
            success: true,
            data: data || []
        })
    } catch (error) {
        console.error('Error fetching accounting staff:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch accounting staff'
        })
    }
}

// Get all staff members (for assignment purposes)
export const getAllStaff = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('admins')
            .select('id, email, first_name, last_name, role')
            .in('role', ['accounting', 'travel_consultant'])
            .order('first_name')

        if (error) throw error

        res.json({
            success: true,
            data: data || []
        })
    } catch (error) {
        console.error('Error fetching all staff:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch staff members'
        })
    }
}

// Assign tour booking to accounting staff
export const assignTourBooking = async (req, res) => {
    try {
        const { bookingId, assignedTo, assignedBy } = req.body

        if (!bookingId || !assignedTo || !assignedBy) {
            return res.status(400).json({
                success: false,
                message: 'bookingId, assignedTo, and assignedBy are required'
            })
        }

        // If assignedBy is an email, get the admin ID
        let assignedById = assignedBy
        if (assignedBy.includes('@')) {
            const { data: admin, error: adminError } = await supabase
                .from('admins')
                .select('id')
                .eq('email', assignedBy)
                .single()
            
            if (adminError || !admin) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin user not found'
                })
            }
            assignedById = admin.id
        }

        // Update tour booking assignment
        const { data: booking, error: updateError } = await supabase
            .from('tour_bookings')
            .update({
                assigned_to: assignedTo,
                assigned_by: assignedById,
                assigned_at: new Date().toISOString(),
                assignment_status: 'pending'
            })
            .eq('id', bookingId)
            .select(`
                *,
                package_dates (
                    tour_packages (title)
                )
            `)
            .single()

        if (updateError) throw updateError

        // Get assigned staff details
        const { data: staff, error: staffError } = await supabase
            .from('admins')
            .select('email, first_name, last_name')
            .eq('id', assignedTo)
            .single()

        if (staffError) throw staffError

        // Create notification
        const { error: notificationError } = await supabase
            .from('admin_notifications')
            .insert([{
                type: 'booking_assigned',
                message: `Tour booking ${booking.booking_reference} has been assigned to you`,
                booking_reference: booking.booking_reference,
                assigned_to: assignedTo,
                assigned_by: assignedById,
                booking_type: 'tour',
                booking_id: null,
                created_at: new Date().toISOString()
            }])

        if (notificationError) {
            console.error('Notification insert error:', notificationError)
        }

        // Send real-time notification
        await pusher.trigger('admin-notifications', 'booking-assigned', {
            bookingReference: booking.booking_reference,
            bookingType: 'tour',
            bookingId: bookingId,
            assignedTo: assignedTo,
            packageTitle: booking.package_dates?.tour_packages?.title || 'Unknown Package'
        })

        res.json({
            success: true,
            message: 'Tour booking assigned successfully',
            data: booking
        })
    } catch (error) {
        console.error('Error assigning tour booking:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to assign tour booking'
        })
    }
}

// Assign flight booking to accounting staff
export const assignFlightBooking = async (req, res) => {
    try {
        const { bookingId, assignedTo, assignedBy } = req.body

        if (!bookingId || !assignedTo || !assignedBy) {
            return res.status(400).json({
                success: false,
                message: 'bookingId, assignedTo, and assignedBy are required'
            })
        }

        // If assignedBy is an email, get the admin ID
        let assignedById = assignedBy
        if (assignedBy.includes('@')) {
            const { data: admin, error: adminError } = await supabase
                .from('admins')
                .select('id')
                .eq('email', assignedBy)
                .single()
            
            if (adminError || !admin) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin user not found'
                })
            }
            assignedById = admin.id
        }

        // Update flight booking assignment
        const { data: booking, error: updateError } = await supabase
            .from('flight_bookings')
            .update({
                assigned_to: assignedTo,
                assigned_by: assignedById,
                assigned_at: new Date().toISOString(),
                assignment_status: 'pending'
            })
            .eq('id', bookingId)
            .select('*')
            .single()

        if (updateError) throw updateError

        // Create notification
        const { error: notificationError } = await supabase
            .from('admin_notifications')
            .insert([{
                type: 'booking_assigned',
                message: `Flight booking ${booking.booking_reference} has been assigned to you`,
                booking_reference: booking.booking_reference,
                assigned_to: assignedTo,
                assigned_by: assignedById,
                booking_type: 'flight',
                booking_id: null,
                created_at: new Date().toISOString()
            }])

        if (notificationError) {
            console.error('Notification insert error:', notificationError)
        }

        // Send real-time notification
        await pusher.trigger('admin-notifications', 'booking-assigned', {
            bookingReference: booking.booking_reference,
            bookingType: 'flight',
            bookingId: bookingId,
            assignedTo: assignedTo,
            destination: booking.search_criteria?.destination || 'Unknown Destination'
        })

        res.json({
            success: true,
            message: 'Flight booking assigned successfully',
            data: booking
        })
    } catch (error) {
        console.error('Error assigning flight booking:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to assign flight booking'
        })
    }
}

// Update assignment status
export const updateAssignmentStatus = async (req, res) => {
    try {
        const { bookingId, bookingType, status, updatedBy } = req.body

        if (!bookingId || !bookingType || !status || !updatedBy) {
            return res.status(400).json({
                success: false,
                message: 'bookingId, bookingType, status, and updatedBy are required'
            })
        }

        const validStatuses = ['pending', 'in_progress', 'completed']
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: pending, in_progress, completed'
            })
        }

        const tableName = bookingType === 'tour' ? 'tour_bookings' : 'flight_bookings'
        
        const { data: booking, error: updateError } = await supabase
            .from(tableName)
            .update({
                assignment_status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId)
            .select('*')
            .single()

        if (updateError) throw updateError

        res.json({
            success: true,
            message: 'Assignment status updated successfully',
            data: booking
        })
    } catch (error) {
        console.error('Error updating assignment status:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to update assignment status'
        })
    }
}

// Get assigned bookings for accounting staff
export const getAssignedBookings = async (req, res) => {
    try {
        const { userId, bookingType, status } = req.query
        const page = parseInt(req.query.page) || 0
        const pageSize = parseInt(req.query.pageSize) || 10

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            })
        }

        let query = supabase
            .from(bookingType === 'flight' ? 'flight_bookings' : 'tour_bookings')
            .select('*', { count: 'exact' })
            .eq('assigned_to', userId)
            .range(page * pageSize, (page + 1) * pageSize - 1)
            .order('assigned_at', { ascending: false })

        if (status && status !== 'All') {
            query = query.eq('assignment_status', status)
        }

        const { data, error, count } = await query

        if (error) throw error

        res.json({
            success: true,
            data: data || [],
            total: count || 0,
            page,
            pageSize
        })
    } catch (error) {
        console.error('Error fetching assigned bookings:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assigned bookings'
        })
    }
}

// Reassign booking to different staff
export const reassignBooking = async (req, res) => {
    try {
        const { bookingId, bookingType, newAssignedTo, reassignedBy } = req.body

        if (!bookingId || !bookingType || !newAssignedTo || !reassignedBy) {
            return res.status(400).json({
                success: false,
                message: 'bookingId, bookingType, newAssignedTo, and reassignedBy are required'
            })
        }

        // If reassignedBy is an email, get the admin ID
        let reassignedById = reassignedBy
        if (reassignedBy.includes('@')) {
            const { data: admin, error: adminError } = await supabase
                .from('admins')
                .select('id')
                .eq('email', reassignedBy)
                .single()
            
            if (adminError || !admin) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin user not found'
                })
            }
            reassignedById = admin.id
        }

        const tableName = bookingType === 'tour' ? 'tour_bookings' : 'flight_bookings'
        
        const { data: booking, error: updateError } = await supabase
            .from(tableName)
            .update({
                assigned_to: newAssignedTo,
                assigned_by: reassignedById,
                assigned_at: new Date().toISOString(),
                assignment_status: 'pending'
            })
            .eq('id', bookingId)
            .select('*')
            .single()

        if (updateError) throw updateError

        // Create reassignment notification
        const { error: notificationError } = await supabase
            .from('admin_notifications')
            .insert([{
                type: 'booking_reassigned',
                message: `${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)} booking ${booking.booking_reference} has been reassigned to you`,
                booking_reference: booking.booking_reference,
                assigned_to: newAssignedTo,
                assigned_by: reassignedById,
                booking_type: bookingType,
                booking_id: bookingId,
                created_at: new Date().toISOString()
            }])

        if (notificationError) {
            console.error('Notification insert error:', notificationError)
        }

        // Send real-time notification
        await pusher.trigger('admin-notifications', 'booking-reassigned', {
            bookingReference: booking.booking_reference,
            bookingType: bookingType,
            bookingId: bookingId,
            assignedTo: newAssignedTo
        })

        res.json({
            success: true,
            message: 'Booking reassigned successfully',
            data: booking
        })
    } catch (error) {
        console.error('Error reassigning booking:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to reassign booking'
        })
    }
}
