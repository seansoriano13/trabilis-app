import {
  sendVisaInquiryConfirmationEmail,
  sendVisaProcessingStartedEmail,
} from '../services/brevoEmailService.js'
import { supabase, supabaseAdmin } from '../config/supabaseClient.js'
import { autoAssignBooking } from '../services/assignmentService.js'
import { v4 as uuidv4 } from 'uuid'
import Pusher from 'pusher'
import Stripe from 'stripe'
import { insertAdminNotification } from '../database/supabaseService.js'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  useTLS: true,
})

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const submitVisaInquiry = async (req, res) => {
  try {
    const {
      visa_type,
      destination,
      full_name,
      mobile_number,
      email_address,
      message,
    } = req.body

    // Validate required fields
    if (
      !visa_type ||
      !destination ||
      !full_name ||
      !mobile_number ||
      !email_address ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email_address)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      })
    }

    // Handle mobile_number - it can be either a string (legacy) or an object (new format)
    let mobileNumberData
    if (typeof mobile_number === 'string') {
      // Legacy format - assume Philippine number if no country code
      if (mobile_number.startsWith('+')) {
        const countryCode = mobile_number.match(/^\+(\d+)/)?.[1]
        const number = mobile_number.replace(/^\+\d+/, '')
        mobileNumberData = {
          number: number,
          countryCallingCode: `+${countryCode}`,
        }
      } else {
        mobileNumberData = {
          number: mobile_number,
          countryCallingCode: '+63',
        }
      }
    } else if (
      typeof mobile_number === 'object' &&
      mobile_number.number &&
      mobile_number.countryCallingCode
    ) {
      // New format - validate structure
      mobileNumberData = {
        number: mobile_number.number,
        countryCallingCode: mobile_number.countryCallingCode,
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number format',
      })
    }

    // Generate inquiry reference (shorter UUID format like tours)
    const inquiryReference = `TRB-VISA-${uuidv4().slice(0, 8).toUpperCase()}`

    // Insert inquiry into database (Supabase)
    const { data: inquiryData, error: insertError } = await supabaseAdmin
      .from('visa_inquiries')
      .insert([
        {
          inquiry_reference: inquiryReference,
          visa_type,
          destination,
          full_name,
          mobile_number: mobileNumberData,
          email_address,
          message,
          status: 'PENDING',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Auto-assign inquiry to travel consultant staff
    try {
      const assignmentResult = await autoAssignBooking(
        'visa-inquiry',
        inquiryData.id
      )
      if (assignmentResult.success) {
        console.log(
          `Visa inquiry ${inquiryData.id} auto-assigned to ${assignmentResult.assignedStaff.name}`
        )
      } else {
        console.warn(
          `Failed to auto-assign visa inquiry ${inquiryData.id}:`,
          assignmentResult.error
        )
      }
    } catch (assignmentError) {
      console.error('Auto-assignment error:', assignmentError)
      // Don't fail the inquiry creation if auto-assignment fails
    }

    // Send confirmation email to client
    try {
      await sendVisaInquiryConfirmationEmail({
        inquiryReference,
        visa_type,
        destination,
        full_name,
        email_address,
        message,
      })
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Visa inquiry submitted successfully',
      inquiryReference,
    })
  } catch (error) {
    console.error('Error submitting visa inquiry:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit visa inquiry. Please try again.',
    })
  }
}

