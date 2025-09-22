import { query } from '../config/db.js'
import { sendVisaInquiryConfirmationEmail } from '../services/emailService.js'
import { supabase } from '../config/supabaseClient.js'
import Pusher from 'pusher'

const pusher = new Pusher({
    appId: '2048372',
    key: '371c6201af1a663a4f58',
    secret: 'b4a5985ecd6d27690c8b',
    cluster: 'ap1',
    useTLS: true,
})

export const submitVisaInquiry = async (req, res) => {
    try {
        const { visa_type, destination, full_name, mobile_number, email_address, message } = req.body

        // Validate required fields
        if (!visa_type || !destination || !full_name || !mobile_number || !email_address || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email_address)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            })
        }

        // Generate inquiry reference
        const inquiryReference = `TRB-VISA-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

        // Insert inquiry into database
        const insertQuery = `
            INSERT INTO visa_inquiries (
                inquiry_reference,
                visa_type,
                destination,
                full_name,
                mobile_number,
                email_address,
                message,
                status,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW())
        `

        await query(insertQuery, [
            inquiryReference,
            visa_type,
            destination,
            full_name,
            mobile_number,
            email_address,
            message
        ])

        // Send confirmation email to client
        try {
            await sendVisaInquiryConfirmationEmail({
                inquiryReference,
                visa_type,
                destination,
                full_name,
                email_address,
                message
            })
        } catch (emailError) {
            console.error('Error sending confirmation email:', emailError)
            // Don't fail the request if email fails
        }

        res.status(200).json({
            success: true,
            message: 'Visa inquiry submitted successfully',
            inquiryReference
        })

    } catch (error) {
        console.error('Error submitting visa inquiry:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to submit visa inquiry. Please try again.'
        })
    }
}

export const getVisaInquiries = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'ALL', search = '' } = req.query
        const offset = (page - 1) * limit

        let whereClause = ''
        let queryParams = []
        const whereParts = []

        if (status !== 'ALL') {
            whereParts.push('vi.status = ?')
            queryParams.push(status)
        }

        const trimmedSearch = (search || '').toString().trim()
        if (trimmedSearch) {
            const searchPattern = `%${trimmedSearch}%`
            whereParts.push(`(
                vi.inquiry_reference ILIKE ? OR 
                vi.full_name ILIKE ? OR 
                vi.email_address ILIKE ? OR 
                vi.mobile_number ILIKE ? OR 
                vi.visa_type ILIKE ? OR 
                vi.destination ILIKE ?
            )`)
            // Push pattern for each placeholder above
            queryParams.push(
                searchPattern,
                searchPattern,
                searchPattern,
                searchPattern,
                searchPattern,
                searchPattern
            )
        }

        if (whereParts.length > 0) {
            whereClause = `WHERE ${whereParts.join(' AND ')}`
        }

        // Get inquiries with pagination and assignment info
        const inquiriesQuery = `
            SELECT 
                vi.id,
                vi.inquiry_reference,
                vi.visa_type,
                vi.destination,
                vi.full_name,
                vi.mobile_number,
                vi.email_address,
                vi.message,
                vi.status,
                vi.notes,
                vi.assigned_to,
                vi.assigned_by,
                vi.assigned_at,
                vi.assignment_status,
                vi.created_at,
                vi.updated_at,
                COALESCE(assigned_staff.first_name, '') as assigned_staff_first_name,
                COALESCE(assigned_staff.last_name, '') as assigned_staff_last_name,
                COALESCE(assigned_staff.email, '') as assigned_staff_email
            FROM visa_inquiries vi
            LEFT JOIN admins assigned_staff ON vi.assigned_to::text = assigned_staff.id::text
            ${whereClause}
            ORDER BY vi.created_at DESC
            LIMIT ? OFFSET ?
        `

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM visa_inquiries vi
            ${whereClause}
        `

        const [inquiries, countResult] = await Promise.all([
            query(inquiriesQuery, [...queryParams, parseInt(limit), parseInt(offset)]),
            query(countQuery, queryParams)
        ])

        const total = countResult.rows[0].total

        res.status(200).json({
            success: true,
            data: inquiries.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Error fetching visa inquiries:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch visa inquiries'
        })
    }
}

export const updateVisaInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status, notes } = req.body

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            })
        }

        const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            })
        }

        const updateQuery = `
            UPDATE visa_inquiries 
            SET status = ?, notes = ?, updated_at = NOW()
            WHERE id = ?
        `

        const result = await query(updateQuery, [status, notes || null, id])

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Visa inquiry not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Visa inquiry status updated successfully'
        })

    } catch (error) {
        console.error('Error updating visa inquiry status:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to update visa inquiry status'
        })
    }
}

