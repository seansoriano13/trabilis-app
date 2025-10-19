import { supabase, supabaseAdmin } from '../../config/supabaseClient.js'

export const getFlightBookings = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const pageSize = 5
  const start = (page - 1) * pageSize
  const end = start + pageSize - 1
  const status = req.query.status
  const destination = req.query.destination

  try {
    let query = supabase
      .from('flight_bookings')
      .select(
        `
                *,
                passenger_details:passenger_details!inner(travelers(name))
            `,
        { count: 'exact' }
      )
      .range(start, end)
      .order('search_criteria->>outboundDeparture', { ascending: true })

    if (status && status !== 'All') {
      query = query.eq('status', status)
    }
    if (destination) {
      query = query.ilike('search_criteria->>destination', `%${destination}%`)
    }

    const { data, error, count } = await query

    if (error) throw error

    res.json({ data, total: count })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flight bookings' })
  }
}

export const getTourBookings = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const pageSize = 5
  const start = (page - 1) * pageSize
  const end = start + pageSize - 1
  const status = req.query.status
  const packageName = req.query.package_name

  try {
    let query = supabase
      .from('tour_bookings')
      .select(
        `
                *,
                package_dates (
                    id,
                    start_date,
                    end_date,
                    total_slots,
                    tour_package_id,
                    tour_packages (title)
                )
            `,
        { count: 'exact' }
      )
      .range(start, end)
      .order('created_at', { ascending: true })

    if (status && status !== 'All') {
      query = query.eq('status', status)
    }
    if (packageName) {
      query = query.ilike(
        'package_dates.tour_packages.title',
        `%${packageName}%`
      )
    }

    const { data, error, count } = await query

    if (error) throw error

    res.json({ data, total: count })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tour bookings' })
  }
}

