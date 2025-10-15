// assignmentController.js
import { supabase } from '../../config/supabaseClient.js'
import { autoAssignBooking, manualReassignBooking, getAssignmentStats } from '../../services/assignmentService.js'
import Pusher from 'pusher'

const pusher = new Pusher({
    appId: '2048372',
    key: '371c6201af1a663a4f58',
    secret: 'b4a5985ecd6d27690c8b',
    cluster: 'ap1',
    useTLS: true,
})

/**
 * Unified assignment function for all booking types
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const assignBooking = async (req, res) => {
    try {
        const { bookingType, bookingId, assignedTo, assignedBy } = req.body

        // Validate required fields
        if (!bookingType || !bookingId || !assignedTo || !assignedBy) {
            return res.status(400).json({
                success: false,
                message: 'bookingType, bookingId, assignedTo, and assignedBy are required'
            })
        }

        // Validate booking type
        const validTypes = ['tour', 'flight', 'visa-inquiry', 'visa-processing']
        if (!validTypes.includes(bookingType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking type. Must be one of: tour, flight, visa-inquiry, visa-processing'
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

        // Get table name and booking reference based on booking type
        const tableName = getTableName(bookingType)
        const bookingReference = await getBookingReference(bookingType, bookingId)

        if (!bookingReference) {
            return res.status(404).json({
                success: false,
                message: `${bookingType} booking not found`
            })
        }

        // Update booking assignment
        const { data: booking, error: updateError } = await supabase
            .from(tableName)
            .update({
                assigned_to: assignedTo,
                assigned_by: assignedById,
                assigned_at: new Date().toISOString(),
                assignment_status: 'pending'
            })
            .eq('id', bookingId)
            .select(`
                *,
                assigned_staff:assigned_to (
                    id,
                    first_name,
                    last_name,
                    email
                )
            `)
            .single()

        if (updateError) {
            console.error(`Error updating ${bookingType} booking:`, updateError)
            return res.status(500).json({
                success: false,
                message: `Failed to assign ${bookingType} booking`
            })
        }

        // Get assigned staff details
        const { data: staff, error: staffError } = await supabase
            .from('admins')
            .select('email, first_name, last_name')
            .eq('id', assignedTo)
            .single()

        if (staffError) {
            console.error('Staff lookup error:', staffError)
        }


        // Send real-time notification
        const pusherData = getPusherData(bookingType, booking, bookingId, assignedTo)
        await pusher.trigger('admin-notifications', `${bookingType}-assigned`, pusherData)

        res.json({
            success: true,
            message: `${bookingType} booking assigned successfully`,
            data: booking
        })

    } catch (error) {
        console.error('Error assigning booking:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to assign booking'
        })
    }
}

/**
 * Unified assignment status update
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateAssignmentStatus = async (req, res) => {
    try {
        const { bookingType, bookingId, assignmentStatus } = req.body

        // Validate required fields
        if (!bookingType || !bookingId || !assignmentStatus) {
            return res.status(400).json({
                success: false,
                message: 'bookingType, bookingId, and assignmentStatus are required'
            })
        }

        // Validate booking type
        const validTypes = ['tour', 'flight', 'visa-inquiry', 'visa-processing']
        if (!validTypes.includes(bookingType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking type'
            })
        }

        // Validate assignment status
        const validStatuses = ['pending', 'in_progress', 'completed']
        if (!validStatuses.includes(assignmentStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid assignment status. Must be one of: pending, in_progress, completed'
            })
        }

        const tableName = getTableName(bookingType)

        // Update assignment status
        const { data: updated, error: updateError } = await supabase
            .from(tableName)
            .update({ 
                assignment_status: assignmentStatus,
                updated_at: new Date().toISOString() 
            })
            .eq('id', bookingId)
            .select('*')
            .single()

        if (updateError) {
            console.error(`Error updating ${bookingType} assignment status:`, updateError)
            return res.status(500).json({
                success: false,
                message: `Failed to update ${bookingType} assignment status`
            })
        }

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: `${bookingType} booking not found`
            })
        }

        res.json({
            success: true,
            message: 'Assignment status updated successfully',
            data: updated
        })

    } catch (error) {
        console.error('Error updating assignment status:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to update assignment status'
        })
    }
}

/**
 * Get assignments for specific staff member
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getStaffAssignments = async (req, res) => {
    try {
        const { staffId, bookingType } = req.params
        const { page = 1, limit = 10 } = req.query
        const offset = (page - 1) * limit

        if (!staffId) {
            return res.status(400).json({
                success: false,
                message: 'staffId is required'
            })
        }

        let assignments = []

        if (bookingType) {
            // Get assignments for specific booking type
            const tableName = getTableName(bookingType)
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .eq('assigned_to', staffId)
                .order('assigned_at', { ascending: false })
                .range(offset, offset + limit - 1)

            if (error) {
                console.error(`Error fetching ${bookingType} assignments:`, error)
                return res.status(500).json({
                    success: false,
                    message: `Failed to fetch ${bookingType} assignments`
                })
            }

            assignments = data || []
        } else {
            // Get assignments for all booking types
            const promises = ['tour', 'flight', 'visa-inquiry', 'visa-processing'].map(async (type) => {
                const tableName = getTableName(type)
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .eq('assigned_to', staffId)
                    .order('assigned_at', { ascending: false })

                if (error) {
                    console.error(`Error fetching ${type} assignments:`, error)
                    return []
                }

                return (data || []).map(item => ({ ...item, booking_type: type }))
            })

            const results = await Promise.all(promises)
            assignments = results.flat()
        }

        res.json({
            success: true,
            data: assignments
        })

    } catch (error) {
        console.error('Error fetching staff assignments:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch staff assignments'
        })
    }
}

/**
 * Get assignment statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAssignmentStatistics = async (req, res) => {
    try {
        const stats = await getAssignmentStats()
        
        res.json({
            success: true,
            data: stats
        })

    } catch (error) {
        console.error('Error fetching assignment stats:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assignment statistics'
        })
    }
}

/**
 * Reassign booking to different staff member
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const reassignBooking = async (req, res) => {
    try {
        const { bookingType, bookingId, newStaffId, assignedBy } = req.body

        // Validate required fields
        if (!bookingType || !bookingId || !newStaffId || !assignedBy) {
            return res.status(400).json({
                success: false,
                message: 'bookingType, bookingId, newStaffId, and assignedBy are required'
            })
        }

        // Validate booking type
        const validTypes = ['tour', 'flight', 'visa-inquiry', 'visa-processing']
        if (!validTypes.includes(bookingType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking type'
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

        const result = await manualReassignBooking(bookingType, bookingId, newStaffId, assignedById)

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error
            })
        }

        res.json({
            success: true,
            message: `${bookingType} booking reassigned successfully`,
            data: result.assignedStaff
        })

    } catch (error) {
        console.error('Error reassigning booking:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to reassign booking'
        })
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

const getBookingReference = async (bookingType, bookingId) => {
    const tableName = getTableName(bookingType)
    const referenceField = bookingType === 'visa-inquiry' ? 'inquiry_reference' : 'booking_reference'
    
    const { data, error } = await supabase
        .from(tableName)
        .select(referenceField)
        .eq('id', bookingId)
        .single()

    if (error || !data) {
        return null
    }

    return data[referenceField]
}

const getNotificationType = (bookingType) => {
    const typeMap = {
        'tour': 'booking_assigned',
        'flight': 'booking_assigned',
        'visa-inquiry': 'visa_inquiry_assigned',
        'visa-processing': 'visa_processing_assigned'
    }
    return typeMap[bookingType]
}

const getNotificationMessage = (bookingType, bookingReference, booking) => {
    switch (bookingType) {
        case 'tour':
            return `Tour booking ${bookingReference} has been assigned to you`
        case 'flight':
            return `Flight booking ${bookingReference} has been assigned to you`
        case 'visa-inquiry':
            return `Visa inquiry ${bookingReference} has been assigned to you`
        case 'visa-processing':
            return `Visa processing for ${booking.passenger_name} (${booking.country}) has been assigned to you`
        default:
            return `Booking ${bookingReference} has been assigned to you`
    }
}

const getPusherData = (bookingType, booking, bookingId, assignedTo) => {
    switch (bookingType) {
        case 'tour':
            return {
                bookingReference: booking.booking_reference,
                bookingType: 'tour',
                bookingId: bookingId,
                assignedTo: assignedTo,
                packageTitle: booking.package_dates?.tour_packages?.title || 'Unknown Package'
            }
        case 'flight':
            return {
                bookingReference: booking.booking_reference,
                bookingType: 'flight',
                bookingId: bookingId,
                assignedTo: assignedTo,
                destination: booking.search_criteria?.destination || 'Unknown Destination'
            }
        case 'visa-inquiry':
            return {
                inquiryReference: booking.inquiry_reference,
                bookingType: 'visa-inquiry',
                inquiryId: bookingId,
                assignedTo: assignedTo,
                destination: booking.destination,
                visaType: booking.visa_type
            }
        case 'visa-processing':
            return {
                passengerName: booking.passenger_name,
                country: booking.country,
                visaType: booking.visa_type,
                visaProcessingId: bookingId,
                assignedTo: assignedTo
            }
        default:
            return {
                bookingId: bookingId,
                assignedTo: assignedTo
            }
    }
}