// Assign visa inquiry to staff member
export const assignVisaInquiry = async (req, res) => {
    try {
        const { inquiryId, assignedTo, assignedBy } = req.body

        if (!inquiryId || !assignedTo || !assignedBy) {
            return res.status(400).json({
                success: false,
                message: 'inquiryId, assignedTo, and assignedBy are required'
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

        // Update visa inquiry assignment
        const updateQuery = `
            UPDATE visa_inquiries 
            SET assigned_to = ?, assigned_by = ?, assigned_at = NOW(), assignment_status = 'pending'
            WHERE id = ?
        `

        const result = await query(updateQuery, [assignedTo, assignedById, inquiryId])

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Visa inquiry not found'
            })
        }

        // Get inquiry details for notification
        const inquiryQuery = `
            SELECT inquiry_reference, visa_type, destination, full_name 
            FROM visa_inquiries 
            WHERE id = ?
        `
        const inquiryResult = await query(inquiryQuery, [inquiryId])
        const inquiry = inquiryResult.rows[0]

        // Get assigned staff details
        const { data: staff, error: staffError } = await supabase
            .from('admins')
            .select('email, first_name, last_name')
            .eq('id', assignedTo)
            .single()

        if (staffError) {
            console.error('Staff lookup error:', staffError)
        }

        // Create notification (omit booking_id to avoid UUID mismatch)
        const { error: notificationError } = await supabase
            .from('admin_notifications')
            .insert([{
                type: 'visa_inquiry_assigned',
                message: `Visa inquiry ${inquiry.inquiry_reference} has been assigned to you`,
                booking_reference: inquiry.inquiry_reference,
                assigned_to: assignedTo,
                assigned_by: assignedById,
                booking_type: null,
                booking_id: null,
                created_at: new Date().toISOString()
            }])

        if (notificationError) {
            console.error('Notification insert error:', notificationError)
        }

        // Send real-time notification
        await pusher.trigger('admin-notifications', 'visa-inquiry-assigned', {
            inquiryReference: inquiry.inquiry_reference,
            inquiryType: inquiry.visa_type,
            destination: inquiry.destination,
            clientName: inquiry.full_name,
            inquiryId: inquiryId,
            assignedTo: assignedTo
        })

        // Get updated inquiry data with assignment info
        const updatedInquiryQuery = `
            SELECT 
                id,
                inquiry_reference,
                visa_type,
                destination,
                full_name,
                mobile_number,
                email_address,
                message,
                status,
                notes,
                assigned_to,
                assigned_by,
                assigned_at,
                assignment_status,
                created_at,
                updated_at
            FROM visa_inquiries 
            WHERE id = ?
        `
        const updatedInquiryResult = await query(updatedInquiryQuery, [inquiryId])
        const updatedInquiry = updatedInquiryResult.rows[0]

        res.status(200).json({
            success: true,
            message: 'Visa inquiry assigned successfully',
            data: updatedInquiry
        })

    } catch (error) {
        console.error('Error assigning visa inquiry:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to assign visa inquiry'
        })
    }
}

// Update assignment status
export const updateVisaAssignmentStatus = async (req, res) => {
    try {
        const { inquiryId, status, updatedBy } = req.body

        if (!inquiryId || !status || !updatedBy) {
            return res.status(400).json({
                success: false,
                message: 'inquiryId, status, and updatedBy are required'
            })
        }

        const validStatuses = ['pending', 'in_progress', 'completed']
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: pending, in_progress, completed'
            })
        }

        const updateQuery = `
            UPDATE visa_inquiries 
            SET assignment_status = ?, updated_at = NOW()
            WHERE id = ?
        `

        const result = await query(updateQuery, [status, inquiryId])

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Visa inquiry not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Assignment status updated successfully'
        })

    } catch (error) {
        console.error('Error updating visa assignment status:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to update assignment status'
        })
    }
}

// Get assigned visa inquiries for staff
export const getAssignedVisaInquiries = async (req, res) => {
    try {
        const { userId, status } = req.query
        const page = parseInt(req.query.page) || 0
        const pageSize = parseInt(req.query.pageSize) || 10

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            })
        }

        let whereClause = 'WHERE assigned_to = ?'
        let queryParams = [userId]

        if (status && status !== 'All') {
            whereClause += ' AND assignment_status = ?'
            queryParams.push(status)
        }

        const inquiriesQuery = `
            SELECT 
                id,
                inquiry_reference,
                visa_type,
                destination,
                full_name,
                mobile_number,
                email_address,
                message,
                status,
                notes,
                assigned_to,
                assigned_by,
                assigned_at,
                assignment_status,
                created_at,
                updated_at
            FROM visa_inquiries 
            ${whereClause}
            ORDER BY assigned_at DESC
            LIMIT ? OFFSET ?
        `

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM visa_inquiries 
            ${whereClause}
        `

        const [inquiries, countResult] = await Promise.all([
            query(inquiriesQuery, [...queryParams, pageSize, page * pageSize]),
            query(countQuery, queryParams)
        ])

        const total = countResult.rows[0].total

        res.status(200).json({
            success: true,
            data: inquiries.rows,
            pagination: {
                page,
                pageSize,
                total,
                pages: Math.ceil(total / pageSize)
            }
        })

    } catch (error) {
        console.error('Error fetching assigned visa inquiries:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assigned visa inquiries'
        })
    }
}
