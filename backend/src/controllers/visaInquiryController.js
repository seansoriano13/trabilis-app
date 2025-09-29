import { sendVisaInquiryConfirmationEmail } from '../services/brevoEmailService.js'
import { supabase, supabaseAdmin } from '../config/supabaseClient.js'
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

        // Insert inquiry into database (Supabase)
        const { error: insertError } = await supabaseAdmin
            .from('visa_inquiries')
            .insert([{
                inquiry_reference: inquiryReference,
                visa_type,
                destination,
                full_name,
                mobile_number,
                email_address,
                message,
                status: 'PENDING',
                created_at: new Date().toISOString(),
            }])

        if (insertError) {
            throw insertError
        }

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

        const trimmedSearch = (search || '').toString().trim()

        let q = supabaseAdmin
            .from('visa_inquiries')
            .select('*', { count: 'exact' })

        if (status !== 'ALL') {
            q = q.eq('status', status)
        }

        if (trimmedSearch) {
            const s = `%${trimmedSearch}%`
            q = q.or(
                [
                    `inquiry_reference.ilike.${s}`,
                    `full_name.ilike.${s}`,
                    `email_address.ilike.${s}`,
                    `mobile_number.ilike.${s}`,
                    `visa_type.ilike.${s}`,
                    `destination.ilike.${s}`,
                ].join(',')
            )
        }

        q = q.order('created_at', { ascending: false })
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

        const { data: inquiries, error, count } = await q

        if (error) {
            throw error
        }

        // Enrich with assigned staff info
        let enriched = inquiries
        const assignedIds = Array.from(new Set(inquiries.map(i => i.assigned_to).filter(Boolean)))
        if (assignedIds.length > 0) {
            const { data: staffList, error: staffErr } = await supabaseAdmin
                .from('admins')
                .select('id, first_name, last_name, email')
                .in('id', assignedIds)
            if (!staffErr && staffList) {
                const map = new Map(staffList.map(s => [s.id, s]))
                enriched = inquiries.map(i => ({
                    ...i,
                    assigned_staff_first_name: map.get(i.assigned_to)?.first_name || '',
                    assigned_staff_last_name: map.get(i.assigned_to)?.last_name || '',
                    assigned_staff_email: map.get(i.assigned_to)?.email || '',
                }))
            }
        }

        const total = count || 0

        res.status(200).json({
            success: true,
            data: enriched,
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

        const { data: updated, error: updErr } = await supabaseAdmin
            .from('visa_inquiries')
            .update({ status, notes: notes || null, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('id')

        if (updErr) {
            throw updErr
        }

        if (!updated || updated.length === 0) {
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

// Public: Track a visa inquiry by reference
export const trackVisaInquiry = async (req, res) => {
    try {
        const { inquiryReference } = req.query
        if (!inquiryReference) {
            return res.status(400).json({
                success: false,
                message: 'inquiryReference is required'
            })
        }

        const { data, error } = await supabaseAdmin
            .from('visa_inquiries')
            .select(
                'inquiry_reference, status, full_name, email_address, mobile_number, visa_type, destination, message, created_at'
            )
            .eq('inquiry_reference', inquiryReference)
            .single()

        if (error || !data) {
            return res.status(404).json({
                success: false,
                message: 'Visa inquiry not found'
            })
        }

        return res.status(200).json(data)
    } catch (err) {
        console.error('Error tracking visa inquiry:', err)
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch visa inquiry'
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

        // Update visa inquiry assignment (Supabase)
        const { data: updatedAssign, error: assignErr } = await supabaseAdmin
            .from('visa_inquiries')
            .update({
                assigned_to: assignedTo,
                assigned_by: assignedById,
                assigned_at: new Date().toISOString(),
                assignment_status: 'pending',
                updated_at: new Date().toISOString(),
            })
            .eq('id', inquiryId)
            .select('id')

        if (assignErr) {
            throw assignErr
        }

        if (!updatedAssign || updatedAssign.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Visa inquiry not found'
            })
        }

        // Get inquiry details for notification
        const { data: inquiryList, error: inquiryErr } = await supabaseAdmin
            .from('visa_inquiries')
            .select('inquiry_reference, visa_type, destination, full_name')
            .eq('id', inquiryId)
            .limit(1)
        if (inquiryErr || !inquiryList || inquiryList.length === 0) {
            throw inquiryErr || new Error('Inquiry not found after update')
        }
        const inquiry = inquiryList[0]

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
        const { data: updatedInquiryList } = await supabaseAdmin
            .from('visa_inquiries')
            .select('*')
            .eq('id', inquiryId)
            .limit(1)
        const updatedInquiry = updatedInquiryList ? updatedInquiryList[0] : null

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

        const { data: updated, error: updErr } = await supabaseAdmin
            .from('visa_inquiries')
            .update({ assignment_status: status, updated_at: new Date().toISOString() })
            .eq('id', inquiryId)
            .select('id')

        if (updErr) {
            throw updErr
        }

        if (!updated || updated.length === 0) {
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

        let q = supabaseAdmin
            .from('visa_inquiries')
            .select('*', { count: 'exact' })
            .eq('assigned_to', userId)

        if (status && status !== 'All') {
            q = q.eq('assignment_status', status)
        }

        q = q.order('assigned_at', { ascending: false })
            .range(page * pageSize, page * pageSize + pageSize - 1)

        const { data, error, count } = await q
        if (error) {
            throw error
        }

        const total = count || 0

        res.status(200).json({
            success: true,
            data,
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
