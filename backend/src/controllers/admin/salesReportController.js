import { supabase } from '../../config/supabaseClient.js'
import ExcelJS from 'exceljs'

/**
 * Get sales report with analytics
 * Query params: startDate, endDate, flightClass
 */
export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, flightClass } = req.query

    // Build query for flight bookings
    let query = supabase
      .from('flight_bookings')
      .select('*')
      .in('status', ['BOOKED', 'TICKETED'])

    // Apply date filters
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: bookings, error } = await query

    if (error) throw error

    // Track excluded bookings for error reporting
    let excludedBookings = []

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
 * Export sales report as Excel file
 */
export const exportSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, flightClass } = req.query

    console.log(
      `Generating Excel export for period: ${startDate || 'all'} to ${
        endDate || 'all'
      }, class: ${flightClass || 'all'}`
    )

    // Get sales report data
    const reportReq = { query: { startDate, endDate, flightClass } }
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

    // Fetch top travelers with better error handling
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
