import { supabase, supabaseAdmin } from '../config/supabaseClient.js'
import { autoAssignBooking } from '../services/assignmentService.js'
import { v4 as uuidv4 } from 'uuid'
import Pusher from 'pusher'
import { insertAdminNotification } from '../database/supabaseService.js'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  useTLS: true,
})

// Core CRUD operations
export const createVisaProcessing = async (req, res) => {
  try {
    const {
      tour_booking_id,
      passenger_index,
      passenger_name,
      passenger_email,
      country,
      visa_type = 'tourist',
      notes,
    } = req.body

    // Validate required fields
    if (!tour_booking_id || !passenger_index || !passenger_name || !country) {
      return res.status(400).json({
        success: false,
        message:
          'tour_booking_id, passenger_index, passenger_name, and country are required',
      })
    }

    // Check if visa processing already exists for this passenger
    const { data: existing } = await supabaseAdmin
      .from('visa_processings')
      .select('id')
      .eq('tour_booking_id', tour_booking_id)
      .eq('passenger_index', passenger_index)
      .single()

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Visa processing already exists for this passenger',
      })
    }

    // Generate processing reference
    const processingReference = `TRB-VISA-${uuidv4().slice(0, 8).toUpperCase()}`

    // Create visa processing
    const { data: visaProcessing, error } = await supabaseAdmin
      .from('visa_processings')
      .insert([
        {
          tour_booking_id,
          passenger_index,
          passenger_name,
          passenger_email,
          country,
          visa_type,
          status: 'PENDING',
          requirements_status: {},
          notes,
          processing_reference: processingReference,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    // Check if tour booking has an assigned staff member
    // If yes, use that assignment; otherwise, auto-assign
    try {
      const { data: tourBooking } = await supabaseAdmin
        .from('tour_bookings')
        .select('assigned_to, assigned_at, assigned_by, assignment_status')
        .eq('id', tour_booking_id)
        .single()

      if (tourBooking && tourBooking.assigned_to) {
        // Inherit assignment from tour booking
        await supabaseAdmin
          .from('visa_processings')
          .update({
            assigned_to: tourBooking.assigned_to,
            assigned_at: tourBooking.assigned_at,
            assigned_by: tourBooking.assigned_by,
            assignment_status: tourBooking.assignment_status || 'pending',
          })
          .eq('id', visaProcessing.id)

        console.log(
          `Visa processing ${visaProcessing.id} inherited assignment from tour booking ${tour_booking_id}`
        )
      } else {
        // No assignment in tour booking, auto-assign to travel consultant
        const assignmentResult = await autoAssignBooking(
          'visa-processing',
          visaProcessing.id
        )
        if (assignmentResult.success) {
          console.log(
            `Visa processing ${visaProcessing.id} auto-assigned to ${assignmentResult.assignedStaff.name}`
          )
        } else {
          console.warn(
            `Failed to auto-assign visa processing ${visaProcessing.id}:`,
            assignmentResult.error
          )
        }
      }
    } catch (assignmentError) {
      console.error('Assignment error:', assignmentError)
      // Don't fail the visa processing creation if assignment fails
    }

    res.status(201).json({
      success: true,
      message: 'Visa processing created successfully',
      data: visaProcessing,
    })
  } catch (error) {
    console.error('Error creating visa processing:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create visa processing',
    })
  }
}

