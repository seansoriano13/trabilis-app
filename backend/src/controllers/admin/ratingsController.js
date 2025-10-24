import { supabase } from '../../config/supabaseClient.js'

/**
 * Get all ratings with tour and passenger information
 */
export const getRatings = async (req, res) => {
  try {
    const { startDate, endDate, rating, assignedStaff } = req.query

    // Build query
    let query = supabase
      .from('tour_ratings')
      .select(
        `
        *,
        tour_bookings (
          id,
          booking_reference,
          passenger_details,
          assigned_to,
          package_dates (
            start_date,
            end_date,
            tour_packages (
              title
            )
          )
        )
      `
      )
      .order('created_at', { ascending: false })

    // Apply filters
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }
    if (rating) {
      query = query.eq('rating', parseInt(rating))
    }

    const { data: ratings, error } = await query

    if (error) throw error

    // Get staff details for assigned_to IDs first (before filtering by email)
    const staffIds = [
      ...new Set(
        ratings.map((r) => r.tour_bookings?.assigned_to).filter((id) => id)
      ),
    ]

    let staffMap = {}
    if (staffIds.length > 0) {
      const { data: staffData } = await supabase
        .from('admins')
        .select('id, email')
        .in('id', staffIds)

      staffMap = Object.fromEntries(
        (staffData || []).map((s) => [s.id, s.email])
      )
    }

    // Filter by assigned staff email if specified (after we have the staffMap)
    let filteredRatings = ratings
    if (assignedStaff) {
      filteredRatings = ratings.filter((r) => {
        const staffEmail = r.tour_bookings?.assigned_to
          ? staffMap[r.tour_bookings.assigned_to]
          : null
        return (
          staffEmail &&
          staffEmail.toLowerCase().includes(assignedStaff.toLowerCase())
        )
      })
    }

    // Enrich ratings with staff info
    const enrichedRatings = filteredRatings.map((rating) => {
      const passengerDetails = rating.tour_bookings?.passenger_details || []
      const primaryPassenger = passengerDetails[0] || {}

      // Handle passenger name - it can be a string or an object with firstName/lastName
      let passengerName = 'N/A'
      if (typeof primaryPassenger.name === 'string') {
        passengerName = primaryPassenger.name
      } else if (
        primaryPassenger.name?.firstName ||
        primaryPassenger.name?.lastName
      ) {
        const firstName = primaryPassenger.name.firstName || ''
        const lastName = primaryPassenger.name.lastName || ''
        passengerName = `${firstName} ${lastName}`.trim() || 'N/A'
      } else if (primaryPassenger.firstName || primaryPassenger.lastName) {
        const firstName = primaryPassenger.firstName || ''
        const lastName = primaryPassenger.lastName || ''
        passengerName = `${firstName} ${lastName}`.trim() || 'N/A'
      }

      return {
        ...rating,
        passengerName,
        passengerEmail: primaryPassenger.email || 'N/A',
        tourName:
          rating.tour_bookings?.package_dates?.tour_packages?.title || 'N/A',
        bookingReference: rating.tour_bookings?.booking_reference || 'N/A',
        assignedStaffEmail: rating.tour_bookings?.assigned_to
          ? staffMap[rating.tour_bookings.assigned_to] || 'N/A'
          : 'Unassigned',
      }
    })

    res.json({
      success: true,
      ratings: enrichedRatings,
    })
  } catch (error) {
    console.error('Error fetching ratings:', error)
    res.status(500).json({ error: 'Failed to fetch ratings' })
  }
}

/**
 * Update the configurable email delay setting
 */
export const updateRatingEmailDelay = async (req, res) => {
  try {
    const { days } = req.body

    // Validate input
    const daysNum = parseInt(days)
    if (isNaN(daysNum) || daysNum < 0 || daysNum > 365) {
      return res.status(400).json({
        error: 'Invalid days value (must be between 0 and 365)',
      })
    }

    const { error } = await supabase.from('system_settings').upsert({
      key: 'rating_email_delay_days',
      value: daysNum,
    })

    if (error) throw error

    res.json({
      success: true,
      message: 'Email delay updated successfully',
      days: daysNum,
    })
  } catch (error) {
    console.error('Error updating email delay:', error)
    res.status(500).json({ error: 'Failed to update email delay' })
  }
}

/**
 * Get current email delay setting
 */
export const getRatingEmailDelay = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'rating_email_delay_days')
      .single()

    if (error) {
      // Return default if not found
      return res.json({ success: true, days: 1 })
    }

    res.json({
      success: true,
      days: parseInt(data.value),
    })
  } catch (error) {
    console.error('Error fetching email delay:', error)
    res.status(500).json({ error: 'Failed to fetch email delay' })
  }
}
