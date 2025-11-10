import { supabase } from '../config/supabaseClient.js'
import {
  sendConfirmationEmail,
  generateFlightItineraryPDF,
  getBookingByBookingReference,
  sendTourConfirmationEmail,
  sendFailureEmail,
  sendTourFailureEmail,
  sendVisaInquiryConfirmationEmail,
  sendCancellationVerificationEmail,
} from '../services/brevoEmailService.js'
import brevo from '@getbrevo/brevo'
import { mockFlightOffers } from '../mock/flightResultMockData.js'
import Pusher from 'pusher'
import { query } from '../config/db.js'
import path from 'path'
import fs, { stat } from 'fs'
import { fileURLToPath } from 'url'
import dayjs from 'dayjs'
import { formatSegment } from '../utils/flightutils.js'
import { amadeus } from '../config/amadeus.js'
import { insertAdminNotification } from '../database/supabaseService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const sendTestEmail = async (req, res) => {
  const { bookingReference } = req.body

  if (!bookingReference) {
    return res.status(400).json({
      error: 'Missing bookingReference in request body',
    })
  }

  try {
    await sendConfirmationEmail(bookingReference)
    res.status(200).json({
      message: '✅ Email process completed successfully.',
    })
  } catch (err) {
    console.error('❌ Email process failed:', err)
    res.status(500).json({
      error: 'Email process failed',
      details: err.message,
    })
  }
}

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  useTLS: true,
})

export const sendTestNotification = async (req, res) => {
  try {
    const { bookingReference, pnr } = req.body

    if (!bookingReference || !pnr) {
      return res.status(400).json({
        success: false,
        message: 'bookingReference and pnr are required',
      })
    }

    // Save to Supabase so it persists after reload
    const { error: insertError } = await insertAdminNotification({
      type: 'new_booking',
      event_type: 'new_booking', // Required field for database
      message: `Booking ${bookingReference} finalized with PNR: ${pnr}`,
      booking_reference: bookingReference,
      booking_type: 'flight',
      category: 'booking',
      priority: 'medium',
      action_url: '/admin/flights',
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error('Supabase insert error:', insertError.message)
      return res.status(500).json({
        success: false,
        message: 'Failed to save notification in database',
      })
    }

    // Send real-time notification
    await pusher.trigger('admin-notifications', 'new-booking', {
      bookingReference,
      pnr,
    })

    return res.status(200).json({
      success: true,
      message: 'Test notification sent successfully',
    })
  } catch (err) {
    console.error('Pusher error:', err)
    return res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
    })
  }
}

export const generateMockPDF = async (req, res) => {
  try {
    // Create mock booking data using the first flight offer from mock data
    const mockBookingData = {
      booking_reference: 'TRB-FLT-MOCK123',
      pnr: 'MOCKPNR',
      status: 'TICKETED',
      e_ticket_numbers: ['ET123456789', 'ET987654321'],
      amadeus_flight_offer: mockFlightOffers.data[0], // Use first mock flight offer
      passenger_details: {
        travelers: [
          {
            title: 'Mr',
            name: {
              firstName: 'John',
              lastName: 'Doe',
            },
            dateOfBirth: '1990-01-15',
            documents: [
              {
                number: 'P123456789',
                expiryDate: '2030-01-15',
                nationality: 'US',
              },
            ],
            contact: {
              emailAddress: 'john.doe@example.com',
            },
          },
          {
            title: 'Ms',
            name: {
              firstName: 'Jane',
              lastName: 'Doe',
            },
            dateOfBirth: '1992-05-20',
            documents: [
              {
                number: 'P987654321',
                expiryDate: '2032-05-20',
                nationality: 'US',
              },
            ],
            contact: {
              emailAddress: 'jane.doe@example.com',
            },
          },
        ],
      },
    }

    // Generate PDF
    const pdfBuffer = await generateFlightItineraryPDF(mockBookingData)

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="mock-flight-itinerary.pdf"'
    )
    res.setHeader('Content-Length', pdfBuffer.length)

    // Send PDF buffer
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Error generating mock PDF:', error)
    res.status(500).json({
      error: 'Failed to generate mock PDF',
      details: error.message,
    })
  }
}