export const getVisaProcessings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'ALL',
      country = '',
      assigned_to = '',
      source_type = 'ALL',
      search = '',
    } = req.query
    const offset = (page - 1) * limit

    let q = supabaseAdmin.from('visa_processings').select(
      `
                *,
                tour_bookings(
                    booking_reference,
                    lead_first_name,
                    lead_last_name,
                    lead_email,
                    package_dates(
                        tour_packages(
                            title,
                            destination_country
                        )
                    )
                )
            `,
      { count: 'exact' }
    )

    // Apply filters
    if (status !== 'ALL') {
      q = q.eq('status', status)
    }

    if (country) {
      q = q.eq('country', country)
    }

    if (assigned_to) {
      q = q.eq('assigned_to', assigned_to)
    }

    if (source_type !== 'ALL') {
      q = q.eq('source_type', source_type)
    }

    if (search) {
      const searchTerm = `%${search}%`
      q = q.or(
        `passenger_name.ilike.${searchTerm},passenger_email.ilike.${searchTerm}`
      )
    }

    q = q
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    const { data: visaProcessings, error, count } = await q

    if (error) {
      throw error
    }

    // Enrich with assigned staff info
    let enriched = visaProcessings
    const assignedIds = Array.from(
      new Set(visaProcessings.map((vp) => vp.assigned_to).filter(Boolean))
    )
    if (assignedIds.length > 0) {
      const { data: staffList, error: staffErr } = await supabaseAdmin
        .from('admins')
        .select('id, first_name, last_name, email')
        .in('id', assignedIds)
      if (!staffErr && staffList) {
        const map = new Map(staffList.map((s) => [s.id, s]))
        enriched = visaProcessings.map((vp) => ({
          ...vp,
          assigned_staff_first_name: map.get(vp.assigned_to)?.first_name || '',
          assigned_staff_last_name: map.get(vp.assigned_to)?.last_name || '',
          assigned_staff_email: map.get(vp.assigned_to)?.email || '',
        }))
      }
    }

    // Enrich with visa inquiry data for standalone processings
    const visaInquiryIds = visaProcessings
      .filter((vp) => vp.source_type === 'VISA_INQUIRY' && vp.source_id)
      .map((vp) => vp.source_id)

    if (visaInquiryIds.length > 0) {
      const { data: inquiryList, error: inquiryErr } = await supabaseAdmin
        .from('visa_inquiries')
        .select(
          'id, inquiry_reference, full_name, email_address, mobile_number'
        )
        .in('id', visaInquiryIds)

      if (!inquiryErr && inquiryList) {
        const inquiryMap = new Map(inquiryList.map((i) => [i.id, i]))
        enriched = enriched.map((vp) => {
          if (vp.source_type === 'VISA_INQUIRY' && vp.source_id) {
            const inquiry = inquiryMap.get(vp.source_id)
            return {
              ...vp,
              visa_inquiries: inquiry || null,
            }
          }
          return vp
        })
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
    console.error('Error fetching visa processings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visa processings',
    })
  }
}

export const updateVisaStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      })
    }

    const validStatuses = [
      'PENDING',
      'IN_PROGRESS',
      'APPROVED',
      'REJECTED',
      'CANCELLED',
    ]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      })
    }

    const { data: updated, error: updErr } = await supabaseAdmin
      .from('visa_processings')
      .update({
        status,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updErr) {
      throw updErr
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Visa processing not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Visa status updated successfully',
      data: updated,
    })
  } catch (error) {
    console.error('Error updating visa status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update visa status',
    })
  }
}

export const updateRequirementsStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { requirements_status } = req.body

    if (!requirements_status || typeof requirements_status !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'requirements_status must be an object',
      })
    }

    const { data: updated, error: updErr } = await supabaseAdmin
      .from('visa_processings')
      .update({
        requirements_status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id')
      .single()

    if (updErr) {
      throw updErr
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Visa processing not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Requirements status updated successfully',
    })
  } catch (error) {
    console.error('Error updating requirements status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update requirements status',
    })
  }
}

