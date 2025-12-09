import { supabase } from '../../config/supabaseClient.js'
import ExcelJS from 'exceljs'

const FLIGHT_CONFIRMED_STATUSES = ['BOOKED', 'TICKETED']
const FLIGHT_PENDING_STATUSES = ['PENDING_PAYMENT', 'PAID_PENDING_BOOKING']
const FLIGHT_CANCELLED_STATUSES = ['CANCELLED']
const TOUR_CONFIRMED_STATUSES = ['CONFIRMED']
const TOUR_PENDING_STATUSES = ['PENDING_PAYMENT']
const TOUR_CANCELLED_STATUSES = ['CANCELLED']

/**
 * Get sales report with analytics
 * Query params: startDate, endDate, flightClass, dataType (Flights | Tours | Both)
 */
export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, flightClass, dataType = 'Flights' } = req.query
    const includeFlights = dataType === 'Flights' || dataType === 'Both'
    const includeTours = dataType === 'Tours' || dataType === 'Both'

    let flights = []
    if (includeFlights) {
      // Build query for flight bookings
      let flightQuery = supabase
        .from('flight_bookings')
        .select('*')
        .in('status', ['BOOKED', 'TICKETED'])

      // Apply date filters
      if (startDate) {
        flightQuery = flightQuery.gte('created_at', startDate)
      }
      if (endDate) {
        flightQuery = flightQuery.lte('created_at', endDate)
      }

      const { data: flightData, error: flightError } = await flightQuery
      if (flightError) throw flightError
      flights = flightData || []
    }

    let tours = []
    if (includeTours) {
      // Build query for tour bookings
      let tourQuery = supabase
        .from('tour_bookings')
        .select('*')
        .eq('status', 'CONFIRMED')

      if (startDate) {
        tourQuery = tourQuery.gte('created_at', startDate)
      }
      if (endDate) {
        tourQuery = tourQuery.lte('created_at', endDate)
      }

      const { data: tourData, error: tourError } = await tourQuery
      if (tourError) throw tourError
      tours = tourData || []
    }

    // Combine datasets according to filter
    const bookings = [...flights, ...tours]

    // Track excluded bookings for error reporting
    let excludedBookings = []

    // Filter by flight class if specified
    let filteredBookings = bookings
    if (flightClass && flightClass !== 'All') {
      // Normalize flight class to match Amadeus cabin codes
      const normalizedClass = flightClass.toUpperCase().replace(/_/g, '_')

      filteredBookings = bookings.filter((booking) => {
        // Only flights have cabin classes; include tours unchanged
        if (booking.amadeus_flight_offer === null || booking.amadeus_flight_offer === undefined) {
          return includeTours && !includeFlights // when filtering by class, exclude tours if only flights are desired
        }
        try {
          // Handle both JSON string and already-parsed object
          const offer = typeof booking.amadeus_flight_offer === 'string'
            ? JSON.parse(booking.amadeus_flight_offer)
            : (booking.amadeus_flight_offer || {})
          
          const travelerPricings = offer.travelerPricings || []
          return travelerPricings.some((tp) =>
            tp.fareDetailsBySegment?.some((fd) => fd.cabin === normalizedClass)
          )
        } catch (parseError) {
          console.error(
            `Error parsing flight offer for booking ${booking.booking_reference}:`,
            parseError
          )
          excludedBookings.push({
            booking_reference: booking.booking_reference,
            error: parseError.message,
            total_amount: booking.total_amount,
          })
          return false // Exclude malformed bookings from filtered results
        }
      })
    }

  // Calculate summary statistics
  const totalRevenue = filteredBookings.reduce(
    (sum, b) => sum + parseFloat(b.total_amount || 0),
    0
  )
  const bookingCount = filteredBookings.length
  const averageBookingValue =
    bookingCount > 0 ? totalRevenue / bookingCount : 0

    // Calculate revenue trends (grouped by date)
    const trendMap = new Map()
    filteredBookings.forEach((booking) => {
      // Use created_at, fallback to updated_at if created_at is null
      const bookingDate = booking.created_at || booking.updated_at

      // Validate date before parsing
      if (!bookingDate) {
        console.warn(
          `Booking ${booking.booking_reference} has no created_at or updated_at date - skipping`
        )
        return
      }

      const dateObj = new Date(bookingDate)
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn(
          `Booking ${booking.booking_reference} has invalid date: ${bookingDate}`
        )
        return
      }

      const date = dateObj.toISOString().split('T')[0]
      const current = trendMap.get(date) || { date, revenue: 0, count: 0 }
      current.revenue += parseFloat(booking.total_amount || 0)
      current.count += 1
      trendMap.set(date, current)
    })

  const revenueTrends = Array.from(trendMap.values()).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )

  // Sales today (literal sales amount today)
  const todayISO = new Date().toISOString().split('T')[0]
  const salesTodayAmount = filteredBookings.reduce((sum, b) => {
    const dateStr = (b.created_at || b.updated_at || '').toString().split('T')[0]
    if (dateStr === todayISO) {
      return sum + parseFloat(b.total_amount || 0)
    }
    return sum
  }, 0)

    console.log(
      `Sales Report: Found ${bookingCount} bookings, ${revenueTrends.length} date points`
    )
    console.log(
      'Sample booking dates:',
      filteredBookings.slice(0, 3).map((b) => ({
        ref: b.booking_reference,
        created_at: b.created_at,
        amount: b.total_amount,
      }))
    )

    // Calculate excluded revenue
    const excludedRevenue = excludedBookings.reduce(
      (sum, b) => sum + parseFloat(b.total_amount || 0),
      0
    )

    res.json({
      summary: {
        totalRevenue,
        bookingCount,
        averageBookingValue,
        salesTodayAmount,
        excludedBookingCount: excludedBookings.length,
        excludedRevenue,
      },
      revenueTrends,
      excludedBookings:
        excludedBookings.length > 0 ? excludedBookings : undefined,
    })
  } catch (error) {
    console.error('Error fetching sales report:', error)
    res.status(500).json({ error: 'Failed to fetch sales report' })
  }
}