export const getVisaInquiries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'ALL', search = '' } = req.query
    const offset = (page - 1) * limit

    const trimmedSearch = (search || '').toString().trim()

    let q = supabaseAdmin.from('visa_inquiries').select('*', { count: 'exact' })

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
          `mobile_number->>number.ilike.${s}`,
          `mobile_number->>countryCallingCode.ilike.${s}`,
          `visa_type.ilike.${s}`,
          `destination.ilike.${s}`,
        ].join(',')
      )
    }

    q = q
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    const { data: inquiries, error, count } = await q

    if (error) {
      throw error
    }

    // Enrich with assigned staff info
    let enriched = inquiries
    const assignedIds = Array.from(
      new Set(inquiries.map((i) => i.assigned_to).filter(Boolean))
    )
    if (assignedIds.length > 0) {
      const { data: staffList, error: staffErr } = await supabaseAdmin
        .from('admins')
        .select('id, first_name, last_name, email')
        .in('id', assignedIds)
      if (!staffErr && staffList) {
        const map = new Map(staffList.map((s) => [s.id, s]))
        enriched = inquiries.map((i) => ({
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
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching visa inquiries:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visa inquiries',
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
        message: 'Status is required',
      })
    }

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      })
    }

    const { data: updated, error: updErr } = await supabaseAdmin
      .from('visa_inquiries')
      .update({
        status,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id')

    if (updErr) {
      throw updErr
    }

    if (!updated || updated.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Visa inquiry not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Visa inquiry status updated successfully',
    })
  } catch (error) {
    console.error('Error updating visa inquiry status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update visa inquiry status',
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
        message: 'inquiryReference is required',
      })
    }

    const { data, error } = await supabaseAdmin
      .from('visa_inquiries')
      .select(
        'inquiry_reference, status, full_name, email_address, mobile_number, visa_type, destination, message, created_at, conversion_status, payment_amount, stripe_checkout_id, converted_to_processing_id'
      )
      .eq('inquiry_reference', inquiryReference)
      .single()

    // Convert mobile_number to display format for backward compatibility
    if (data && data.mobile_number) {
      if (
        typeof data.mobile_number === 'object' &&
        data.mobile_number.number &&
        data.mobile_number.countryCallingCode
      ) {
        data.mobile_number_display = `${data.mobile_number.countryCallingCode}${data.mobile_number.number}`
      } else {
        data.mobile_number_display = data.mobile_number
      }
    }

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Visa inquiry not found',
      })
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error('Error tracking visa inquiry:', err)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch visa inquiry',
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
        message: 'inquiryId, assignedTo, and assignedBy are required',
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
          message: 'Admin user not found',
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
        message: 'Visa inquiry not found',
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
    const { error: notificationError } = await insertAdminNotification({
      type: 'visa_inquiry_assigned',
      message: `Visa inquiry ${inquiry.inquiry_reference} has been assigned to you`,
      booking_reference: inquiry.inquiry_reference,
      assigned_to: assignedTo,
      assigned_by: assignedById,
      booking_type: null,
      booking_id: null,
      created_at: new Date().toISOString(),
    })

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
      assignedTo: assignedTo,
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
      data: updatedInquiry,
    })
  } catch (error) {
    console.error('Error assigning visa inquiry:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to assign visa inquiry',
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
        message: 'inquiryId, status, and updatedBy are required',
      })
    }

    const validStatuses = ['pending', 'in_progress', 'completed']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid status. Must be one of: pending, in_progress, completed',
      })
    }

    const { data: updated, error: updErr } = await supabaseAdmin
      .from('visa_inquiries')
      .update({
        assignment_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inquiryId)
      .select('id')

    if (updErr) {
      throw updErr
    }

    if (!updated || updated.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Visa inquiry not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Assignment status updated successfully',
    })
  } catch (error) {
    console.error('Error updating visa assignment status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment status',
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
        message: 'userId is required',
      })
    }

    let q = supabaseAdmin
      .from('visa_inquiries')
      .select('*', { count: 'exact' })
      .eq('assigned_to', userId)

    if (status && status !== 'All') {
      q = q.eq('assignment_status', status)
    }

    q = q
      .order('assigned_at', { ascending: false })
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
        pages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error fetching assigned visa inquiries:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned visa inquiries',
    })
  }
}

