import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSnackbar } from '../../context/SnackbarContext'
import {
  BsFillAirplaneFill,
  BsArrowLeft,
  BsPerson,
  BsCreditCard,
  BsCalendar,
  BsGeoAlt,
  BsTelephone,
  BsEnvelope,
  BsPrinter,
  BsPencil,
  BsXCircle,
  BsCheckCircle,
  BsClock,
  BsFileEarmarkPdf,
  BsDownload,
  BsEye,
  BsX,
  BsClipboard,
} from 'react-icons/bs'
import { FiSave } from 'react-icons/fi'
import Select from 'react-select'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/airbnb.css'
import { getNationalityOptions } from '../../utils/nationalityMapping'
import { supabase } from '../../api/supabaseClient'
import adminClient from '../../api/adminClient'
import './FlightBookingDetail.css'

const FlightBookingDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showSuccess, showError } = useSnackbar()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [printLoading, setPrintLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [assignedAdminName, setAssignedAdminName] = useState('')
  const [cancellationLoading, setCancellationLoading] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')

  // Inline editing state
  const [ticketNumbers, setTicketNumbers] = useState({})
  const [editableBookingData, setEditableBookingData] = useState({})
  const [initialBookingData, setInitialBookingData] = useState({})
  const [initialTicketData, setInitialTicketData] = useState({})
  const [adminOptions, setAdminOptions] = useState([])
  const [loadingAdmins, setLoadingAdmins] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [savingTickets, setSavingTickets] = useState(false)

  // Passenger Edit Mode State
  const [isEditingPassengers, setIsEditingPassengers] = useState(false)
  const [editedPassengerDetails, setEditedPassengerDetails] = useState(null)
  const [savingPassengers, setSavingPassengers] = useState(false)

  const jwt = localStorage.getItem('adminToken')
  const nationalityOptions = getNationalityOptions()

  // Set Supabase auth session
  useEffect(() => {
    if (jwt) {
      supabase.auth.setSession({ access_token: jwt })
    }
  }, [jwt])

  // Fetch admin options
  const fetchAdminOptions = useCallback(async () => {
    setLoadingAdmins(true)
    try {
      const response = await adminClient.get('/appointments/all-staff')
      if (response.data.success) {
        const options = response.data.data.map((admin) => ({
          value: admin.id,
          label: `${admin.first_name} ${admin.last_name} (${admin.email})`,
          email: admin.email,
          name: `${admin.first_name} ${admin.last_name}`,
        }))
        setAdminOptions(options)
      }
    } catch (error) {
      console.error('Error fetching admin options:', error)
    } finally {
      setLoadingAdmins(false)
    }
  }, [])

  // Fetch assigned admin name
  const fetchAssignedAdminName = async (adminId) => {
    if (!adminId) return
    try {
      const response = await adminClient.get('/appointments/all-staff')
      if (response.data.success) {
        const admin = response.data.data.find((a) => a.id === adminId)
        if (admin) {
          setAssignedAdminName(`${admin.first_name} ${admin.last_name}`)
        }
      }
    } catch (error) {
      console.error('Error fetching assigned admin name:', error)
    }
  }

  // Initialize ticket numbers and editable data from booking
  useEffect(() => {
    if (booking) {
      // Initialize ticket numbers
      const tickets = Array.isArray(booking.e_ticket_numbers)
        ? booking.e_ticket_numbers
        : []

      const ticketMap = {}
      tickets.forEach((ticketNum, index) => {
        ticketMap[index] = ticketNum || ''
      })
      setTicketNumbers(ticketMap)
      setInitialTicketData(ticketMap)

      // Initialize editable booking data
      const bookingData = {
        pnr: booking.pnr || '',
        assigned_to: booking.assigned_to || '',
        assignment_status: booking.assignment_status || 'pending',
      }
      setEditableBookingData(bookingData)
      setInitialBookingData(bookingData)

      // Fetch admin options
      fetchAdminOptions()
    }
  }, [booking, fetchAdminOptions])

  // Check if booking data has unsaved changes
  const hasBookingChanges =
    JSON.stringify(editableBookingData) !== JSON.stringify(initialBookingData)

  // Check if ticket data has unsaved changes
  const hasTicketChanges =
    JSON.stringify(ticketNumbers) !== JSON.stringify(initialTicketData)

  // Handle ticket number change
  const handleTicketNumberChange = (passengerIndex, value) => {
    setTicketNumbers((prev) => ({
      ...prev,
      [passengerIndex]: value,
    }))
  }

  // Handle booking field change
  const handleBookingFieldChange = (field, value) => {
    setEditableBookingData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Save ticket numbers
  const handleSaveTickets = async () => {
    setSavingTickets(true)
    try {
      const travelers = passengerDetails?.travelers || []
      const ticketArray = travelers
        .map((_, index) => ticketNumbers[index]?.trim() || null)
        .filter(Boolean)

      const response = await adminClient.put(`/flights/${booking.id}/edit`, {
        e_ticket_numbers: ticketArray,
      })

      if (response.data.success) {
        // Use the full updated booking from backend (includes ticketed_at)
        setBooking(response.data.data)

        // Update initial state for change tracking
        const newTicketMap = {}
        const updatedTickets = response.data.data.e_ticket_numbers || []
        updatedTickets.forEach((ticketNum, index) => {
          newTicketMap[index] = ticketNum || ''
        })
        setInitialTicketData(newTicketMap)

        // Show appropriate success message
        if (response.data.data.ticketed_at && !booking.ticketed_at) {
          showSuccess('✅ Ticket numbers saved! Booking marked as TICKETED.')
        } else {
          showSuccess('Ticket numbers saved successfully!')
        }
      }
    } catch (error) {
      console.error('Error saving tickets:', error)
      showError('Failed to save ticket numbers')
    } finally {
      setSavingTickets(false)
    }
  }

  // Reset ticket changes
  const handleResetTickets = () => {
    setTicketNumbers(initialTicketData)
  }

  // Save booking-level changes
  const handleSaveBookingChanges = async () => {
    try {
      const response = await adminClient.put(
        `/flights/${booking.id}/edit`,
        editableBookingData
      )

      if (response.data.success) {
        setBooking((prev) => ({
          ...prev,
          ...editableBookingData,
          updated_at: new Date().toISOString(),
        }))
        setInitialBookingData(editableBookingData)

        // Update assigned admin name if changed
        if (
          editableBookingData.assigned_to &&
          editableBookingData.assigned_to !== booking.assigned_to
        ) {
          fetchAssignedAdminName(editableBookingData.assigned_to)
        } else if (!editableBookingData.assigned_to) {
          setAssignedAdminName('')
        }

        showSuccess('Booking details updated successfully!')
      }
    } catch (error) {
      console.error('Error saving booking:', error)
      showError('Failed to update booking details')
    }
  }

  // Cancel booking changes
  const handleCancelBookingChanges = () => {
    setEditableBookingData(initialBookingData)
  }

  // Passenger edit mode handlers
  const handleTogglePassengerEdit = () => {
    if (isEditingPassengers) {
      // Cancel edit mode
      setIsEditingPassengers(false)
      setEditedPassengerDetails(null)
    } else {
      // Enter edit mode - initialize with current passenger details
      const currentPassengerDetails = parseJsonField(
        booking.passenger_details,
        'passenger_details'
      )
      setEditedPassengerDetails(
        JSON.parse(JSON.stringify(currentPassengerDetails))
      ) // Deep copy
      setIsEditingPassengers(true)
    }
  }

  const handlePassengerFieldChange = (travelerIndex, field, value) => {
    setEditedPassengerDetails((prev) => {
      const updated = JSON.parse(JSON.stringify(prev)) // Deep copy
      const traveler = updated.travelers[travelerIndex]

      // Handle nested fields (e.g., 'name.firstName', 'documents[0].number')
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        traveler[parent] = { ...(traveler[parent] || {}), [child]: value }
      } else if (field.startsWith('documents[0]')) {
        const docField = field.replace('documents[0].', '')
        traveler.documents = traveler.documents || [{}]
        traveler.documents[0] = {
          ...(traveler.documents[0] || {}),
          [docField]: value,
        }
      } else {
        traveler[field] = value
      }

      return updated
    })
  }

  const handleSavePassengers = async () => {
    // Validate required fields
    for (let i = 0; i < editedPassengerDetails.travelers.length; i++) {
      const traveler = editedPassengerDetails.travelers[i]
      if (!traveler.name?.firstName || !traveler.name?.lastName) {
        showError(`Traveler ${i + 1}: First name and last name are required`)
        return
      }
      if (!traveler.type) {
        showError(`Traveler ${i + 1}: Traveler type is required`)
        return
      }
      if (!traveler.dateOfBirth) {
        showError(`Traveler ${i + 1}: Date of birth is required`)
        return
      }
    }

    setSavingPassengers(true)
    try {
      const response = await adminClient.put(`/flights/${booking.id}/edit`, {
        passenger_details: editedPassengerDetails,
      })

      if (response.data.success) {
        setBooking((prev) => ({
          ...prev,
          passenger_details: editedPassengerDetails,
          updated_at: new Date().toISOString(),
        }))
        setIsEditingPassengers(false)
        setEditedPassengerDetails(null)
        showSuccess('Passenger details updated successfully!')
      } else {
        showError('Failed to update passenger details')
      }
    } catch (error) {
      console.error('Error updating passenger details:', error)
      showError(
        error.response?.data?.error || 'Failed to update passenger details'
      )
    } finally {
      setSavingPassengers(false)
    }
  }

  // Send flight update email
  const handleSendFlightUpdate = async () => {
    if (!booking?.booking_reference) {
      showError('Booking reference not found')
      return
    }

    setSendingEmail(true)
    try {
      await adminClient.post('/flights/send-update', {
        booking_reference: booking.booking_reference,
      })
      showSuccess('Flight update email sent successfully!')
    } catch (error) {
      console.error('Error sending flight update email:', error)
      showError('Failed to send email. Please try again.')
    } finally {
      setSendingEmail(false)
    }
  }

  // Handle status change (auto-save)
  const handleStatusChange = async (newStatus) => {
    try {
      const response = await adminClient.put(`/flights/${booking.id}/edit`, {
        status: newStatus,
      })

      if (response.data.success) {
        setBooking((prev) => ({
          ...prev,
          status: newStatus,
          updated_at: new Date().toISOString(),
        }))
        showSuccess('Status updated successfully!')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      showError('Failed to update status')
    }
  }

  // Handle assignment change (auto-save)
  const handleAssignmentChange = async (field, value) => {
    try {
      const updateData = { [field]: value }

      const response = await adminClient.put(
        `/flights/${booking.id}/edit`,
        updateData
      )

      if (response.data.success) {
        setBooking((prev) => ({
          ...prev,
          [field]: value,
          updated_at: new Date().toISOString(),
        }))

        // Update assigned admin name if changed
        if (field === 'assigned_to' && value) {
          fetchAssignedAdminName(value)
        } else if (field === 'assigned_to' && !value) {
          setAssignedAdminName('')
        }

        showSuccess('Assignment updated successfully!')
      }
    } catch (error) {
      console.error('Error updating assignment:', error)
      showError('Failed to update assignment')
    }
  }

  // Copy booking reference to clipboard
  const handleCopyBookingReference = async () => {
    if (!booking?.booking_reference) {
      showError('No booking reference to copy')
      return
    }

    try {
      await navigator.clipboard.writeText(booking.booking_reference)
      showSuccess('Booking reference copied to clipboard!')
    } catch (error) {
      console.error('Error copying booking reference:', error)
      showError('Failed to copy booking reference')
    }
  }

  // Copy PNR to clipboard
  const handleCopyPNR = async () => {
    if (!booking?.pnr) {
      showError('No PNR to copy')
      return
    }

    try {
      await navigator.clipboard.writeText(booking.pnr)
      showSuccess('PNR copied to clipboard!')
    } catch (error) {
      console.error('Error copying PNR:', error)
      showError('Failed to copy PNR')
    }
  }

  // Status options
  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
    { value: 'PAID_PENDING_BOOKING', label: 'Paid Pending Booking' },
    { value: 'BOOKED', label: 'Booked' },
    { value: 'TICKETED', label: 'Ticketed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ]

  // Assignment status options
  const assignmentStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ]

  // Compact select styles for inline editing
  const compactSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '38px',
      fontSize: '14px',
      border: '1px solid #ced4da',
      borderRadius: '6px',
      boxShadow: 'none',
      '&:hover': {
        border: '1px solid #9ca3af',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 12px',
    }),
    input: (base) => ({
      ...base,
      margin: '0',
      padding: '0',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: '8px',
    }),
    menu: (base) => ({
      ...base,
      fontSize: '14px',
      zIndex: 1001,
    }),
  }

  // Fetch booking data
  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('flight_bookings')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          throw new Error('Failed to fetch booking details')
        }

        if (!data) {
          throw new Error('Booking not found')
        }

        setBooking(data)

        // Fetch assigned admin name if assigned_to exists
        if (data.assigned_to) {
          fetchAssignedAdminName(data.assigned_to)
        }

        setLoading(false)
      } catch (err) {
        console.error(err)
        setError(err.message)
        setLoading(false)
      }
    }

    if (id) {
      fetchBooking()
    }
  }, [id, jwt])

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'BOOKED':
      case 'PENDING_TICKETING':
        return 'status-confirmed'
      case 'TICKETED':
        return 'status-confirmed'
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return 'status-pending'
      case 'CANCELLED':
        return 'status-cancelled'
      default:
        return 'status-default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING_TICKETING':
      case 'TICKETED':
      case 'BOOKED':
        return <BsCheckCircle className='status-icon' />
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return <BsClock className='status-icon' />
      case 'CANCELLED':
        return <BsXCircle className='status-icon' />
      default:
        return <BsClock className='status-icon' />
    }
  }

  const handlePreview = async () => {
    if (!booking) return

    setPreviewLoading(true)
    try {
      const response = await adminClient.get(`/flights/${booking.id}/html`, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'text/html' })
      const url = URL.createObjectURL(blob)

      window.open(url, '_blank')

      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 10000)
    } catch (error) {
      console.error('Error opening preview:', error)
      showError('Failed to open preview. Please try again.')
    } finally {
      setPreviewLoading(false)
    }
  }

  // Admin cancellation with double confirmation
  const handleAdminCancellation = async () => {
    // First confirmation
    const firstConfirm = window.confirm(
      `⚠️ WARNING: You are about to cancel booking ${booking.booking_reference}.\n\n` +
        `This action will:\n` +
        `• Cancel the flight reservation with the airline\n` +
        `• Mark the booking as CANCELLED\n` +
        `• Send confirmation email to the customer\n` +
        `• NO REFUND will be issued (non-refundable policy)\n\n` +
        `Are you sure you want to proceed?`
    )

    if (!firstConfirm) return

    // Second confirmation
    const secondConfirm = window.confirm(
      `🚨 FINAL CONFIRMATION 🚨\n\n` +
        `You are about to PERMANENTLY CANCEL booking ${booking.booking_reference}.\n\n` +
        `This action CANNOT be undone!\n` +
        `The customer will NOT receive a refund.\n\n` +
        `Click OK to proceed with cancellation, or Cancel to abort.`
    )

    if (!secondConfirm) return

    // Get cancellation reason
    const reason = prompt(
      'Please provide a reason for cancellation (optional):\n\n' +
        'Examples: Customer request, Payment issue, Flight change, etc.'
    )

    setCancellationLoading(true)
    try {
      const response = await adminClient.post('/cancellation/cancel', {
        booking_reference: booking.booking_reference,
        cancellation_reason: reason || 'Cancelled by admin',
      })

      if (response.data.success) {
        showSuccess('Booking cancelled successfully')
        // Refresh booking data
        await fetchBooking()
      }
    } catch (error) {
      console.error('Cancellation error:', error)
      showError(error.response?.data?.error || 'Failed to cancel booking')
    } finally {
      setCancellationLoading(false)
    }
  }

  const canCancelBooking = () => {
    return [
      'PENDING_PAYMENT',
      'PAID_PENDING_BOOKING',
      'BOOKED',
      'PENDING_TICKETING',
    ].includes(booking?.status)
  }

  // const cancelBooking = async (reason) => {
  //     try {
  //         const response = await adminClient.put(
  //             `/flights/${booking.id}/cancel`,
  //             {
  //                 reason: reason || null,
  //             }
  //         )

  //         if (response.data.success) {
  //             // Update local state
  //             setBooking((prev) => ({
  //                 ...prev,
  //                 status: 'CANCELLED',
  //                 cancelled_at: new Date().toISOString(),
  //                 cancellation_reason: reason || null,
  //                 updated_at: new Date().toISOString(),
  //             }))

  //             alert('Booking cancelled successfully!')
  //         } else {
  //             alert('Failed to cancel booking')
  //         }
  //     } catch (error) {
  //         console.error('Error cancelling booking:', error)
  //         if (error.response?.data?.error) {
  //             alert(`Error: ${error.response.data.error}`)
  //         } else {
  //             alert('Error cancelling booking. Please try again.')
  //         }
  //     }
  // }

  const handlePrintReceipt = async () => {
    if (!booking) return

    setPrintLoading(true)
    try {
      // Use the new print route with mode=print
      const response = await adminClient.get(`/flights/${booking.id}/print`, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'text/html' })
      const url = URL.createObjectURL(blob)

      // Open in new tab with print dialog for PDF generation
      const newWindow = window.open(
        url,
        '_blank',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      )

      if (newWindow) {
        newWindow.onload = () => {
          // Wait for styles to load, then trigger print dialog
          setTimeout(() => {
            newWindow.print()
          }, 1000)
        }

        // Handle popup blockers
        newWindow.onerror = () => {
          // Fallback: create download link
          const link = document.createElement('a')
          link.href = url
          link.download = `Flight-Itinerary-${booking.booking_reference}.html`
          link.style.display = 'none'

          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } else {
        // Fallback: create download link
        const link = document.createElement('a')
        link.href = url
        link.download = `Flight-Itinerary-${booking.booking_reference}.html`
        link.style.display = 'none'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      // Clean up after longer delay
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 10000)
    } catch (error) {
      console.error('Error opening PDF for admin:', error)
      showError('Failed to open PDF receipt. Please try again.')
    } finally {
      setPrintLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='booking-detail'>
        <div className='booking-detail__loading'>
          <div className='loading-spinner'></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='booking-detail'>
        <div className='booking-detail__error'>
          <h2>Error</h2>
          <p>{error}</p>
          <button
            className='btn btn-primary'
            onClick={() => navigate('/admin/flights')}
          >
            Back to Flights
          </button>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className='booking-detail'>
        <div className='booking-detail__error'>
          <h2>Booking Not Found</h2>
          <p>The requested booking could not be found.</p>
          <button
            className='btn btn-primary'
            onClick={() => navigate('/admin/flights')}
          >
            Back to Flights
          </button>
        </div>
      </div>
    )
  }

  // Parse JSON fields - handle both string and object formats
  const parseJsonField = (field, fieldName = 'unknown') => {
    if (!field) return null
    if (typeof field === 'string') {
      try {
        return JSON.parse(field)
      } catch (e) {
        console.error(`Error parsing JSON field ${fieldName}:`, e)
        console.error('Field content:', field)
        return null
      }
    }
    return field
  }

  const flightOffer = parseJsonField(
    booking.amadeus_flight_offer,
    'amadeus_flight_offer'
  )
  const passengerDetails = parseJsonField(
    booking.passenger_details,
    'passenger_details'
  )
  const searchCriteria = parseJsonField(
    booking.search_criteria,
    'search_criteria'
  )
  const eTicketNumbers = parseJsonField(
    booking.e_ticket_numbers,
    'e_ticket_numbers'
  )

  return (
    <div className='booking-detail'>
      {/* Header */}
      <div className='booking-detail__header'>
        <div className='booking-detail__breadcrumb'>
          <Link
            to='/admin/flights'
            className='breadcrumb-link'
          >
            <BsArrowLeft /> Flights
          </Link>
          <span className='breadcrumb-separator'>/</span>
          <span className='breadcrumb-current'>Booking Details</span>
        </div>

        <div className='booking-detail__title'>
          <BsFillAirplaneFill className='title-icon' />
          <h1>Flight Booking Details</h1>
        </div>

        <div className='booking-detail__actions'>
          {/* Actions moved to banner */}
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={`booking-detail__status status-banner-grid ${getStatusColor(
          booking.status
        )}`}
      >
        {/* Left Column */}
        <div className='status-column status-column-left'>
          <div className='status-item'>
            <span className='status-label'>Booking Status:</span>
            <Select
              value={statusOptions.find((opt) => opt.value === booking.status)}
              onChange={(selected) => handleStatusChange(selected.value)}
              options={statusOptions}
              className='inline-dropdown-select'
              classNamePrefix='inline-dropdown'
              isSearchable={false}
              isDisabled={booking.status === 'CANCELLED'}
              styles={{
                control: (base) => ({
                  ...base,
                  border: 'none',
                  background: 'transparent',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  minHeight: 'auto',
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: '0',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'inherit',
                  fontWeight: '600',
                  fontSize: '18px',
                }),
                indicatorSeparator: () => ({
                  display: 'none',
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  padding: '0 4px',
                  color: 'inherit',
                }),
              }}
            />
          </div>
          <div className='status-item'>
            <span className='status-label'>Reference:</span>
            <span
              className='status-value pnr-copy'
              onClick={handleCopyBookingReference}
              title='Click to copy booking reference'
            >
              {booking.booking_reference}
              <BsClipboard className='copy-icon' />
            </span>
          </div>
          <div className='status-item'>
            <span className='status-label'>PNR:</span>
            <span
              className='status-value pnr-copy'
              onClick={handleCopyPNR}
              title='Click to copy PNR'
            >
              {booking.pnr || 'Not assigned'}
              {booking.pnr && <BsClipboard className='copy-icon' />}
            </span>
          </div>
          {booking.status === 'CANCELLED' && booking.cancelled_at && (
            <div className='status-item'>
              <span className='status-label'>Cancelled on:</span>
              <span className='status-value'>
                {formatDate(booking.cancelled_at)}
              </span>
            </div>
          )}
          {booking.cancellation_reason && (
            <div className='status-item'>
              <span className='status-label'>Reason:</span>
              <span className='status-value'>
                {booking.cancellation_reason}
              </span>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className='status-column status-column-right'>
          <div className='status-item'>
            <span className='status-label'>Assignment Status:</span>
            <Select
              value={assignmentStatusOptions.find(
                (opt) => opt.value === (booking.assignment_status || 'pending')
              )}
              onChange={(selected) =>
                handleAssignmentChange('assignment_status', selected.value)
              }
              options={assignmentStatusOptions}
              className='inline-dropdown-select'
              classNamePrefix='inline-dropdown'
              isSearchable={false}
              isDisabled={booking.status === 'CANCELLED'}
              styles={{
                control: (base) => ({
                  ...base,
                  border: 'none',
                  background: 'transparent',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  minHeight: 'auto',
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: '0',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'inherit',
                  fontWeight: '600',
                }),
                indicatorSeparator: () => ({
                  display: 'none',
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  padding: '0 4px',
                  color: 'inherit',
                }),
              }}
            />
          </div>
          <div className='status-item'>
            <span className='status-label'>Assigned to:</span>
            <Select
              value={
                adminOptions.find((opt) => opt.value === booking.assigned_to) ||
                null
              }
              onChange={(selected) =>
                handleAssignmentChange('assigned_to', selected?.value || null)
              }
              options={adminOptions}
              placeholder='Select staff'
              className='inline-dropdown-select'
              classNamePrefix='inline-dropdown'
              isSearchable={true}
              isClearable={true}
              isDisabled={booking.status === 'CANCELLED' || loadingAdmins}
              isLoading={loadingAdmins}
              styles={{
                control: (base) => ({
                  ...base,
                  border: 'none',
                  background: 'transparent',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  minHeight: 'auto',
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: '0',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'inherit',
                  fontWeight: '600',
                }),
                placeholder: (base) => ({
                  ...base,
                  color: 'inherit',
                  opacity: 0.7,
                }),
                indicatorSeparator: () => ({
                  display: 'none',
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  padding: '0 4px',
                  color: 'inherit',
                }),
              }}
            />
          </div>
          {booking.assigned_at && (
            <div className='status-item'>
              <span className='status-label'>Assigned on:</span>
              <span className='status-value'>
                {formatDate(booking.assigned_at)}
              </span>
            </div>
          )}
          <div className='status-item status-item-actions'>
            <button
              className='btn btn-info btn-sm'
              onClick={handleSendFlightUpdate}
              disabled={sendingEmail || !booking?.booking_reference}
            >
              {sendingEmail ? (
                <>
                  <div className='loading-spinner-small'></div>
                  Sending...
                </>
              ) : (
                <>
                  <BsEnvelope /> Send Email
                </>
              )}
            </button>
            <button
              className='btn btn-danger btn-sm'
              onClick={handleAdminCancellation}
              disabled={!canCancelBooking() || cancellationLoading}
              title={
                !canCancelBooking()
                  ? 'Booking cannot be cancelled'
                  : 'Cancel this booking'
              }
            >
              <BsXCircle />
              {cancellationLoading
                ? 'Cancelling...'
                : booking.status === 'CANCELLED'
                ? 'Cancelled'
                : 'Cancel Booking'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='booking-detail__tabs'>
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'passenger' ? 'active' : ''}`}
          onClick={() => setActiveTab('passenger')}
        >
          <BsPerson /> Passenger Details
        </button>
        <button
          className={`tab ${activeTab === 'flight' ? 'active' : ''}`}
          onClick={() => setActiveTab('flight')}
        >
          <BsFillAirplaneFill /> Flight Details
        </button>
        <button
          className={`tab ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          <BsCreditCard /> Payment
        </button>
        <button
          className={`tab ${activeTab === 'pdf' ? 'active' : ''}`}
          onClick={() => setActiveTab('pdf')}
        >
          <BsFileEarmarkPdf /> PDF Receipt
        </button>
      </div>

      {/* Tab Content */}
      <div className='booking-detail__content'>
        {activeTab === 'overview' && (
          <div className='tab-content'>
            <div className='overview-header'>
              <h3>
                <BsFillAirplaneFill /> Booking Overview
              </h3>
              <p>Complete summary of your flight booking details</p>
            </div>

            <div className='overview-grid'>
              <div className='overview-card'>
                <div className='card-header'>
                  <BsFillAirplaneFill className='card-icon' />
                  <h4>Flight Information</h4>
                </div>
                <div className='card-content'>
                  <div className='info-item'>
                    <span className='label'>Route:</span>
                    <span className='value route'>
                      {searchCriteria?.origin} → {searchCriteria?.destination}
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Departure:</span>
                    <span className='value'>
                      {searchCriteria?.outboundDeparture}
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Return:</span>
                    <span className='value'>
                      {searchCriteria?.inboundDeparture || 'One-way'}
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Passengers:</span>
                    <span className='value'>
                      {searchCriteria?.travelerCount?.adults || 0} Adult(s),
                      {searchCriteria?.travelerCount?.children || 0} Child(ren)
                    </span>
                  </div>
                </div>
              </div>

              <div className='overview-card'>
                <div className='card-header'>
                  <BsPerson className='card-icon' />
                  <h4>Passenger Summary</h4>
                </div>
                <div className='card-content'>
                  {passengerDetails?.travelers?.map((traveler, index) => (
                    <div
                      key={index}
                      className='passenger-item'
                    >
                      <div className='passenger-avatar'>
                        {traveler.name?.firstName?.charAt(0)}
                        {traveler.name?.lastName?.charAt(0)}
                      </div>
                      <div className='passenger-info'>
                        <div className='passenger-name'>
                          {traveler.name?.firstName} {traveler.name?.lastName}
                        </div>
                        <div className='passenger-type'>{traveler.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='overview-card'>
                <div className='card-header'>
                  <BsCreditCard className='card-icon' />
                  <h4>Payment Summary</h4>
                </div>
                <div className='card-content'>
                  <div className='info-item'>
                    <span className='label'>Total Amount:</span>
                    <span className='value amount'>
                      ₱{parseFloat(booking.total_amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Currency:</span>
                    <span className='value'>{booking.currency}</span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>PNR:</span>
                    <span className='value'>
                      {booking.pnr || 'Not assigned'}
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Status:</span>
                    <span
                      className={`value status ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status === 'TICKETED'
                        ? 'Confirmed'
                        : booking.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'passenger' && (
          <div className='tab-content'>
            <div className='passenger-header'>
              <h3>
                <BsPerson /> Passenger Details & Ticketing
              </h3>
              <p>Manage passenger information and e-ticket assignments</p>
            </div>

            <div className='passenger-details passenger-details--flight-detail bg-white'>
              {/* Passengers Table */}
              <div className='passenger-table-section'>
                <div className='section-header'>
                  <BsPerson className='section-icon' />
                  <h5>
                    All Passengers ({passengerDetails?.travelers?.length || 0})
                  </h5>
                  <div className='passenger-edit-actions'>
                    {!isEditingPassengers ? (
                      <button
                        className='btn btn-warning btn-sm'
                        onClick={handleTogglePassengerEdit}
                        disabled={booking.status === 'CANCELLED'}
                        title={
                          booking.status === 'CANCELLED'
                            ? 'Cannot edit cancelled booking'
                            : 'Edit passenger details'
                        }
                      >
                        <BsPencil /> Edit Passengers
                      </button>
                    ) : (
                      <>
                        <button
                          className='btn btn-success btn-sm'
                          onClick={handleSavePassengers}
                          disabled={savingPassengers}
                        >
                          {savingPassengers ? (
                            <>
                              <div className='loading-spinner-small'></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FiSave /> Save Changes
                            </>
                          )}
                        </button>
                        <button
                          className='btn btn-secondary btn-sm'
                          onClick={handleTogglePassengerEdit}
                          disabled={savingPassengers}
                        >
                          <BsX /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className='passenger-table-container'>
                  <table className='passenger-table'>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Gender</th>
                        <th>Date of Birth</th>
                        <th>Document No.</th>
                        <th>Nationality</th>
                        <th>E-Ticket Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Use editedPassengerDetails in edit mode, otherwise use booking data
                        const currentDetails = isEditingPassengers
                          ? editedPassengerDetails
                          : passengerDetails
                        return currentDetails?.travelers?.map(
                          (traveler, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>
                                {isEditingPassengers ? (
                                  <div className='edit-name-fields'>
                                    <input
                                      type='text'
                                      value={traveler.name?.firstName || ''}
                                      onChange={(e) =>
                                        handlePassengerFieldChange(
                                          index,
                                          'name.firstName',
                                          e.target.value
                                        )
                                      }
                                      className='edit-input'
                                      placeholder='First Name'
                                    />
                                    <input
                                      type='text'
                                      value={traveler.name?.lastName || ''}
                                      onChange={(e) =>
                                        handlePassengerFieldChange(
                                          index,
                                          'name.lastName',
                                          e.target.value
                                        )
                                      }
                                      className='edit-input'
                                      placeholder='Last Name'
                                    />
                                    {index === 0 && (
                                      <span className='lead-badge'>Lead</span>
                                    )}
                                  </div>
                                ) : (
                                  <div className='passenger-name'>
                                    <strong>
                                      {traveler.name?.firstName}{' '}
                                      {traveler.name?.lastName}
                                    </strong>
                                    {index === 0 && (
                                      <span className='lead-badge'>Lead</span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td>
                                {isEditingPassengers ? (
                                  <select
                                    value={traveler.type || 'ADULT'}
                                    onChange={(e) =>
                                      handlePassengerFieldChange(
                                        index,
                                        'type',
                                        e.target.value
                                      )
                                    }
                                    className='edit-select'
                                  >
                                    <option value='ADULT'>Adult</option>
                                    <option value='CHILD'>Child</option>
                                    <option value='INFANT'>Infant</option>
                                  </select>
                                ) : (
                                  <span
                                    className={`passenger-type ${traveler.type?.toLowerCase()}`}
                                  >
                                    {traveler.type}
                                  </span>
                                )}
                              </td>
                              <td>
                                {isEditingPassengers ? (
                                  <select
                                    value={traveler.gender || ''}
                                    onChange={(e) =>
                                      handlePassengerFieldChange(
                                        index,
                                        'gender',
                                        e.target.value
                                      )
                                    }
                                    className='edit-select'
                                  >
                                    <option value=''>Select</option>
                                    <option value='MALE'>Male</option>
                                    <option value='FEMALE'>Female</option>
                                  </select>
                                ) : (
                                  traveler.gender || '-'
                                )}
                              </td>
                              <td>
                                {isEditingPassengers ? (
                                  <Flatpickr
                                    value={
                                      traveler.dateOfBirth
                                        ? new Date(traveler.dateOfBirth)
                                        : null
                                    }
                                    onChange={([date]) =>
                                      handlePassengerFieldChange(
                                        index,
                                        'dateOfBirth',
                                        date
                                          ? date.toISOString().split('T')[0]
                                          : ''
                                      )
                                    }
                                    options={{
                                      maxDate: 'today',
                                      dateFormat: 'Y-m-d',
                                      disableMobile: true,
                                      closeOnSelect: true,
                                    }}
                                    className='edit-input'
                                    placeholder='YYYY-MM-DD'
                                  />
                                ) : traveler.dateOfBirth ? (
                                  new Date(
                                    traveler.dateOfBirth
                                  ).toLocaleDateString()
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td>
                                {isEditingPassengers ? (
                                  <input
                                    type='text'
                                    value={
                                      traveler.documents?.[0]?.number || ''
                                    }
                                    onChange={(e) =>
                                      handlePassengerFieldChange(
                                        index,
                                        'documents[0].number',
                                        e.target.value
                                      )
                                    }
                                    className='edit-input'
                                    placeholder='Document No.'
                                  />
                                ) : (
                                  traveler.documents?.[0]?.number || (
                                    <span className='no-data'>-</span>
                                  )
                                )}
                              </td>
                              <td>
                                {isEditingPassengers ? (
                                  <Select
                                    value={
                                      nationalityOptions.find(
                                        (opt) =>
                                          opt.value ===
                                          traveler.documents?.[0]?.nationality
                                      ) || null
                                    }
                                    onChange={(selected) =>
                                      handlePassengerFieldChange(
                                        index,
                                        'documents[0].nationality',
                                        selected?.value || ''
                                      )
                                    }
                                    options={nationalityOptions}
                                    placeholder='Select'
                                    className='edit-select-nationality'
                                    classNamePrefix='edit-select'
                                    isSearchable={true}
                                    styles={{
                                      control: (base) => ({
                                        ...base,
                                        minHeight: '32px',
                                        fontSize: '14px',
                                      }),
                                      menu: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                      }),
                                    }}
                                  />
                                ) : (
                                  traveler.documents?.[0]?.nationality || (
                                    <span className='no-data'>-</span>
                                  )
                                )}
                              </td>
                              <td>
                                <input
                                  type='text'
                                  value={ticketNumbers[index] || ''}
                                  onChange={(e) =>
                                    handleTicketNumberChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  placeholder={`Ticket for ${traveler.name?.firstName}`}
                                  className='ticket-input'
                                  maxLength={13}
                                  disabled={
                                    booking.status === 'CANCELLED' ||
                                    isEditingPassengers
                                  }
                                />
                              </td>
                            </tr>
                          )
                        )
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Save Tickets Button */}
                {hasTicketChanges && (
                  <div className='table-footer-actions'>
                    <div className='tickets-summary'>
                      {
                        Object.values(ticketNumbers).filter((t) => t?.trim())
                          .length
                      }{' '}
                      of {passengerDetails?.travelers?.length} tickets entered
                    </div>
                    <div className='action-buttons'>
                      <button
                        className='btn btn-success'
                        onClick={handleSaveTickets}
                        disabled={
                          booking.status === 'CANCELLED' || savingTickets
                        }
                      >
                        {savingTickets ? (
                          <>
                            <div className='loading-spinner-small'></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <BsCheckCircle /> Save Ticket Numbers
                          </>
                        )}
                      </button>
                      <button
                        className='btn btn-secondary'
                        onClick={handleResetTickets}
                        disabled={savingTickets}
                      >
                        <BsX /> Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Information Card */}
              <div className='contact-summary-card'>
                <div className='card-header'>
                  <BsEnvelope className='card-icon' />
                  <h5>Primary Contact</h5>
                </div>
                <div className='card-content'>
                  <div className='info-grid'>
                    <div className='info-item'>
                      <span className='label'>Email:</span>
                      <span className='value'>
                        <BsEnvelope />{' '}
                        {passengerDetails?.contacts?.[0]?.emailAddress || '-'}
                      </span>
                    </div>
                    <div className='info-item'>
                      <span className='label'>Phone:</span>
                      <span className='value'>
                        <BsTelephone /> +
                        {
                          passengerDetails?.contacts?.[0]?.phones?.[0]
                            ?.countryCallingCode
                        }{' '}
                        {passengerDetails?.contacts?.[0]?.phones?.[0]?.number ||
                          '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flight' && (
          <div className='tab-content'>
            <div className='flight-header'>
              <h3>
                <BsFillAirplaneFill /> Flight Details
              </h3>
              <p>Complete flight itinerary and pricing information</p>
            </div>

            <div className='flight-details'>
              {flightOffer?.itineraries?.map((itinerary, index) => (
                <div
                  key={index}
                  className='itinerary-card'
                >
                  <div className='itinerary-header'>
                    <div className='itinerary-title'>
                      <BsFillAirplaneFill className='itinerary-icon' />
                      <h4>
                        {index === 0 ? 'Outbound Flight' : 'Return Flight'}
                      </h4>
                    </div>
                    <div className='flight-date'>
                      {formatDate(itinerary.segments[0]?.departure?.at)}
                    </div>
                  </div>

                  {itinerary.segments?.map((segment, segIndex) => (
                    <div
                      key={segIndex}
                      className='segment-card'
                    >
                      <div className='segment-header'>
                        <div className='airline-info'>
                          <div className='airline-logo'>
                            <span className='airline-code'>
                              {segment.carrierCode}
                            </span>
                          </div>
                          <div className='flight-info'>
                            <span className='flight-number'>
                              {segment.number}
                            </span>
                            <span className='aircraft-info'>
                              Aircraft: {segment.aircraft?.code}
                            </span>
                          </div>
                        </div>
                        <div className='flight-status'>
                          <span className='status-badge'>
                            {segment.numberOfStops === 0
                              ? 'Direct'
                              : `${segment.numberOfStops} stop(s)`}
                          </span>
                        </div>
                      </div>

                      <div className='segment-route'>
                        <div className='airport-departure'>
                          <div className='airport-code'>
                            {segment.departure?.iataCode}
                          </div>
                          <div className='airport-name'>Departure</div>
                          <div className='airport-time'>
                            {formatTime(segment.departure?.at)}
                          </div>
                          <div className='airport-date'>
                            {formatDate(segment.departure?.at)}
                          </div>
                          <div className='airport-terminal'>
                            Terminal {segment.departure?.terminal}
                          </div>
                        </div>

                        <div className='flight-path'>
                          <div className='flight-duration'>
                            {segment.duration}
                          </div>
                          <div className='flight-arrow'>✈</div>
                        </div>

                        <div className='airport-arrival'>
                          <div className='airport-code'>
                            {segment.arrival?.iataCode}
                          </div>
                          <div className='airport-name'>Arrival</div>
                          <div className='airport-time'>
                            {formatTime(segment.arrival?.at)}
                          </div>
                          <div className='airport-date'>
                            {formatDate(segment.arrival?.at)}
                          </div>
                          <div className='airport-terminal'>
                            Terminal {segment.arrival?.terminal}
                          </div>
                        </div>
                      </div>

                      <div className='segment-details'>
                        <div className='detail-item'>
                          <span className='label'>Operating Carrier:</span>
                          <span className='value'>
                            {segment.operating?.carrierCode}
                          </span>
                        </div>
                        <div className='detail-item'>
                          <span className='label'>CO2 Emissions:</span>
                          <span className='value'>
                            {segment.co2Emissions?.[0]?.weight}{' '}
                            {segment.co2Emissions?.[0]?.weightUnit}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Pricing Information */}
              {flightOffer?.travelerPricings && (
                <div className='pricing-card'>
                  <div className='pricing-header'>
                    <BsCreditCard className='pricing-icon' />
                    <h4>Pricing Details</h4>
                  </div>
                  <div className='pricing-content'>
                    {flightOffer.travelerPricings.map((pricing, index) => (
                      <div
                        key={index}
                        className='pricing-item'
                      >
                        <div className='pricing-item-header'>
                          <span className='traveler-type'>
                            {pricing.travelerType}
                          </span>
                          <span className='fare-option'>
                            {pricing.fareOption}
                          </span>
                        </div>
                        <div className='pricing-breakdown'>
                          <div className='price-item'>
                            <span className='label'>Base Price:</span>
                            <span className='value'>
                              ₱
                              {parseFloat(
                                pricing.price?.base || 0
                              ).toLocaleString()}
                            </span>
                          </div>
                          {pricing.price?.taxes?.map((tax, taxIndex) => (
                            <div
                              key={taxIndex}
                              className='price-item'
                            >
                              <span className='label'>
                                Tax ({tax.code}
                                ):
                              </span>
                              <span className='value'>
                                ₱{parseFloat(tax.amount || 0).toLocaleString()}
                              </span>
                            </div>
                          ))}
                          <div className='price-item total'>
                            <span className='label'>Total:</span>
                            <span className='value'>
                              ₱
                              {parseFloat(
                                pricing.price?.total || 0
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className='tab-content'>
            <div className='payment-header'>
              <h3>
                <BsCreditCard /> Payment Information
              </h3>
              <p>Complete payment details and transaction information</p>
            </div>

            <div className='payment-details'>
              <div className='payment-card'>
                <div className='payment-card-header'>
                  <BsCreditCard className='payment-icon' />
                  <h4>Payment Summary</h4>
                </div>
                <div className='payment-content'>
                  <div className='info-grid'>
                    <div className='info-item'>
                      <span className='label'>Total Amount:</span>
                      <span className='value amount'>
                        ₱
                        {parseFloat(booking.total_amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className='info-item'>
                      <span className='label'>Currency:</span>
                      <span className='value'>{booking.currency}</span>
                    </div>
                    <div className='info-item'>
                      <span className='label'>Payment Status:</span>
                      <span
                        className={`value status ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div className='info-item'>
                      <span className='label'>Stripe Checkout ID:</span>
                      <span className='value'>
                        {booking.stripe_checkout_id || 'Not available'}
                      </span>
                    </div>
                    <div className='info-item'>
                      <span className='label'>Amadeus Order ID:</span>
                      <span className='value'>
                        {booking.amadeus_order_id || 'Not available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {eTicketNumbers && (
                <div className='ticket-card'>
                  <div className='ticket-header'>
                    <BsCheckCircle className='ticket-icon' />
                    <h4>E-Ticket Numbers</h4>
                  </div>
                  <div className='ticket-content'>
                    <div className='ticket-list'>
                      {eTicketNumbers.map((ticket, index) => (
                        <div
                          key={index}
                          className='ticket-item'
                        >
                          <div className='ticket-number'>{ticket}</div>
                          <div className='ticket-status'>Confirmed</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {flightOffer?.price && (
                <div className='price-breakdown-card'>
                  <div className='price-breakdown-header'>
                    <BsCalendar className='price-icon' />
                    <h4>Price Breakdown</h4>
                  </div>
                  <div className='price-breakdown-content'>
                    <div className='price-breakdown'>
                      <div className='price-item'>
                        <span className='label'>Base Price:</span>
                        <span className='value'>
                          ₱
                          {parseFloat(
                            flightOffer.price?.base || 0
                          ).toLocaleString()}
                        </span>
                      </div>
                      {flightOffer.price?.fees?.map((fee, index) => (
                        <div
                          key={index}
                          className='price-item'
                        >
                          <span className='label'>Fee ({fee.type}):</span>
                          <span className='value'>
                            ₱{parseFloat(fee.amount || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className='price-item total'>
                        <span className='label'>Grand Total:</span>
                        <span className='value'>
                          ₱
                          {parseFloat(
                            flightOffer.price?.grandTotal || 0
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'pdf' && (
          <div className='tab-content'>
            <div className='pdf-receipt'>
              <div className='pdf-header'>
                <h3>
                  <BsFileEarmarkPdf /> Flight Itinerary PDF
                </h3>
                <p>Download the official flight itinerary PDF receipt</p>
              </div>

              <div className='pdf-actions'>
                <div className='pdf-actions-group'>
                  <button
                    className='btn btn-info'
                    onClick={handlePreview}
                    disabled={previewLoading}
                  >
                    {previewLoading ? (
                      <>
                        <div className='loading-spinner-small'></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <BsEye /> Preview
                      </>
                    )}
                  </button>
                  <button
                    className='btn btn-success'
                    onClick={handlePrintReceipt}
                    disabled={printLoading}
                  >
                    {printLoading ? (
                      <>
                        <div className='loading-spinner-small'></div>
                        Opening...
                      </>
                    ) : (
                      <>
                        <BsPrinter /> Generate PDF
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className='pdf-info'>
                <h4>PDF Information</h4>
                <div className='info-grid'>
                  <div className='info-item'>
                    <span className='label'>Booking Reference:</span>
                    <span className='value'>{booking.booking_reference}</span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Status:</span>
                    <span
                      className={`value status ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status === 'TICKETED'
                        ? 'Confirmed'
                        : booking.status}
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>File Name:</span>
                    <span className='value'>
                      Flight-Itinerary-
                      {booking.booking_reference}.pdf
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Format:</span>
                    <span className='value'>Print-optimized PDF</span>
                  </div>
                </div>
              </div>

              <div className='pdf-notes'>
                <h4>Notes</h4>
                <ul>
                  <li>
                    The document contains the complete flight itinerary with all
                    passenger and flight details
                  </li>
                  <li>
                    This is the official admin receipt that can be used for
                    internal records and printing
                  </li>
                  <li>
                    Click "Generate PDF" to open a print dialog where you can
                    save as PDF
                  </li>
                  <li>
                    In the print dialog, select "Save as PDF" as the destination
                    to create a PDF file
                  </li>
                  <li>
                    Uncheck "Headers and Footers" in print options to remove
                    browser watermarks
                  </li>
                  <li>
                    Use the HTML preview to check the layout before generating
                    the PDF
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FlightBookingDetail