// Assignment operations
export const assignVisaProcessing = async (req, res) => {
  try {
    const { id } = req.params
    const { assignedTo, assignedBy } = req.body

    if (!assignedTo || !assignedBy) {
      return res.status(400).json({
        success: false,
        message: 'assignedTo and assignedBy are required',
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

    // Update visa processing assignment
    const { data: updatedAssign, error: assignErr } = await supabaseAdmin
      .from('visa_processings')
      .update({
        assigned_to: assignedTo,
        assigned_by: assignedById,
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id')
      .single()

    if (assignErr) {
      throw assignErr
    }

    if (!updatedAssign) {
      return res.status(404).json({
        success: false,
        message: 'Visa processing not found',
      })
    }

    // Get visa processing details for notification
    const { data: visaProcessing, error: visaErr } = await supabaseAdmin
      .from('visa_processings')
      .select('passenger_name, country, visa_type')
      .eq('id', id)
      .single()

    if (visaErr || !visaProcessing) {
      throw visaErr || new Error('Visa processing not found after update')
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

    // Create notification
    const { error: notificationError } = await insertAdminNotification({
      type: 'visa_processing_assigned',
      event_type: 'visa_processing_assigned', // Required field for database
      message: `Visa processing for ${visaProcessing.passenger_name} (${visaProcessing.country}) has been assigned to you`,
      booking_reference: `VP-${id}`,
      assigned_to: assignedTo,
      assigned_by: assignedById,
      booking_type: 'visa',
      category: 'assignment',
      created_at: new Date().toISOString(),
    })

    if (notificationError) {
      console.error('Notification insert error:', notificationError)
    }

    // Send real-time notification
    await pusher.trigger('admin-notifications', 'visa-processing-assigned', {
      passengerName: visaProcessing.passenger_name,
      country: visaProcessing.country,
      visaType: visaProcessing.visa_type,
      visaProcessingId: id,
      assignedTo: assignedTo,
    })

    // Get updated visa processing data with assignment info
    const { data: updatedVisaProcessing } = await supabaseAdmin
      .from('visa_processings')
      .select('*')
      .eq('id', id)
      .single()

    res.status(200).json({
      success: true,
      message: 'Visa processing assigned successfully',
      data: updatedVisaProcessing,
    })
  } catch (error) {
    console.error('Error assigning visa processing:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to assign visa processing',
    })
  }
}

export const updateVisaAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { assignment_status } = req.body

    if (!assignment_status) {
      return res.status(400).json({
        success: false,
        message: 'assignment_status is required',
      })
    }

    const validStatuses = ['pending', 'in_progress', 'completed']
    if (!validStatuses.includes(assignment_status)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid assignment status. Must be one of: pending, in_progress, completed',
      })
    }

    const { data: updated, error: updErr } = await supabaseAdmin
      .from('visa_processings')
      .update({
        assignment_status: assignment_status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updErr) {
      throw updErr
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Visa processing not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Assignment status updated successfully',
      data: updated,
    })
  } catch (error) {
    console.error('Error updating visa assignment status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment status',
    })
  }
}

export const getAssignedVisaProcessings = async (req, res) => {
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
      .from('visa_processings')
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
    console.error('Error fetching assigned visa processings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned visa processings',
    })
  }
}

// Requirements management
export const getVisaRequirements = async (req, res) => {
  try {
    const { country } = req.query

    let q = supabaseAdmin
      .from('visa_requirements')
      .select('*')
      .order('country', { ascending: true })

    if (country) {
      q = q.eq('country', country)
    }

    const { data: requirements, error } = await q

    if (error) {
      throw error
    }

    res.status(200).json({
      success: true,
      data: requirements,
    })
  } catch (error) {
    console.error('Error fetching visa requirements:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visa requirements',
    })
  }
}

export const getVisaRequirementsByCountry = async (req, res) => {
  try {
    const { country } = req.params

    const { data: requirements, error } = await supabaseAdmin
      .from('visa_requirements')
      .select('*')
      .eq('country', country)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Visa requirements not found for this country',
        })
      }
      throw error
    }

    res.status(200).json({
      success: true,
      data: requirements,
    })
  } catch (error) {
    console.error('Error fetching visa requirements by country:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visa requirements',
    })
  }
}

// Integration with tour bookings
export const createVisaProcessingsForBooking = async (req, res) => {
  try {
    const { bookingId } = req.params
    const { visa_statuses } = req.body

    if (!visa_statuses || !Array.isArray(visa_statuses)) {
      return res.status(400).json({
        success: false,
        message: 'visa_statuses array is required',
      })
    }

    // Get tour booking details to determine country
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('tour_bookings')
      .select(
        `
                id,
                passenger_details,
                package_dates!inner(
                    tour_packages!inner(
                        destination_country,
                        visa_required
                    )
                )
            `
      )
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Tour booking not found',
      })
    }

    const country = booking.package_dates.tour_packages.destination_country
    const visaRequired = booking.package_dates.tour_packages.visa_required

    if (!visaRequired || !country) {
      return res.status(400).json({
        success: false,
        message: 'This tour package does not require visa processing',
      })
    }

    // Get tour booking assignment info to inherit
    const { data: tourBookingAssignment } = await supabaseAdmin
      .from('tour_bookings')
      .select('assigned_to, assigned_at, assigned_by, assignment_status')
      .eq('id', bookingId)
      .single()

    // Create visa processings for passengers who need it
    const visaProcessingsToCreate = visa_statuses
      .filter((vs) => vs.status === 'needs_processing')
      .map((vs) => ({
        tour_booking_id: parseInt(bookingId),
        passenger_index: vs.passenger_index,
        passenger_name: vs.passenger_name,
        passenger_email: vs.passenger_email,
        country: country,
        visa_type: vs.visa_type || 'tourist',
        status: 'PENDING',
        requirements_status: {},
        processing_reference: `TRB-VISA-${uuidv4().slice(0, 8).toUpperCase()}`,
        // Inherit assignment from tour booking if available
        assigned_to: tourBookingAssignment?.assigned_to || null,
        assigned_at: tourBookingAssignment?.assigned_at || null,
        assigned_by: tourBookingAssignment?.assigned_by || null,
        assignment_status:
          tourBookingAssignment?.assignment_status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

    if (visaProcessingsToCreate.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No visa processing needed for this booking',
        data: [],
      })
    }

    const { data: createdProcessings, error: createError } = await supabaseAdmin
      .from('visa_processings')
      .insert(visaProcessingsToCreate)
      .select()

    if (createError) {
      throw createError
    }

    res.status(201).json({
      success: true,
      message: 'Visa processings created successfully',
      data: createdProcessings,
    })
  } catch (error) {
    console.error('Error creating visa processings for booking:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create visa processings for booking',
    })
  }
}