export const generateRealPDF = async (req, res) => {
  try {
    const { bookingReference } = req.query

    if (!bookingReference) {
      return res.status(400).json({
        error: 'Missing bookingReference query parameter',
        message:
          'Please provide a booking reference as a query parameter: ?bookingReference=YOUR_REFERENCE',
      })
    }

    console.log(`🔍 Fetching booking data for reference: ${bookingReference}`)

    // Get real booking data from database
    const bookingDetails = await getBookingByBookingReference(bookingReference)

    console.log(
      `✅ Booking data retrieved successfully for: ${bookingReference}`
    )
    console.log(`📊 Booking status: ${bookingDetails.status}`)
    console.log(
      `👥 Number of passengers: ${bookingDetails.passenger_details?.travelers?.length || 0}`
    )

    // Generate PDF using real data
    const pdfBuffer = await generateFlightItineraryPDF(bookingDetails)

    console.log(
      `📄 PDF generated successfully. Size: ${pdfBuffer.length} bytes`
    )

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="flight-itinerary-${bookingReference}.pdf"`
    )
    res.setHeader('Content-Length', pdfBuffer.length)

    // Send PDF buffer
    res.send(pdfBuffer)
  } catch (error) {
    console.error('❌ Error generating real PDF:', error)
    res.status(500).json({
      error: 'Failed to generate PDF',
      details: error.message,
      message: 'Make sure the booking reference exists in the database',
    })
  }
}

export const listBookingReferences = async (req, res) => {
  try {
    const { limit = 10 } = req.query

    // Get recent flight booking references
    const result = await query(
      `SELECT booking_reference, status, updated_at, passenger_details
             FROM flight_bookings 
             ORDER BY updated_at DESC 
             LIMIT ?`,
      [parseInt(limit)]
    )

    const bookings = result.rows.map((row) => {
      const passengerDetails = row.passenger_details
      const firstTraveler = passengerDetails?.travelers?.[0]
      const firstName = firstTraveler?.name?.firstName || 'N/A'
      const lastName = firstTraveler?.name?.lastName || 'N/A'
      return {
        booking_reference: row.booking_reference,
        status: row.status,
        updated_at: row.updated_at,
        passenger_name: `${firstName} ${lastName}`.trim(),
      }
    })

    res.json({
      success: true,
      message: `Found ${bookings.length} recent flight bookings`,
      data: bookings,
      instructions: {
        test_pdf: `GET /api/test/real-pdf?bookingReference=YOUR_REFERENCE`,
        example: `GET /api/test/real-pdf?bookingReference=${bookings[0]?.booking_reference || 'TRB-FLT-XXXXXXXX'}`,
      },
    })
  } catch (error) {
    console.error('❌ Error fetching booking references:', error)
    res.status(500).json({
      error: 'Failed to fetch booking references',
      details: error.message,
    })
  }
}

// ==================== EMAIL TESTING FUNCTIONS ====================

export const testFlightConfirmationEmail = async (req, res) => {
  try {
    const { bookingReference, testEmail } = req.body

    if (!bookingReference) {
      return res.status(400).json({
        error: 'Missing bookingReference in request body',
        message: 'Please provide a booking reference to test with',
      })
    }

    console.log(
      `📧 Testing flight confirmation email for booking: ${bookingReference}`
    )

    // Get real booking data
    const bookingDetails = await getBookingByBookingReference(bookingReference)

    // If testEmail is provided, temporarily override the customer email
    if (testEmail) {
      if (bookingDetails.passenger_details?.travelers?.[0]) {
        bookingDetails.passenger_details.travelers[0].contact = {
          ...bookingDetails.passenger_details.travelers[0].contact,
          emailAddress: testEmail,
        }
      }
    }

    await sendConfirmationEmail(bookingReference)

    res.status(200).json({
      success: true,
      message: '✅ Flight confirmation email sent successfully!',
      details: {
        bookingReference,
        recipientEmail:
          testEmail ||
          bookingDetails.passenger_details?.travelers?.[0]?.contact
            ?.emailAddress,
        emailType: 'Flight Confirmation',
      },
    })
  } catch (err) {
    console.error('❌ Flight confirmation email test failed:', err)
    res.status(500).json({
      error: 'Flight confirmation email test failed',
      details: err.message,
    })
  }
}

export const testTourConfirmationEmail = async (req, res) => {
  try {
    const { testEmail, tourTitle = 'Test Tour Package' } = req.body

    if (!testEmail) {
      return res.status(400).json({
        error: 'Missing testEmail in request body',
        message: 'Please provide a test email address',
      })
    }

    console.log(`📧 Testing tour confirmation email to: ${testEmail}`)

    // Create mock tour booking data
    const mockTourBooking = {
      email: testEmail,
      firstName: 'John',
      lastName: 'Doe',
      bookingReference: 'TRB-TOUR-TEST123',
      tourTitle: tourTitle,
      startDate: '2024-02-15',
      endDate: '2024-02-20',
      passengerCount: 2,
      passengers: [
        {
          name: { firstName: 'John', lastName: 'Doe' },
          type: 'Adult',
          contact: { emailAddress: testEmail },
          dateOfBirth: '1990-01-15',
        },
        {
          name: { firstName: 'Jane', lastName: 'Doe' },
          type: 'Adult',
          contact: { emailAddress: testEmail },
          dateOfBirth: '1992-05-20',
        },
      ],
      amount: '₱25,000.00',
      status: 'CONFIRMED',
      inclusions: 'Hotel accommodation, meals, transportation, guided tours',
      exclusions: 'Personal expenses, optional activities',
      itinerary:
        'Day 1: Arrival and city tour\nDay 2: Historical sites visit\nDay 3: Cultural experience\nDay 4: Free day\nDay 5: Departure',
      requirements: 'Valid passport, travel insurance',
      paymentTerms: 'Full payment required 30 days before departure',
    }

    await sendTourConfirmationEmail(mockTourBooking)

    res.status(200).json({
      success: true,
      message: '✅ Tour confirmation email sent successfully!',
      details: {
        recipientEmail: testEmail,
        tourTitle: tourTitle,
        emailType: 'Tour Confirmation',
      },
    })
  } catch (err) {
    console.error('❌ Tour confirmation email test failed:', err)
    res.status(500).json({
      error: 'Tour confirmation email test failed',
      details: err.message,
    })
  }
}

export const testFailureEmail = async (req, res) => {
  try {
    const { testEmail, bookingReference = 'TRB-FLT-TEST123' } = req.body

    if (!testEmail) {
      return res.status(400).json({
        error: 'Missing testEmail in request body',
        message: 'Please provide a test email address',
      })
    }

    console.log(`📧 Testing flight failure email to: ${testEmail}`)

    const failureData = {
      email: testEmail,
      firstName: 'John',
      lastName: 'Doe',
      bookingReference: bookingReference,
      searchCriteria: {
        origin: 'MNL',
        destination: 'LAX',
        departureDate: '2024-02-15',
        returnDate: '2024-02-22',
        passengers: 2,
      },
    }

    await sendFailureEmail(failureData)

    res.status(200).json({
      success: true,
      message: '✅ Flight failure email sent successfully!',
      details: {
        recipientEmail: testEmail,
        bookingReference: bookingReference,
        emailType: 'Flight Failure',
      },
    })
  } catch (err) {
    console.error('❌ Flight failure email test failed:', err)
    res.status(500).json({
      error: 'Flight failure email test failed',
      details: err.message,
    })
  }
}

export const testTourFailureEmail = async (req, res) => {
  try {
    const { testEmail, bookingReference = 'TRB-TOUR-TEST123' } = req.body

    if (!testEmail) {
      return res.status(400).json({
        error: 'Missing testEmail in request body',
        message: 'Please provide a test email address',
      })
    }

    console.log(`📧 Testing tour failure email to: ${testEmail}`)

    const failureData = {
      email: testEmail,
      firstName: 'John',
      lastName: 'Doe',
      bookingReference: bookingReference,
    }

    await sendTourFailureEmail(failureData)

    res.status(200).json({
      success: true,
      message: '✅ Tour failure email sent successfully!',
      details: {
        recipientEmail: testEmail,
        bookingReference: bookingReference,
        emailType: 'Tour Failure',
      },
    })
  } catch (err) {
    console.error('❌ Tour failure email test failed:', err)
    res.status(500).json({
      error: 'Tour failure email test failed',
      details: err.message,
    })
  }
}

export const testVisaInquiryEmail = async (req, res) => {
  try {
    const {
      testEmail,
      visaType = 'Tourist Visa',
      destination = 'United States',
    } = req.body

    if (!testEmail) {
      return res.status(400).json({
        error: 'Missing testEmail in request body',
        message: 'Please provide a test email address',
      })
    }

    console.log(`📧 Testing visa inquiry confirmation email to: ${testEmail}`)

    const inquiryData = {
      inquiryReference: 'VISA-INQ-TEST123',
      visa_type: visaType,
      destination: destination,
      full_name: 'John Doe',
      email_address: testEmail,
      message:
        'I am interested in applying for a tourist visa to visit the United States. Could you please provide me with information about the requirements and process?',
    }

    await sendVisaInquiryConfirmationEmail(inquiryData)

    res.status(200).json({
      success: true,
      message: '✅ Visa inquiry confirmation email sent successfully!',
      details: {
        recipientEmail: testEmail,
        inquiryReference: inquiryData.inquiryReference,
        visaType: visaType,
        destination: destination,
        emailType: 'Visa Inquiry Confirmation',
      },
    })
  } catch (err) {
    console.error('❌ Visa inquiry email test failed:', err)
    res.status(500).json({
      error: 'Visa inquiry email test failed',
      details: err.message,
    })
  }
}

export const debugFlightEmail = async (req, res) => {
  try {
    const { bookingReference } = req.query

    if (!bookingReference) {
      return res.status(400).json({
        error: 'Missing bookingReference query parameter',
        message: 'Please provide a booking reference to debug',
      })
    }

    console.log(`🔍 Debugging flight email for booking: ${bookingReference}`)

    // Step 1: Check if booking exists
    const { data: booking, error: bookingError } = await supabase
      .from('flight_bookings')
      .select('*')
      .eq('booking_reference', bookingReference)
      .single()

    if (bookingError || !booking) {
      return res.status(404).json({
        error: 'Booking not found',
        details:
          bookingError?.message || 'No booking found with that reference',
      })
    }

    console.log(`📊 Booking found - Status: ${booking.status}`)

    // Step 2: Check passenger details
    const passengerDetails = booking.passenger_details
    const customerEmail =
      passengerDetails?.travelers?.[0]?.contact?.emailAddress

    if (!customerEmail) {
      return res.status(400).json({
        error: 'No customer email found',
        details: 'Passenger details missing or invalid email address',
      })
    }

    console.log(`📧 Customer email found: ${customerEmail}`)

    // Step 3: Check which email service is being used
    console.log(`🔍 Email service check:`)
    console.log(`- BREVO_API_KEY exists: ${!!process.env.BREVO_API_KEY}`)
    console.log(`- GMAIL_SMTP_FROM exists: ${!!process.env.GMAIL_SMTP_FROM}`)
    console.log(`- BREVO_FROM_EMAIL: ${process.env.BREVO_FROM_EMAIL}`)

    // Step 4: Try to send email
    try {
      await sendConfirmationEmail(bookingReference)
      console.log(`✅ Email sent successfully to ${customerEmail}`)

      res.status(200).json({
        success: true,
        message: '✅ Flight confirmation email sent successfully!',
        details: {
          bookingReference,
          customerEmail,
          bookingStatus: booking.status,
          emailType: 'Flight Confirmation',
          emailService: {
            brevoApiKey: !!process.env.BREVO_API_KEY,
            gmailSmtp: !!process.env.GMAIL_SMTP_FROM,
            fromEmail:
              process.env.BREVO_FROM_EMAIL || process.env.GMAIL_SMTP_FROM,
          },
        },
      })
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError)
      res.status(500).json({
        error: 'Email sending failed',
        details: emailError.message,
        bookingReference,
        customerEmail,
        bookingStatus: booking.status,
        emailService: {
          brevoApiKey: !!process.env.BREVO_API_KEY,
          gmailSmtp: !!process.env.GMAIL_SMTP_FROM,
          fromEmail:
            process.env.BREVO_FROM_EMAIL || process.env.GMAIL_SMTP_FROM,
        },
      })
    }
  } catch (err) {
    console.error('❌ Debug failed:', err)
    res.status(500).json({
      error: 'Debug failed',
      details: err.message,
    })
  }
}

export const debugBookingStatus = async (req, res) => {
  try {
    const { bookingReference } = req.query

    if (!bookingReference) {
      return res.status(400).json({
        error: 'Missing bookingReference query parameter',
        message: 'Please provide a booking reference to debug',
      })
    }

    console.log(`🔍 Debugging booking status for: ${bookingReference}`)

    // Get all bookings with this reference (in case there are multiple)
    const { data: bookings, error: bookingError } = await supabase
      .from('flight_bookings')
      .select('*')
      .eq('booking_reference', bookingReference)

    if (bookingError) {
      return res.status(500).json({
        error: 'Database error',
        details: bookingError.message,
      })
    }

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        error: 'Booking not found',
        message: `No booking found with reference: ${bookingReference}`,
      })
    }

    // Check if any booking is in PENDING_PAYMENT status
    const pendingBookings = bookings.filter(
      (b) => b.status === 'PENDING_PAYMENT'
    )
    const paidBookings = bookings.filter(
      (b) => b.status === 'PAID_PENDING_TICKETING'
    )
    const ticketedBookings = bookings.filter((b) => b.status === 'TICKETED')

    res.status(200).json({
      success: true,
      message: `Found ${bookings.length} booking(s) with reference ${bookingReference}`,
      details: {
        bookingReference,
        totalBookings: bookings.length,
        statusBreakdown: {
          PENDING_PAYMENT: pendingBookings.length,
          PAID_PENDING_TICKETING: paidBookings.length,
          TICKETED: ticketedBookings.length,
          other:
            bookings.length -
            pendingBookings.length -
            paidBookings.length -
            ticketedBookings.length,
        },
        allStatuses: bookings.map((b) => ({
          id: b.id,
          status: b.status,
          created_at: b.created_at,
          updated_at: b.updated_at,
        })),
        webhookIssue:
          pendingBookings.length === 0
            ? 'No bookings in PENDING_PAYMENT status - webhook update will fail'
            : 'Bookings found in PENDING_PAYMENT status - webhook should work',
      },
    })
  } catch (err) {
    console.error('❌ Debug failed:', err)
    res.status(500).json({
      error: 'Debug failed',
      details: err.message,
    })
  }
}

export const debugWebhookUpdate = async (req, res) => {
  try {
    const { bookingReference } = req.query

    if (!bookingReference) {
      return res.status(400).json({
        error: 'Missing bookingReference query parameter',
        message: 'Please provide a booking reference to debug',
      })
    }

    console.log(`🔍 Testing webhook update for: ${bookingReference}`)

    // Step 1: Check current status
    const { data: beforeData, error: beforeError } = await supabase
      .from('flight_bookings')
      .select('id, status, updated_at')
      .eq('booking_reference', bookingReference)
      .eq('status', 'PENDING_PAYMENT')
      .single()

    if (beforeError || !beforeData) {
      return res.status(400).json({
        error: 'Booking not found or not in PENDING_PAYMENT status',
        details:
          beforeError?.message ||
          'No booking found with PENDING_PAYMENT status',
        currentStatus: beforeData?.status || 'unknown',
      })
    }

    console.log(
      `📊 Before update - Status: ${beforeData.status}, ID: ${beforeData.id}`
    )

    // Step 2: Try the exact same update as webhook
    const { data: updateData, error: updateError } = await supabase
      .from('flight_bookings')
      .update({
        status: 'PAID_PENDING_TICKETING',
        updated_at: new Date().toISOString(),
      })
      .eq('booking_reference', bookingReference)
      .eq('status', 'PENDING_PAYMENT')
      .select('id, status, updated_at')

    if (updateError) {
      return res.status(500).json({
        error: 'Update failed',
        details: updateError.message,
        beforeStatus: beforeData.status,
      })
    }

    console.log(`📊 Update result - Rows affected: ${updateData?.length || 0}`)

    // Step 3: Check final status
    const { data: afterData, error: afterError } = await supabase
      .from('flight_bookings')
      .select('id, status, updated_at')
      .eq('booking_reference', bookingReference)
      .single()

    res.status(200).json({
      success: true,
      message: 'Webhook update test completed',
      details: {
        bookingReference,
        beforeUpdate: {
          id: beforeData.id,
          status: beforeData.status,
          updated_at: beforeData.updated_at,
        },
        updateResult: {
          rowsAffected: updateData?.length || 0,
          updatedRows: updateData || [],
        },
        afterUpdate: {
          id: afterData?.id,
          status: afterData?.status,
          updated_at: afterData?.updated_at,
        },
        success: updateData && updateData.length > 0,
        error: afterError?.message,
      },
    })
  } catch (err) {
    console.error('❌ Webhook update test failed:', err)
    res.status(500).json({
      error: 'Webhook update test failed',
      details: err.message,
    })
  }
}

export const debugAmadeusAPI = async (req, res) => {
  try {
    const { bookingReference } = req.query

    if (!bookingReference) {
      return res.status(400).json({
        error: 'Missing bookingReference query parameter',
        message: 'Please provide a booking reference to debug',
      })
    }

    console.log(`🔍 Testing Amadeus API for booking: ${bookingReference}`)

    // Step 1: Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('flight_bookings')
      .select('amadeus_order_id, status, passenger_details, search_criteria')
      .eq('booking_reference', bookingReference)
      .single()

    if (bookingError || !booking) {
      return res.status(404).json({
        error: 'Booking not found',
        details:
          bookingError?.message || 'No booking found with that reference',
      })
    }

    console.log(
      `📊 Booking found - Status: ${booking.status}, Amadeus Order ID: ${booking.amadeus_order_id}`
    )

    if (!booking.amadeus_order_id) {
      return res.status(400).json({
        error: 'No Amadeus order ID found',
        details: 'This booking does not have an Amadeus order ID',
        booking: {
          status: booking.status,
          amadeus_order_id: booking.amadeus_order_id,
        },
      })
    }

    // Step 2: Test Amadeus API call
    try {
      console.log(
        `🔍 Calling Amadeus API for order: ${booking.amadeus_order_id}`
      )

      const response = await amadeus.booking
        .flightOrder(booking.amadeus_order_id)
        .get()

      const order = response.data
      console.log(`✅ Amadeus API call successful`)

      // Extract e-ticket numbers and PNR
      const eTicketNumbers =
        order.associatedRecords?.map((record) => record.reference) || []
      const pnr =
        order.associatedRecords?.find(
          (record) => record.originSystemCode === 'GDS'
        )?.reference || null

      res.status(200).json({
        success: true,
        message: 'Amadeus API call successful',
        details: {
          bookingReference,
          amadeusOrderId: booking.amadeus_order_id,
          eTicketNumbers,
          pnr,
          orderData: {
            type: order.type,
            id: order.id,
            associatedRecords: order.associatedRecords?.length || 0,
            flightOffers: order.flightOffers?.length || 0,
          },
        },
      })
    } catch (amadeusError) {
      console.error(`❌ Amadeus API call failed:`, amadeusError)

      res.status(500).json({
        error: 'Amadeus API call failed',
        details: {
          message: amadeusError.message,
          response: amadeusError.response?.data,
          status: amadeusError.response?.status,
          code: amadeusError.code,
          bookingReference,
          amadeusOrderId: booking.amadeus_order_id,
        },
      })
    }
  } catch (err) {
    console.error('❌ Amadeus API debug failed:', err)
    res.status(500).json({
      error: 'Amadeus API debug failed',
      details: err.message,
    })
  }
}

export const debugFinalization = async (req, res) => {
  try {
    const { bookingReference } = req.query

    if (!bookingReference) {
      return res.status(400).json({
        error: 'Missing bookingReference query parameter',
        message: 'Please provide a booking reference to debug',
      })
    }

    console.log(
      `🔍 Testing complete finalization process for: ${bookingReference}`
    )

    // Step 1: Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('flight_bookings')
      .select('amadeus_order_id, status, passenger_details, search_criteria')
      .eq('booking_reference', bookingReference)
      .single()

    if (bookingError || !booking) {
      return res.status(404).json({
        error: 'Booking not found',
        details:
          bookingError?.message || 'No booking found with that reference',
      })
    }

    console.log(
      `📊 Booking found - Status: ${booking.status}, Amadeus Order ID: ${booking.amadeus_order_id}`
    )

    if (!booking.amadeus_order_id) {
      return res.status(400).json({
        error: 'No Amadeus order ID found',
        details: 'This booking does not have an Amadeus order ID',
      })
    }

    // Step 2: Test Amadeus API call
    let order, eTicketNumbers, pnr
    try {
      console.log(
        `🔍 Calling Amadeus API for order: ${booking.amadeus_order_id}`
      )

      const response = await amadeus.booking
        .flightOrder(booking.amadeus_order_id)
        .get()

      order = response.data
      console.log(`✅ Amadeus API call successful`)

      // Extract e-ticket numbers and PNR
      eTicketNumbers =
        order.associatedRecords?.map((record) => record.reference) || []
      pnr =
        order.associatedRecords?.find(
          (record) => record.originSystemCode === 'GDS'
        )?.reference || null

      console.log(`📄 E-ticket numbers: ${JSON.stringify(eTicketNumbers)}`)
      console.log(`🎫 PNR: ${pnr}`)
    } catch (amadeusError) {
      console.error(`❌ Amadeus API call failed:`, amadeusError)
      return res.status(500).json({
        error: 'Amadeus API call failed',
        details: {
          message: amadeusError.message,
          response: amadeusError.response?.data,
          status: amadeusError.response?.status,
          code: amadeusError.code,
        },
      })
    }

    // Step 3: Test database update
    try {
      console.log(`🔍 Updating booking status to TICKETED`)

      const { data: updateData, error: updateError } = await supabase
        .from('flight_bookings')
        .update({
          status: 'TICKETED',
          e_ticket_numbers: eTicketNumbers,
          pnr: pnr,
        })
        .eq('booking_reference', bookingReference)
        .select('id, status, e_ticket_numbers, pnr, updated_at')

      if (updateError) {
        console.error(`❌ Database update failed:`, updateError)
        return res.status(500).json({
          error: 'Database update failed',
          details: {
            message: updateError.message,
            code: updateError.code,
            hint: updateError.hint,
            details: updateError.details,
          },
        })
      }

      console.log(`✅ Database update successful`)
      console.log(`📊 Updated rows: ${updateData?.length || 0}`)

      // Step 4: Test email sending
      try {
        console.log(`🔍 Testing email sending`)
        await sendConfirmationEmail(bookingReference)
        console.log(`✅ Email sent successfully`)

        res.status(200).json({
          success: true,
          message: 'Complete finalization process successful!',
          details: {
            bookingReference,
            amadeusOrderId: booking.amadeus_order_id,
            eTicketNumbers,
            pnr,
            databaseUpdate: {
              rowsAffected: updateData?.length || 0,
              updatedRows: updateData || [],
            },
            emailSent: true,
            finalStatus: 'TICKETED',
          },
        })
      } catch (emailError) {
        console.error(`❌ Email sending failed:`, emailError)
        res.status(500).json({
          error: 'Email sending failed',
          details: {
            message: emailError.message,
            bookingReference,
            eTicketNumbers,
            pnr,
            databaseUpdate: {
              rowsAffected: updateData?.length || 0,
              updatedRows: updateData || [],
            },
          },
        })
      }
    } catch (dbError) {
      console.error(`❌ Database update failed:`, dbError)
      res.status(500).json({
        error: 'Database update failed',
        details: {
          message: dbError.message,
          eTicketNumbers,
          pnr,
        },
      })
    }
  } catch (err) {
    console.error('❌ Finalization debug failed:', err)
    res.status(500).json({
      error: 'Finalization debug failed',
      details: err.message,
    })
  }
}

// Test cancellation verification email
export const testCancellationVerificationEmail = async (req, res) => {
  try {
    const { testEmail, bookingReference } = req.body

    if (!testEmail) {
      return res.status(400).json({
        error: 'Missing testEmail in request body',
        message: 'Please provide a test email address',
      })
    }

    console.log(`📧 Testing cancellation verification email to: ${testEmail}`)

    // Test data
    const testData = {
      email: testEmail,
      firstName: 'John',
      lastName: 'Doe',
      bookingReference: bookingReference || 'TRB-FLT-test123',
      token: 'test-token-12345',
      totalAmount: 25000,
      currency: 'PHP',
      cancellationReason: 'Test cancellation reason',
    }

    console.log(`📧 Test data:`, testData)
    console.log(`📧 Environment check:`, {
      BREVO_API_KEY: !!process.env.BREVO_API_KEY,
      BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL,
      FRONTEND_URL: process.env.FRONTEND_URL,
    })

    await sendCancellationVerificationEmail(testData)

    res.status(200).json({
      success: true,
      message: '✅ Cancellation verification email sent successfully!',
      details: {
        recipientEmail: testEmail,
        emailType: 'Cancellation Verification',
        testData: testData,
      },
    })
  } catch (err) {
    console.error('❌ Cancellation verification email test failed:', err)
    res.status(500).json({
      error: 'Cancellation verification email test failed',
      details: err.message,
    })
  }
}

// Test Brevo API directly
export const testBrevoApi = async (req, res) => {
  try {
    const { testEmail } = req.body

    if (!testEmail) {
      return res.status(400).json({
        error: 'Missing testEmail in request body',
        message: 'Please provide a test email address',
      })
    }

    console.log(`📧 Testing Brevo API directly with email: ${testEmail}`)

    // Initialize Brevo API client
    const apiInstance = new brevo.TransactionalEmailsApi()
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    )

    // Create a simple test email
    const sendSmtpEmail = new brevo.SendSmtpEmail()
    sendSmtpEmail.subject = 'Test Email from Trabilis'
    sendSmtpEmail.htmlContent = `
            <h2>Test Email</h2>
            <p>This is a test email to verify Brevo API is working.</p>
            <p>Time: ${new Date().toISOString()}</p>
        `
    sendSmtpEmail.sender = {
      name: 'Trabilis Test',
      email:
        process.env.BREVO_FROM_EMAIL ||
        process.env.SUPPORT_EMAIL ||
        'noreply@trabilis.com',
    }
    sendSmtpEmail.to = [
      {
        email: testEmail,
        name: 'Test User',
      },
    ]

    console.log(`📧 Sending test email...`)
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)

    console.log(`📧 Brevo API response:`, result)

    res.status(200).json({
      success: true,
      message: '✅ Brevo API test successful!',
      details: {
        recipientEmail: testEmail,
        messageId: result.messageId,
        response: result.response,
      },
    })
  } catch (err) {
    console.error('❌ Brevo API test failed:', err)
    res.status(500).json({
      error: 'Brevo API test failed',
      details: err.message,
      stack: err.stack,
    })
  }
}