/**
 * Get top 10 travelers per class
 */
export const getTopTravelers = async (req, res) => {
  try {
    const { flightClass } = req.query

    // Get all booked flight bookings
    const { data: bookings, error } = await supabase
      .from('flight_bookings')
      .select('*')
      .in('status', ['BOOKED', 'TICKETED'])

    if (error) throw error

    // Track excluded bookings for error reporting
    let excludedBookingsCount = 0

    // Filter by flight class if specified
    let filteredBookings = bookings
    if (flightClass && flightClass !== 'All') {
      // Normalize flight class to match Amadeus cabin codes
      const normalizedClass = flightClass.toUpperCase().replace(/_/g, '_')

      filteredBookings = bookings.filter((booking) => {
        try {
          // Handle both JSON string and already-parsed object
          const offer = typeof booking.amadeus_flight_offer === 'string'
            ? JSON.parse(booking.amadeus_flight_offer)
            : (booking.amadeus_flight_offer || {})
          
          const travelerPricings = offer.travelerPricings || []
          return travelerPricings.some((tp) =>
            tp.fareDetailsBySegment?.some((fd) => fd.cabin === normalizedClass)
          )
        } catch (parseError) {
          console.error(
            `Error parsing flight offer for booking ${booking.booking_reference}:`,
            parseError
          )
          excludedBookingsCount++
          return false // Exclude malformed bookings from filtered results
        }
      })
    }

    // Extract passenger data and aggregate
    const travelerMap = new Map()

    filteredBookings.forEach((booking) => {
      const passengerDetails = booking.passenger_details || {}
      const passengers = passengerDetails.travelers || []

      // Log first few bookings for debugging
      if (travelerMap.size < 3) {
        console.log(`Sample booking ${booking.booking_reference}:`, {
          hasPassengerDetails: !!booking.passenger_details,
          travelerCount: passengers.length,
          samplePassenger: passengers[0]
            ? {
                hasEmail:
                  !!passengers[0].contact?.emailAddress ||
                  !!passengers[0].email,
                hasName: !!passengers[0].name,
              }
            : null,
        })
      }

      passengers.forEach((passenger) => {
        const email = passenger.contact?.emailAddress || passenger.email
        const name =
          `${passenger.name?.firstName || ''} ${
            passenger.name?.lastName || ''
          }`.trim() || passenger.name
        const key = email || name
        if (!key) return

        const existing = travelerMap.get(key) || {
          name: name,
          email: email,
          bookingCount: 0,
          totalRevenue: 0,
          bookingReferences: [],
        }

        existing.bookingCount += 1
        existing.totalRevenue +=
          parseFloat(booking.total_amount || 0) / passengers.length
        existing.bookingReferences.push(booking.booking_reference)

        travelerMap.set(key, existing)
      })
    })

    console.log(
      `Top Travelers: Aggregated ${travelerMap.size} unique travelers from ${filteredBookings.length} bookings`
    )

    // Convert to array and sort by total revenue
    const topTravelers = Array.from(travelerMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)
      .map((traveler, index) => ({
        rank: index + 1,
        ...traveler,
      }))

    res.json({
      topTravelers,
      excludedBookingsCount:
        excludedBookingsCount > 0 ? excludedBookingsCount : undefined,
    })
  } catch (error) {
    console.error('Error fetching top travelers:', error)
    res.status(500).json({ error: 'Failed to fetch top travelers' })
  }
}