export const getAdminNotifications = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.limit) || 100
  const start = (page - 1) * pageSize
  const end = start + pageSize - 1

  // New filter parameters
  const category = req.query.category || 'all'
  const unreadOnly = req.query.unread_only === 'true'
  const assignedToMe = req.query.assigned_to_me === 'true'
  const bookingType = req.query.booking_type || 'all'
  const currentUserId = req.user.id

  try {
    let query = supabase
      .from('admin_notifications')
      .select('*', { count: 'exact' })
      .range(start, end)
      .order('created_at', { ascending: false })

    // Apply filters based on user role
    if (req.user.role === 'admin') {
      // Admin sees all notifications
    } else if (req.user.role === 'accounting') {
      // Accounting sees all bookings + assignments to them + status updates for their bookings
      query = query.or(
        `category.eq.booking,category.eq.assignment,category.eq.status,related_user_id.eq.${currentUserId}`
      )
    } else if (req.user.role === 'travel_consultant') {
      // Travel consultant sees tour bookings + assignments to them
      query = query.or(
        `and(booking_type.eq.tour,category.eq.booking),and(category.eq.assignment,related_user_id.eq.${currentUserId}),and(booking_type.eq.tour,category.eq.status,related_user_id.eq.${currentUserId})`
      )
    }

    // Apply category filter
    if (category !== 'all') {
      query = query.eq('category', category)
    }

    // Apply booking type filter
    if (bookingType !== 'all') {
      query = query.eq('booking_type', bookingType)
    }

    // Apply assigned to me filter
    if (assignedToMe) {
      query = query.eq('related_user_id', currentUserId)
    }

    // Apply unread only filter
    if (unreadOnly) {
      query = query.not('read_by', 'cs', `["${currentUserId}"]`)
    }

    // Hide error notifications from non-admins
    if (req.user.role !== 'admin') {
      query = query.neq('category', 'error')
    }

    const { data, error, count } = await query

    if (error) throw error

    // Add computed fields for frontend
    const notificationsWithMeta = data.map((notification) => ({
      ...notification,
      isRead:
        Array.isArray(notification.read_by) &&
        notification.read_by.includes(currentUserId),
      timeAgo: getTimeAgo(notification.created_at),
      priorityColor: getPriorityColor(notification.priority),
    }))

    res.json({
      data: notificationsWithMeta,
      total: count,
      filters: {
        category,
        unreadOnly,
        assignedToMe,
        bookingType,
      },
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
}

// Helper function to calculate time ago
function getTimeAgo(timestamp) {
  const now = new Date()
  const notificationTime = new Date(timestamp)
  const diffInSeconds = Math.floor((now - notificationTime) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return notificationTime.toLocaleDateString()
}

// Helper function to get priority color
function getPriorityColor(priority) {
  const colors = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    critical: 'red',
  }
  return colors[priority] || 'blue'
}

// Backfill assigned_to/assigned_by into admin_notifications for existing rows
export const backfillNotificationAssignees = async (req, res) => {
  try {
    // Flights
    const { data: flightNotifs } = await supabase
      .from('admin_notifications')
      .select('id, booking_reference')
      .is('assigned_to', null)
      .eq('booking_type', 'flight')
      .in('type', ['booking_assigned', 'booking_reassigned'])

    if (flightNotifs && flightNotifs.length) {
      for (const n of flightNotifs) {
        const { data: fb } = await supabase
          .from('flight_bookings')
          .select('assigned_to, assigned_by')
          .eq('booking_reference', n.booking_reference)
          .single()
        if (fb) {
          await supabase
            .from('admin_notifications')
            .update({
              assigned_to: fb.assigned_to || null,
              assigned_by: fb.assigned_by || null,
            })
            .eq('id', n.id)
        }
      }
    }

    // Tours
    const { data: tourNotifs } = await supabase
      .from('admin_notifications')
      .select('id, booking_reference')
      .is('assigned_to', null)
      .eq('booking_type', 'tour')
      .in('type', ['booking_assigned', 'booking_reassigned'])

    if (tourNotifs && tourNotifs.length) {
      for (const n of tourNotifs) {
        const { data: tb } = await supabase
          .from('tour_bookings')
          .select('assigned_to, assigned_by')
          .eq('booking_reference', n.booking_reference)
          .single()
        if (tb) {
          await supabase
            .from('admin_notifications')
            .update({
              assigned_to: tb.assigned_to || null,
              assigned_by: tb.assigned_by || null,
            })
            .eq('id', n.id)
        }
      }
    }

    return res.json({ success: true })
  } catch (error) {
    console.error('Backfill failed:', error)
    return res.status(500).json({ success: false, error: 'Backfill failed' })
  }
}

export const getRevenue = async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_monthly_revenue', {
      start_date: '2025-01-01',
      end_date: '2025-06-30',
    })

    if (error) throw error

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch revenue' })
  }
}

export const getFlightStats = async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_flight_stats')

    if (error) throw error

    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flight stats' })
  }
}

export const getTourStats = async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_tour_stats')

    if (error) throw error

    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tour stats' })
  }
}

export const getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const pageSize = 5
  const start = (page - 1) * pageSize
  const end = start + pageSize - 1
  const role = req.query.role

  // Ensure only admin can access
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admins only' })
  }

  try {
    let query = supabase
      .from('admins')
      .select('*', { count: 'exact' })
      .range(start, end)
      .order('email', { ascending: true })

    if (role && role !== 'All') {
      query = query.eq('role', role)
    }

    const { data, error, count } = await query

    if (error) throw error

    res.json({ data, total: count })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
}

export const createUser = async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body

  // Ensure only admin can create users
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admins only' })
  }

  try {
    // Create user in auth.users
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Send confirmation email
      })

    if (authError) throw authError

    // Insert into admins table
    const { error: insertError } = await supabase.from('admins').insert({
      id: authData.user.id,
      email,
      role: role || 'admin',
      first_name,
      last_name,
    })

    if (insertError) {
      // Rollback: Delete user from auth.users if admins insert fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError)
      }
      throw insertError
    }

    res.json({ message: 'User created successfully' })
  } catch (error) {
    res.status(500).json({
      error: `Failed to create user: ${error.message}`,
    })
  }
}

export const updateUser = async (req, res) => {
  const { id } = req.params
  const { role } = req.body

  // Ensure only admin can update users
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admins only' })
  }

  try {
    const { error } = await supabase
      .from('admins')
      .update({ role })
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'User updated successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' })
  }
}