// Create Stripe checkout for visa inquiry payment
export const createVisaInquiryCheckout = async (req, res) => {
  try {
    const { inquiry_reference } = req.params
    const { payment_amount } = req.body

    // Validate payment amount
    if (!payment_amount || payment_amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required',
      })
    }

    // Get inquiry details
    const { data: inquiry, error: inquiryError } = await supabaseAdmin
      .from('visa_inquiries')
      .select('*')
      .eq('inquiry_reference', inquiry_reference)
      .single()

    if (inquiryError || !inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Visa inquiry not found',
      })
    }

    // Check if already converted
    if (inquiry.conversion_status === 'CONVERTED') {
      return res.status(400).json({
        success: false,
        message: 'This inquiry has already been converted to processing',
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'php',
            product_data: {
              name: `Visa Processing - ${inquiry.visa_type}`,
              description: `Destination: ${inquiry.destination} | Reference: ${inquiry.inquiry_reference}`,
            },
            unit_amount: Math.round(payment_amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/visa-processing-success?inquiry_reference=${inquiry.inquiry_reference}`,
      cancel_url: `${process.env.FRONTEND_URL}/track-booking?ref=${inquiry.inquiry_reference}`,
      metadata: {
        inquiry_id: inquiry.id,
        inquiry_reference: inquiry.inquiry_reference,
        type: 'visa_inquiry_payment',
      },
    })

    // Update inquiry with checkout session
    await supabaseAdmin
      .from('visa_inquiries')
      .update({
        stripe_checkout_id: session.id,
        payment_amount: payment_amount,
        conversion_status: 'AWAITING_PAYMENT',
        updated_at: new Date().toISOString(),
      })
      .eq('inquiry_reference', inquiry_reference)

    res.status(200).json({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
    })
  } catch (error) {
    console.error('Error creating visa inquiry checkout:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create payment checkout',
    })
  }
}

// Mark inquiry as ready for payment
export const markInquiryReadyForPayment = async (req, res) => {
  try {
    const { id } = req.params
    const { payment_amount } = req.body

    // Validate payment amount
    if (!payment_amount || payment_amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required',
      })
    }

    // Get inquiry details
    const { data: inquiry, error: inquiryError } = await supabaseAdmin
      .from('visa_inquiries')
      .select('*')
      .eq('id', id)
      .single()

    if (inquiryError || !inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Visa inquiry not found',
      })
    }

    // Check if already converted
    if (inquiry.conversion_status === 'CONVERTED') {
      return res.status(400).json({
        success: false,
        message: 'This inquiry has already been converted to processing',
      })
    }

    // Update inquiry status to AWAITING_PAYMENT
    const { error: updateError } = await supabaseAdmin
      .from('visa_inquiries')
      .update({
        conversion_status: 'AWAITING_PAYMENT',
        payment_amount: payment_amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating inquiry:', updateError)
      return res.status(500).json({
        success: false,
        message: 'Failed to update inquiry status',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry marked as ready for payment',
      data: {
        inquiry_id: id,
        conversion_status: 'AWAITING_PAYMENT',
        payment_amount: payment_amount,
      },
    })
  } catch (error) {
    console.error('Error marking inquiry as ready for payment:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to mark inquiry as ready for payment',
    })
  }
}

// Revert inquiry from AWAITING_PAYMENT to NOT_CONVERTED
export const revertInquiryPayment = async (req, res) => {
  try {
    const { id } = req.params

    // Get inquiry details
    const { data: inquiry, error: inquiryError } = await supabaseAdmin
      .from('visa_inquiries')
      .select('*')
      .eq('id', id)
      .single()

    if (inquiryError || !inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Visa inquiry not found',
      })
    }

    // Check if inquiry is in AWAITING_PAYMENT status
    if (inquiry.conversion_status !== 'AWAITING_PAYMENT') {
      return res.status(400).json({
        success: false,
        message: 'Inquiry is not in AWAITING_PAYMENT status',
      })
    }

    // Revert inquiry status to NOT_CONVERTED
    const { error: updateError } = await supabaseAdmin
      .from('visa_inquiries')
      .update({
        conversion_status: 'NOT_CONVERTED',
        payment_amount: null,
        stripe_checkout_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error reverting inquiry:', updateError)
      return res.status(500).json({
        success: false,
        message: 'Failed to revert inquiry status',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry reverted to NOT_CONVERTED status',
      data: {
        inquiry_id: id,
        conversion_status: 'NOT_CONVERTED',
      },
    })
  } catch (error) {
    console.error('Error reverting inquiry payment:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to revert inquiry payment',
    })
  }
}