/**
 * Get top 10 tour packages
 */
export const getTopTours = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    let query = supabase
      .from('tour_bookings')
      .select(
        `*,
         package_dates (
           id,
           tour_package_id,
           tour_packages (title)
         )
        `
      )
      .eq('status', 'CONFIRMED')

    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate)

    const { data: bookings, error } = await query
    if (error) throw error

    const packageMap = new Map()
    bookings.forEach((b) => {
      const title =
        b.package_dates?.tour_packages?.title || 'Untitled Package'
      const current = packageMap.get(title) || {
        title,
        bookingCount: 0,
        totalRevenue: 0,
      }
      current.bookingCount += 1
      current.totalRevenue += parseFloat(b.total_amount || 0)
      packageMap.set(title, current)
    })

    const topTours = Array.from(packageMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)
      .map((t, idx) => ({ rank: idx + 1, ...t }))

    res.json({ topTours })
  } catch (error) {
    console.error('Error fetching top tours:', error)
    res.status(500).json({ error: 'Failed to fetch top tours' })
  }
}

/**
 * Get sales grouped by agent with status counters for flights and tours
 * Query params: startDate, endDate, flightClass, dataType (Flights | Tours | Both)
 */
export const getAgentSalesStats = async (req, res) => {
  try {
    const { startDate, endDate, flightClass, dataType = 'Both' } = req.query
    const includeFlights = dataType === 'Flights' || dataType === 'Both'
    const includeTours = dataType === 'Tours' || dataType === 'Both'

    const statusCounts = {
      cancelled: 0,
      pendingPayment: 0,
      confirmed: 0,
    }

    // Preload admin names for display
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, email, first_name, last_name')
    if (adminError) throw adminError

    const adminMap = new Map(
      (adminData || []).map((a) => [
        a.id,
        a.first_name || a.last_name
          ? `${a.first_name || ''} ${a.last_name || ''}`.trim()
          : a.email,
      ])
    )

    const agentFlightMap = new Map()
    const agentTourMap = new Map()

    const normalizeAgent = (agentId) => ({
      id: agentId || 'unassigned',
      name: adminMap.get(agentId) || 'Unassigned',
    })

    // Flights
    if (includeFlights) {
      let flightQuery = supabase
        .from('flight_bookings')
        .select('*')
        .in('status', [
          ...FLIGHT_CONFIRMED_STATUSES,
          ...FLIGHT_PENDING_STATUSES,
          ...FLIGHT_CANCELLED_STATUSES,
        ])

      if (startDate) flightQuery = flightQuery.gte('created_at', startDate)
      if (endDate) flightQuery = flightQuery.lte('created_at', endDate)

      const { data: flightData, error: flightError } = await flightQuery
      if (flightError) throw flightError

      let filteredFlights = flightData || []
      if (flightClass && flightClass !== 'All') {
        const normalizedClass = flightClass.toUpperCase().replace(/_/g, '_')
        filteredFlights = filteredFlights.filter((booking) => {
          try {
            const offer =
              typeof booking.amadeus_flight_offer === 'string'
                ? JSON.parse(booking.amadeus_flight_offer)
                : booking.amadeus_flight_offer || {}
            const travelerPricings = offer.travelerPricings || []
            return travelerPricings.some((tp) =>
              tp.fareDetailsBySegment?.some(
                (fd) => fd.cabin === normalizedClass
              )
            )
          } catch (err) {
            console.warn(
              `Skipping flight booking ${booking.booking_reference} due to parse error`,
              err.message
            )
            return false
          }
        })
      }

      filteredFlights.forEach((booking) => {
        const amount = parseFloat(booking.total_amount || 0)
        const agent = normalizeAgent(booking.assigned_to)

        // Status counters
        if (FLIGHT_CANCELLED_STATUSES.includes(booking.status)) {
          statusCounts.cancelled += 1
        } else if (FLIGHT_PENDING_STATUSES.includes(booking.status)) {
          statusCounts.pendingPayment += 1
        } else if (FLIGHT_CONFIRMED_STATUSES.includes(booking.status)) {
          statusCounts.confirmed += 1
        }

        let offer = booking.amadeus_flight_offer || {}
        try {
          offer =
            typeof booking.amadeus_flight_offer === 'string'
              ? JSON.parse(booking.amadeus_flight_offer)
              : booking.amadeus_flight_offer || {}
        } catch (parseError) {
          console.warn(
            `Failed to parse amadeus_flight_offer for ${booking.booking_reference}: ${parseError.message}`
          )
          offer = {}
        }
        const itineraries = offer?.itineraries || []
        const firstItinerary = itineraries[0]
        const lastSegment =
          firstItinerary?.segments?.[firstItinerary.segments.length - 1]
        const destinationCountry =
          booking.search_criteria?.destination ||
          lastSegment?.arrival?.iataCode ||
          'N/A'
        const tripType =
          booking.search_criteria?.tripType ||
          (itineraries.length > 1 ? 'ROUND_TRIP' : 'ONE_WAY')

        const existing = agentFlightMap.get(agent.id) || {
          agentId: agent.id,
          agentName: agent.name,
          bookingCount: 0,
          totalRevenue: 0,
          bookings: [],
        }

        existing.bookingCount += 1
        existing.totalRevenue += amount
        existing.bookings.push({
          bookingReference: booking.booking_reference,
          destinationCountry,
          tripType,
          amount,
          status: booking.status,
          created_at: booking.created_at,
        })

        agentFlightMap.set(agent.id, existing)
      })
    }

    // Tours
    if (includeTours) {
      let tourQuery = supabase
        .from('tour_bookings')
        .select(
          `*,
           package_dates (
             id,
             tour_packages (title, destination_country)
           )
          `
        )
        .in('status', [
          ...TOUR_CONFIRMED_STATUSES,
          ...TOUR_PENDING_STATUSES,
          ...TOUR_CANCELLED_STATUSES,
        ])

      if (startDate) tourQuery = tourQuery.gte('created_at', startDate)
      if (endDate) tourQuery = tourQuery.lte('created_at', endDate)

      const { data: tourData, error: tourError } = await tourQuery
      if (tourError) throw tourError

      tourData.forEach((booking) => {
        const amount = parseFloat(booking.total_amount || 0)
        const agent = normalizeAgent(booking.assigned_to)

        if (TOUR_CANCELLED_STATUSES.includes(booking.status)) {
          statusCounts.cancelled += 1
        } else if (TOUR_PENDING_STATUSES.includes(booking.status)) {
          statusCounts.pendingPayment += 1
        } else if (TOUR_CONFIRMED_STATUSES.includes(booking.status)) {
          statusCounts.confirmed += 1
        }

        const destinationCountry =
          booking.package_dates?.tour_packages?.destination_country || 'N/A'
        const title = booking.package_dates?.tour_packages?.title || 'Untitled'

        const existing = agentTourMap.get(agent.id) || {
          agentId: agent.id,
          agentName: agent.name,
          bookingCount: 0,
          totalRevenue: 0,
          bookings: [],
        }

        existing.bookingCount += 1
        existing.totalRevenue += amount
        existing.bookings.push({
          bookingReference: booking.booking_reference,
          destinationCountry,
          title,
          amount,
          status: booking.status,
          created_at: booking.created_at,
        })

        agentTourMap.set(agent.id, existing)
      })
    }

    const flights = Array.from(agentFlightMap.values()).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    )
    const tours = Array.from(agentTourMap.values()).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    )

    res.json({
      agentStats: {
        flights,
        tours,
      },
      statusCounts,
    })
  } catch (error) {
    console.error('Error fetching agent sales stats:', error)
    res.status(500).json({ error: 'Failed to fetch agent sales stats' })
  }
}