export const getVisaProcessingById = async (req, res) => {
  try {
    const { id } = req.params

    // Get visa processing with joined data
    const { data: visaProcessing, error } = await supabaseAdmin
      .from('visa_processings')
      .select(
        `
                *,
                tour_bookings(
                    booking_reference,
                    lead_first_name,
                    lead_last_name,
                    lead_email,
                    package_dates(
                        tour_packages(
                            title,
                            destination_country
                        )
                    )
                )
            `
      )
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Visa processing not found',
        })
      }
      throw error
    }

    // Enrich with assigned staff info
    let enriched = visaProcessing
    if (visaProcessing.assigned_to) {
      const { data: staff, error: staffErr } = await supabaseAdmin
        .from('admins')
        .select('id, first_name, last_name, email')
        .eq('id', visaProcessing.assigned_to)
        .single()

      if (!staffErr && staff) {
        enriched = {
          ...visaProcessing,
          assigned_staff_first_name: staff.first_name,
          assigned_staff_last_name: staff.last_name,
          assigned_staff_email: staff.email,
        }
      }
    }

    // Enrich with visa inquiry data for standalone processings
    if (
      visaProcessing.source_type === 'VISA_INQUIRY' &&
      visaProcessing.source_id
    ) {
      const { data: inquiry, error: inquiryErr } = await supabaseAdmin
        .from('visa_inquiries')
        .select(
          'id, inquiry_reference, full_name, email_address, mobile_number, visa_type, destination, message'
        )
        .eq('id', visaProcessing.source_id)
        .single()

      if (!inquiryErr && inquiry) {
        enriched = {
          ...enriched,
          visa_inquiries: inquiry,
        }
      }
    }

    res.status(200).json({
      success: true,
      data: enriched,
    })
  } catch (error) {
    console.error('Error fetching visa processing by ID:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visa processing details',
    })
  }
}

export const updateVisaProcessingDetails = async (req, res) => {
  try {
    const { id } = req.params
    const {
      passenger_name,
      passenger_email,
      passport_number,
      country,
      visa_type,
      notes,
      mobile_number,
    } = req.body

    // Validate required fields
    if (!passenger_name || !country || !visa_type) {
      return res.status(400).json({
        success: false,
        message: 'passenger_name, country, and visa_type are required',
      })
    }

    // Build update object
    const updateData = {
      passenger_name,
      passenger_email: passenger_email || null,
      passport_number: passport_number || null,
      country,
      visa_type,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    }

    // Add mobile_number JSON if provided
    if (mobile_number) {
      // mobile_number should be {countryCallingCode: "+63", number: "9123456789"}
      updateData.mobile_number = mobile_number
    }

    const { data: updated, error: updErr } = await supabaseAdmin
      .from('visa_processings')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (updErr) {
      throw updErr
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Visa processing not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Visa processing details updated successfully',
      data: updated,
    })
  } catch (error) {
    console.error('Error updating visa processing details:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update visa processing details',
    })
  }
}

export const getVisaProcessingsByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params

    const { data: visaProcessings, error } = await supabaseAdmin
      .from('visa_processings')
      .select('*')
      .eq('tour_booking_id', bookingId)
      .order('passenger_index', { ascending: true })

    if (error) {
      throw error
    }

    res.status(200).json({
      success: true,
      data: visaProcessings,
    })
  } catch (error) {
    console.error('Error fetching visa processings by booking:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visa processings for booking',
    })
  }
}