export const deleteUser = async (req, res) => {
  const { id } = req.params

  // Ensure only admin can delete users
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admins only' })
  }

  try {
    // Delete from auth.users first (must use service role client)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)

    // If user not found in auth, continue to clean up admins table
    if (authError && authError.status !== 404) {
      throw authError
    }

    // Nullify foreign key references before deleting admin to satisfy FKs
    const { error: tourAssignedToNullErr } = await supabase
      .from('tour_bookings')
      .update({ assigned_to: null })
      .eq('assigned_to', id)

    if (tourAssignedToNullErr) throw tourAssignedToNullErr

    const { error: tourAssignedByNullErr } = await supabase
      .from('tour_bookings')
      .update({ assigned_by: null })
      .eq('assigned_by', id)

    if (tourAssignedByNullErr) throw tourAssignedByNullErr

    const { error: flightAssignedToNullErr } = await supabase
      .from('flight_bookings')
      .update({ assigned_to: null })
      .eq('assigned_to', id)

    if (flightAssignedToNullErr) throw flightAssignedToNullErr

    const { error: flightAssignedByNullErr } = await supabase
      .from('flight_bookings')
      .update({ assigned_by: null })
      .eq('assigned_by', id)

    if (flightAssignedByNullErr) throw flightAssignedByNullErr

    const { error: notifAssignedToNullErr } = await supabase
      .from('admin_notifications')
      .update({ assigned_to: null })
      .eq('assigned_to', id)

    if (notifAssignedToNullErr) throw notifAssignedToNullErr

    const { error: notifAssignedByNullErr } = await supabase
      .from('admin_notifications')
      .update({ assigned_by: null })
      .eq('assigned_by', id)

    if (notifAssignedByNullErr) throw notifAssignedByNullErr

    // Delete from admins table regardless
    const { error: adminError } = await supabase
      .from('admins')
      .delete()
      .eq('id', id)

    if (adminError) throw adminError

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user failed:', error)
    res.status(500).json({
      error: `Failed to delete user: ${error.message || 'Unknown error'}`,
    })
  }
}

export const getUserStats = async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_user_stats')

    if (error) throw error

    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user stats' })
  }
}

// Mark single or multiple notifications as read
export const markNotificationsAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body
    const currentUserId = req.user.id

    if (
      !notificationIds ||
      !Array.isArray(notificationIds) ||
      notificationIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: 'notificationIds array is required',
      })
    }

    // Update each notification to add current user to read_by array
    const updates = notificationIds.map(async (notificationId) => {
      // First get the current read_by array
      const { data: notification, error: fetchError } = await supabase
        .from('admin_notifications')
        .select('read_by')
        .eq('id', notificationId)
        .single()

      if (fetchError) {
        console.error(
          `Error fetching notification ${notificationId}:`,
          fetchError
        )
        return { id: notificationId, success: false, error: fetchError.message }
      }

      const currentReadBy = notification.read_by || []

      // Add current user if not already in the array
      if (!currentReadBy.includes(currentUserId)) {
        const updatedReadBy = [...currentReadBy, currentUserId]

        const { error: updateError } = await supabase
          .from('admin_notifications')
          .update({ read_by: updatedReadBy })
          .eq('id', notificationId)

        if (updateError) {
          console.error(
            `Error updating notification ${notificationId}:`,
            updateError
          )
          return {
            id: notificationId,
            success: false,
            error: updateError.message,
          }
        }
      }

      return { id: notificationId, success: true }
    })

    const results = await Promise.all(updates)
    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    res.json({
      success: true,
      message: `Marked ${successCount} notifications as read`,
      results,
      summary: {
        total: notificationIds.length,
        successful: successCount,
        failed: failureCount,
      },
    })
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to mark notifications as read',
    })
  }
}