/**
 * Export sales report as Excel file
 */
export const exportSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, flightClass, dataType = 'Flights' } = req.query

    console.log(
      `Generating Excel export for period: ${startDate || 'all'} to ${
        endDate || 'all'
      }, class: ${flightClass || 'all'}`
    )

    // Get sales report data
    const reportReq = { query: { startDate, endDate, flightClass, dataType } }
    let reportData
    let topTravelersData

    // Fetch report data with better error handling
    try {
      await new Promise((resolve, reject) => {
        const mockRes = {
          json: (data) => {
            reportData = data
            resolve()
          },
          status: (code) => ({
            json: (data) => {
              reject(
                new Error(
                  `Sales report fetch failed (${code}): ${
                    data.error || 'Unknown error'
                  }`
                )
              )
            },
          }),
        }
        getSalesReport(reportReq, mockRes).catch((err) => {
          console.error('Error in getSalesReport:', err)
          reject(err)
        })
      })
    } catch (reportError) {
      console.error('Failed to fetch sales report data:', reportError)
      throw new Error(`Sales report data unavailable: ${reportError.message}`)
    }

    // Fetch top travelers with better error handling (flights only)
    try {
      await new Promise((resolve, reject) => {
        const mockRes = {
          json: (data) => {
            topTravelersData = data
            resolve()
          },
          status: (code) => ({
            json: (data) => {
              reject(
                new Error(
                  `Top travelers fetch failed (${code}): ${
                    data.error || 'Unknown error'
                  }`
                )
              )
            },
          }),
        }
        getTopTravelers(reportReq, mockRes).catch((err) => {
          console.error('Error in getTopTravelers:', err)
          reject(err)
        })
      })
    } catch (travelersError) {
      console.error('Failed to fetch top travelers data:', travelersError)
      throw new Error(
        `Top travelers data unavailable: ${travelersError.message}`
      )
    }

    console.log(
      `Successfully fetched data: ${reportData.summary.bookingCount} bookings, ${topTravelersData.topTravelers.length} top travelers`
    )

    // Create workbook
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Trabilis Admin'
    workbook.created = new Date()

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary')
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 },
    ]

    summarySheet.addRows([
      {
        metric: 'Total Revenue',
        value: `₱${reportData.summary.totalRevenue.toFixed(2)}`,
      },
      {
        metric: 'Total Bookings',
        value: reportData.summary.bookingCount,
      },
      {
        metric: 'Average Booking Value',
        value: `₱${reportData.summary.averageBookingValue.toFixed(2)}`,
      },
      {
        metric: 'Report Period',
        value: `${startDate || 'All'} to ${endDate || 'All'}`,
      },
      { metric: 'Flight Class Filter', value: flightClass || 'All' },
    ])

    summarySheet.getRow(1).font = { bold: true }

    // Revenue Trends Sheet
    const trendsSheet = workbook.addWorksheet('Revenue Trends')
    trendsSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Revenue', key: 'revenue', width: 20 },
      { header: 'Bookings', key: 'count', width: 15 },
    ]

    reportData.revenueTrends.forEach((trend) => {
      trendsSheet.addRow({
        date: trend.date,
        revenue: `₱${trend.revenue.toFixed(2)}`,
        count: trend.count,
      })
    })

    trendsSheet.getRow(1).font = { bold: true }

    // Top Travelers Sheet
    const travelersSheet = workbook.addWorksheet('Top Travelers')
    travelersSheet.columns = [
      { header: 'Rank', key: 'rank', width: 10 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Bookings', key: 'bookingCount', width: 15 },
      { header: 'Total Revenue', key: 'totalRevenue', width: 20 },
      { header: 'Booking References', key: 'references', width: 40 },
    ]

    topTravelersData.topTravelers.forEach((traveler) => {
      travelersSheet.addRow({
        rank: traveler.rank,
        name: traveler.name,
        email: traveler.email || 'N/A',
        bookingCount: traveler.bookingCount,
        totalRevenue: `₱${traveler.totalRevenue.toFixed(2)}`,
        references: traveler.bookingReferences.join(', '),
      })
    })

    travelersSheet.getRow(1).font = { bold: true }

    // Generate Excel file
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=sales-report-${Date.now()}.xlsx`
    )

    await workbook.xlsx.write(res)
    res.end()

    console.log('Excel export completed successfully')
  } catch (error) {
    console.error('Error exporting sales report:', error)
    console.error('Error stack:', error.stack)

    // Provide detailed error message to admin
    const errorMessage =
      error.message.includes('data unavailable') ||
      error.message.includes('fetch failed')
        ? error.message
        : `Failed to export sales report: ${error.message}`

    res.status(500).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
}