// Mark all notifications as read for current user
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const currentUserId = req.user.id

    // Get all unread notifications for current user
    const { data: unreadNotifications, error: fetchError } = await supabase
      .from('admin_notifications')
      .select('id, read_by')
      .not('read_by', 'cs', `["${currentUserId}"]`)

    if (fetchError) {
      console.error('Error fetching unread notifications:', fetchError)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch unread notifications',
      })
    }

    if (!unreadNotifications || unreadNotifications.length === 0) {
      return res.json({
        success: true,
        message: 'No unread notifications found',
        count: 0,
      })
    }

    // Update each notification to add current user to read_by array
    const updates = unreadNotifications.map(async (notification) => {
      const currentReadBy = notification.read_by || []
      const updatedReadBy = [...currentReadBy, currentUserId]

      const { error: updateError } = await supabase
        .from('admin_notifications')
        .update({ read_by: updatedReadBy })
        .eq('id', notification.id)

      if (updateError) {
        console.error(
          `Error updating notification ${notification.id}:`,
          updateError
        )
        return {
          id: notification.id,
          success: false,
          error: updateError.message,
        }
      }

      return { id: notification.id, success: true }
    })

    const results = await Promise.all(updates)
    const successCount = results.filter((r) => r.success).length

    res.json({
      success: true,
      message: `Marked ${successCount} notifications as read`,
      count: successCount,
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
    })
  }
}

// Get unread notification count for current user
export const getUnreadNotificationCount = async (req, res) => {
  try {
    const currentUserId = req.user.id
    const category = req.query.category || 'all'

    let query = supabase
      .from('admin_notifications')
      .select('id, category', { count: 'exact' })
      .not('read_by', 'cs', `["${currentUserId}"]`)

    // Apply role-based filtering
    if (req.user.role === 'admin') {
      // Admin sees all notifications
    } else if (req.user.role === 'accounting') {
      query = query.or(
        `category.eq.booking,category.eq.assignment,category.eq.status,related_user_id.eq.${currentUserId}`
      )
    } else if (req.user.role === 'travel_consultant') {
      query = query.or(
        `and(booking_type.eq.tour,category.eq.booking),and(category.eq.assignment,related_user_id.eq.${currentUserId}),and(booking_type.eq.tour,category.eq.status,related_user_id.eq.${currentUserId})`
      )
    }

    // Apply category filter
    if (category !== 'all') {
      query = query.eq('category', category)
    }

    // Hide error notifications from non-admins
    if (req.user.role !== 'admin') {
      query = query.neq('category', 'error')
    }

    const { count, error } = await query

    if (error) {
      console.error('Error fetching unread count:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch unread count',
      })
    }

    res.json({
      success: true,
      count: count || 0,
      category,
    })
  } catch (error) {
    console.error('Error getting unread notification count:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get unread notification count',
    })
  }
}

// Resolve a booking reference to type and numeric id
export const resolveBookingByReference = async (req, res) => {
  try {
    const ref = (req.query.ref || '').toString().trim()
    if (!ref)
      return res.status(400).json({ success: false, error: 'ref is required' })

    // Try flight first
    const { data: flight } = await supabase
      .from('flight_bookings')
      .select('id')
      .eq('booking_reference', ref)
      .single()
    if (flight)
      return res.json({ success: true, type: 'flight', id: flight.id })

    // Then tour
    const { data: tour } = await supabase
      .from('tour_bookings')
      .select('id')
      .eq('booking_reference', ref)
      .single()
    if (tour) return res.json({ success: true, type: 'tour', id: tour.id })

    // Then visa inquiries
    const { data: visa } = await supabase
      .from('visa_inquiries')
      .select('id')
      .eq('inquiry_reference', ref)
      .single()
    if (visa) return res.json({ success: true, type: 'visa', id: visa.id })

    // Then visa processings
    const { data: visaProcessing } = await supabase
      .from('visa_processings')
      .select('id')
      .eq('processing_reference', ref)
      .single()
    if (visaProcessing)
      return res.json({
        success: true,
        type: 'visa_processing',
        id: visaProcessing.id,
      })

    return res
      .status(404)
      .json({ success: false, error: 'Reference not found' })
  } catch (error) {
    console.error('Resolve booking error:', error)
    return res
      .status(500)
      .json({ success: false, error: 'Failed to resolve reference' })
  }
}
