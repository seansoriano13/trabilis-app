import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSnackbar } from '../../context/SnackbarContext'
import {
  FiMap,
  FiArrowLeft,
  FiUsers,
  FiCreditCard,
  FiCalendar,
  FiPhone,
  FiMail,
  FiPrinter,
  FiEdit,
  FiXCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiDownload,
  FiEye,
  FiPackage,
  FiDollarSign,
  FiFile,
  FiX,
  FiNavigation,
  FiSave,
} from 'react-icons/fi'
import {
  IoAirplaneOutline,
  IoCardOutline,
  IoPeopleOutline,
  IoCalendarOutline,
  IoTimeOutline,
} from 'react-icons/io5'
import { supabase } from '../../api/supabaseClient'
import adminClient from '../../api/adminClient'
import axios from 'axios'
import { BACKEND_URL } from '../../config'
import Select from 'react-select'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/airbnb.css'
import { getNationalityOptions } from '../../utils/nationalityMapping'
import VisaProcessingModal from '../../components/admin/VisaProcessingModal'
import TourBookingEditModal from '../../components/admin/TourBookingEditModal'
import './TourBookingDetail.css'

const TourBookingDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showSuccess, showError } = useSnackbar()
  const [booking, setBooking] = useState(null)
  const [packageDetails, setPackageDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [printLoading, setPrintLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [assignedAdminName, setAssignedAdminName] = useState('')

  // Visa Processing Modal State
  const [visaProcessingModal, setVisaProcessingModal] = useState({
    isOpen: false,
    passenger: null,
    passengerIndex: null,
  })

  // Visa Status Update State
  const [updatingVisaForPassenger, setUpdatingVisaForPassenger] = useState(null)
  const [editingVisaField, setEditingVisaField] = useState(null) // { passengerIndex: number, passenger: object }

  // Flight Data State
  const [flightData, setFlightData] = useState(null)
  const [flightLoading, setFlightLoading] = useState(false)

  // Passenger Edit Mode State
  const [isEditingPassengers, setIsEditingPassengers] = useState(false)
  const [editedPassengers, setEditedPassengers] = useState([])
  const [savingPassengers, setSavingPassengers] = useState(false)

  const jwt = localStorage.getItem('adminToken')
  const nationalityOptions = getNationalityOptions()

  // Set Supabase auth session
  useEffect(() => {
    if (jwt) {
      supabase.auth.setSession({ access_token: jwt })
    }
  }, [jwt])

  // Fetch flight data using flight booking reference
  const fetchFlightData = useCallback(async (flightReference) => {
    if (!flightReference) {
      setFlightData(null)
      return
    }

    setFlightLoading(true)
    try {
      const { data, error } = await supabase
        .from('flight_bookings')
        .select('*')
        .eq('booking_reference', flightReference)
        .single()

      if (error) {
        console.error('Error fetching flight data:', error)
        setFlightData(null)
        return
      }

      if (data) {
        setFlightData(data)
        console.log('Flight data fetched successfully:', data)

        // Debug flight offer structure
        if (data.amadeus_flight_offer) {
          const offer =
            typeof data.amadeus_flight_offer === 'string'
              ? JSON.parse(data.amadeus_flight_offer)
              : data.amadeus_flight_offer
          console.log('Flight offer structure:', offer)
          console.log(
            'Flight offer itineraries:',
            offer?.itineraries || offer?.flightOffers?.[0]?.itineraries
          )
        }
      } else {
        setFlightData(null)
      }
    } catch (error) {
      console.error('Error fetching flight data:', error)
      setFlightData(null)
    } finally {
      setFlightLoading(false)
    }
  }, [])

  // Fetch booking data function
  const fetchBooking = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
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
                        tour_packages (
                            id,
                            title,
                            visa_required,
                            destination_country
                        )
                    ),
                    visa_processings (
                        id,
                        passenger_index,
                        passenger_name,
                        status,
                        assigned_to,
                        assigned_at
                    )
                    )
                `
        )
        .eq('id', id)
        .single()

      if (error) {
        throw new Error('Failed to fetch booking details')
      }

      if (!data) {
        throw new Error('Booking not found')
      }

      setBooking(data)
      setPackageDetails(data.package_dates)

      // Fetch assigned admin name if assigned_to exists
      if (data.assigned_to) {
        fetchAssignedAdminName(data.assigned_to)
      }

      // Fetch flight data if flight booking reference exists
      if (data.flight_booking_reference) {
        fetchFlightData(data.flight_booking_reference)
      } else {
        setFlightData(null)
      }

      setLoading(false)
    } catch (err) {
      console.error(err)
      setError(err.message)
      setLoading(false)
    }
  }, [id, fetchFlightData])

  // Fetch booking data
  useEffect(() => {
    if (id) {
      fetchBooking()
    }
  }, [id, fetchBooking])

  const handleResendRatingEmail = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/ratings/resend/${id}`,
        {},
        { headers: { Authorization: `Bearer ${jwt}` } }
      )
      showSuccess('Rating email sent')
    } catch (error) {
      console.error('Resend rating email failed:', error)
      const msg = error.response?.data?.error || 'Failed to resend rating email'
      showError(msg)
    }
  }

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

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'status-confirmed'
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
      case 'CONFIRMED':
        return <FiCheckCircle className='status-icon' />
      case 'PENDING_PAYMENT':
        return <FiClock className='status-icon' />
      case 'CANCELLED':
        return <FiXCircle className='status-icon' />
      default:
        return <FiClock className='status-icon' />
    }
  }

  const handlePreview = async () => {
    if (!booking) return

    setPreviewLoading(true)
    try {
      // Use admin client with proper authentication for preview
      const response = await adminClient.get(`/tours/${booking.id}/html`, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'text/html' })
      const url = URL.createObjectURL(blob)

      // Open in new tab
      window.open(url, '_blank')

      // Clean up after a delay
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


  

  const handlePrintReceipt = async () => {
    if (!booking) return

    setPrintLoading(true)
    try {
      // Use the new print route with mode=print
      const response = await adminClient.get(`/tours/${booking.id}/print`, {
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
          link.download = `Tour-Booking-${booking.booking_reference}.html`
          link.style.display = 'none'

          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } else {
        // Fallback: create download link
        const link = document.createElement('a')
        link.href = url
        link.download = `Tour-Booking-${booking.booking_reference}.html`
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

  const handleEdit = () => {
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
  }

  const handleEditSubmit = async (submitData) => {
    try {
      const response = await adminClient.put(
        `/tours/${booking.id}/edit`,
        submitData
      )
      if (response.data.success) {
        setBooking((prev) => ({
          ...prev,
          ...submitData,
          updated_at: new Date().toISOString(),
        }))

        // Update flight data if flight_booking_reference changed
        if (
          submitData.flight_booking_reference !==
          booking.flight_booking_reference
        ) {
          if (submitData.flight_booking_reference) {
            fetchFlightData(submitData.flight_booking_reference)
          } else {
            setFlightData(null)
          }
        }

        if (
          submitData.assigned_to &&
          submitData.assigned_to !== booking.assigned_to
        ) {
          fetchAssignedAdminName(submitData.assigned_to)
        } else if (!submitData.assigned_to) {
          setAssignedAdminName('')
        }
        handleCloseEditModal()
        showSuccess('Booking updated successfully!')
        return true
      } else {
        showError('Failed to update booking')
        return false
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      if (error.response?.data?.error) {
        showError(`Error: ${error.response.data.error}`)
      } else {
        showError('Error updating booking. Please try again.')
      }
      throw error
    }
  }

  const handleVisaProcessing = (passenger, passengerIndex) => {
    setVisaProcessingModal({
      isOpen: true,
      passenger: passenger,
      passengerIndex: passengerIndex,
    })
  }

  const handleVisaProcessingClose = () => {
    setVisaProcessingModal({
      isOpen: false,
      passenger: null,
      passengerIndex: null,
    })
  }

  const handleVisaStatusUpdate = () => {
    // Refresh the booking data to show updated visa processing status
    fetchBooking()
  }

  // Passenger edit mode handlers
  const handleToggleEditMode = () => {
    if (isEditingPassengers) {
      // Cancel edit mode
      setIsEditingPassengers(false)
      setEditedPassengers([])
    } else {
      // Enter edit mode - initialize with current passengers
      const passengers =
        typeof booking.passenger_details === 'string'
          ? JSON.parse(booking.passenger_details)
          : booking.passenger_details || []
      setEditedPassengers(JSON.parse(JSON.stringify(passengers))) // Deep copy
      setIsEditingPassengers(true)
    }
  }

  const handlePassengerFieldChange = (index, field, value) => {
    setEditedPassengers((prev) => {
      const updated = [...prev]
      const passenger = { ...updated[index] }

      // Handle nested fields (e.g., 'name.firstName', 'documents[0].number')
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        passenger[parent] = { ...(passenger[parent] || {}), [child]: value }
      } else if (field.startsWith('documents[0]')) {
        const docField = field.replace('documents[0].', '')
        passenger.documents = passenger.documents || [{}]
        passenger.documents[0] = {
          ...(passenger.documents[0] || {}),
          [docField]: value,
        }
      } else if (field.startsWith('contact.')) {
        const contactField = field.replace('contact.', '')
        if (contactField.startsWith('phones[0]')) {
          const phoneField = contactField.replace('phones[0].', '')
          passenger.contact = passenger.contact || {}
          passenger.contact.phones = passenger.contact.phones || [{}]
          passenger.contact.phones[0] = {
            ...(passenger.contact.phones[0] || {}),
            [phoneField]: value,
          }
        } else {
          passenger.contact = {
            ...(passenger.contact || {}),
            [contactField]: value,
          }
        }
      } else {
        passenger[field] = value
      }

      updated[index] = passenger
      return updated
    })
  }

  const handleSavePassengers = async () => {
    // Validate required fields
    for (let i = 0; i < editedPassengers.length; i++) {
      const passenger = editedPassengers[i]
      if (!passenger.name?.firstName || !passenger.name?.lastName) {
        showError(`Passenger ${i + 1}: First name and last name are required`)
        return
      }
      if (!passenger.type) {
        showError(`Passenger ${i + 1}: Passenger type is required`)
        return
      }
    }

    setSavingPassengers(true)
    try {
      const response = await adminClient.put(`/tours/${booking.id}/edit`, {
        passenger_details: editedPassengers,
      })

      if (response.data.success) {
        setBooking((prev) => ({
          ...prev,
          passenger_details: editedPassengers,
          updated_at: new Date().toISOString(),
        }))
        setIsEditingPassengers(false)
        setEditedPassengers([])
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

  // Compact select styles for table cells
  const compactSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '40px',
      fontSize: '14px',
      border: '1px solid #d1d5db',
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
    option: (base) => ({
      ...base,
      padding: '12px',
      fontSize: '14px',
    }),
  }

  // Handle visa status change
  const handleVisaStatusChange = async (passengerIndex, field, value) => {
    setUpdatingVisaForPassenger(passengerIndex)

    try {
      // Get current passenger data
      const passengers =
        typeof booking.passenger_details === 'string'
          ? JSON.parse(booking.passenger_details)
          : booking.passenger_details

      const passenger = passengers[passengerIndex]

      // Build updated visa data object
      const updatedVisaData = {
        visa_status: field === 'visa_status' ? value : passenger.visa_status,
        visa_type: field === 'visa_type' ? value : passenger.visa_type,
        existing_visa_status:
          field === 'existing_visa_status'
            ? value
            : passenger.existing_visa_status,
        visa_expiry_date:
          field === 'visa_expiry_date' ? value : passenger.visa_expiry_date,
      }

      // Handle field dependencies
      if (field === 'visa_status' && value !== 'already_has') {
        updatedVisaData.visa_type = ''
        updatedVisaData.existing_visa_status = 'not_specified'
        updatedVisaData.visa_expiry_date = ''
      }

      if (
        field === 'existing_visa_status' &&
        value !== 'valid' &&
        value !== 'expiring_soon'
      ) {
        updatedVisaData.visa_expiry_date = ''
      }

      // Call backend API
      const response = await adminClient.put(
        `/tours/${booking.id}/passenger/${passengerIndex}/visa-status`,
        updatedVisaData
      )

      if (response.data.success) {
        // Update local state instead of reloading
        const updatedPassengers = [...passengers]
        updatedPassengers[passengerIndex] = {
          ...updatedPassengers[passengerIndex],
          ...updatedVisaData,
        }

        setBooking((prev) => ({
          ...prev,
          passenger_details: updatedPassengers,
          updated_at: new Date().toISOString(),
        }))

        showSuccess('Visa status updated successfully')
      } else {
        showError('Failed to update visa status')
      }
    } catch (error) {
      console.error('Error updating visa status:', error)
      showError('Failed to update visa status')
    } finally {
      setUpdatingVisaForPassenger(null)
    }
  }

  // const handleCancel = () => {
  //     if (booking.status === 'CANCELLED') {
  //         alert('This booking is already cancelled.')
  //         return
  //     }
  //     const reason = prompt('Please provide a reason for cancellation (optional):', '')
  //     if (window.confirm(`Are you sure you want to cancel this booking?\n\nBooking Reference: ${booking.booking_reference}\n${reason ? `Reason: ${reason}` : ''}`)) {
  //         cancelBooking(reason)
  //     }
  // }

  // const cancelBooking = async (reason) => {
  //     try {
  //         const response = await adminClient.put(`/tours/${booking.id}/cancel`, { reason: reason || null })
  //         if (response.data.success) {
  //             setBooking(prev => ({
  //                 ...prev,
  //                 status: 'CANCELLED',
  //                 cancelled_at: new Date().toISOString(),
  //                 cancellation_reason: reason || null,
  //                 updated_at: new Date().toISOString()
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

  if (loading) {
    return (
      <div className='tour-booking-detail'>
        <div className='tour-booking-detail__loading'>
          <div className='loading-spinner'></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='tour-booking-detail'>
        <div className='tour-booking-detail__error'>
          <h2>Error</h2>
          <p>{error}</p>
          <button
            className='btn btn-primary'
            onClick={() => navigate('/admin/tour-sales')}
          >
            Back to Tour Sales
          </button>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className='tour-booking-detail'>
        <div className='tour-booking-detail__error'>
          <h2>Booking Not Found</h2>
          <p>The requested booking could not be found.</p>
          <button
            className='btn btn-primary'
            onClick={() => navigate('/admin/tour-sales')}
          >
            Back to Tour Sales
          </button>
        </div>
      </div>
    )
  }

  const tourPackage = packageDetails?.tour_packages

  return (
    <div className='tour-booking-detail'>
      {/* Header */}
      <div className='tour-booking-detail__header'>
        <div className='tour-booking-detail__breadcrumb'>
          <Link
            to='/admin/tour-sales'
            className='breadcrumb-link'
          >
            <FiArrowLeft /> Tour Sales
          </Link>
          <span className='breadcrumb-separator'>/</span>
          <span className='breadcrumb-current'>Booking Details</span>
        </div>

        <div className='tour-booking-detail__title'>
          <FiMap className='title-icon' />
          <h1>Tour Booking Details</h1>
        </div>

        <div className='booking-detail__actions'>
          <button
            className='btn btn-warning'
            onClick={handleEdit}
            disabled={booking.status === 'CANCELLED'}
            title={
              booking.status === 'CANCELLED'
                ? 'Cannot edit cancelled booking'
                : 'Edit booking details'
            }
          >
            <FiEdit /> Edit
          </button>
          <button
            className='btn btn-secondary'
            onClick={handleResendRatingEmail}
            title='Send rating email to primary passenger'
          >
            <FiMail /> Send rating email
          </button>
          {/* <button 
                        className="btn btn-danger" 
                        onClick={handleCancel}
                        disabled={booking.status === 'CANCELLED'}
                    >
                        <FiXCircle /> {booking.status === 'CANCELLED' ? 'Cancelled' : 'Cancel'}
                    </button> */}
        </div>
      </div>

      {/* Clean Status Banner */}
      <div
        className={`booking-detail__status booking-detail__status--tour ${getStatusColor(
          booking.status
        )}`}
      >
        <div className='status-content'>
          {getStatusIcon(booking.status)}
          <div>
            <h3>Booking Status: {booking.status}</h3>
            <p>Reference: {booking.booking_reference}</p>
            {booking.status === 'CANCELLED' && booking.cancelled_at && (
              <p>Cancelled on: {formatDateTime(booking.cancelled_at)}</p>
            )}
            {booking.cancellation_reason && (
              <p>Reason: {booking.cancellation_reason}</p>
            )}
          </div>
        </div>

        {/* Assignment Status */}
        {booking.assignment_status && (
          <div className='assignment-status'>
            <div className='assignment-status__content'>
              <div className='assignment-status__icon'>
                {booking.assignment_status === 'completed' && <FiCheckCircle />}
                {booking.assignment_status === 'in_progress' && <FiClock />}
                {booking.assignment_status === 'pending' && <FiClock />}
              </div>
              <div className='assignment-status__details'>
                <h4>
                  Assignment Status:{' '}
                  {booking.assignment_status.charAt(0).toUpperCase() +
                    booking.assignment_status.slice(1).replace('_', ' ')}
                </h4>
                {booking.assigned_to && (
                  <p>Assigned to: {assignedAdminName || 'Loading...'}</p>
                )}
                {booking.assigned_at && (
                  <p>Assigned on: {formatDateTime(booking.assigned_at)}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visa Status Summary - Separate Section */}
      {tourPackage?.visa_required &&
        (() => {
          const passengers =
            typeof booking.passenger_details === 'string'
              ? JSON.parse(booking.passenger_details)
              : booking.passenger_details

          if (!passengers || passengers.length === 0) return null

          const visaStatusCounts = passengers.reduce((acc, passenger) => {
            const status = passenger.visa_status || 'not_applicable'
            acc[status] = (acc[status] || 0) + 1
            return acc
          }, {})

          const totalPassengers = passengers.length
          const needsProcessing = visaStatusCounts.needs_processing || 0
          const alreadyHas = visaStatusCounts.already_has || 0
          const notApplicable = visaStatusCounts.not_applicable || 0

          return (
            <div className='visa-status-section'>
              <div className='visa-status-section__header'>
                <FiFileText className='visa-status-icon' />
                <h3>Visa Status Summary</h3>
              </div>
              <div className='visa-status-section__content'>
                <div className='visa-status-stats'>
                  <div className='visa-stat-item'>
                    <span className='visa-stat-label'>Total Passengers</span>
                    <span className='visa-stat-value'>{totalPassengers}</span>
                  </div>
                  {needsProcessing > 0 && (
                    <div className='visa-stat-item'>
                      <span className='visa-stat-label'>Needs Processing</span>
                      <span className='visa-stat-value'>{needsProcessing}</span>
                    </div>
                  )}
                  {alreadyHas > 0 && (
                    <div className='visa-stat-item'>
                      <span className='visa-stat-label'>Has Visa</span>
                      <span className='visa-stat-value'>{alreadyHas}</span>
                    </div>
                  )}
                  {notApplicable > 0 && (
                    <div className='visa-stat-item'>
                      <span className='visa-stat-label'>Not Applicable</span>
                      <span className='visa-stat-value'>{notApplicable}</span>
                    </div>
                  )}
                </div>

                {/* Visa Processing Progress */}
                {needsProcessing > 0 &&
                  (() => {
                    const processingRecords = booking.visa_processings || []
                    const completedCount = processingRecords.filter(
                      (vp) => vp.status === 'APPROVED'
                    ).length
                    const inProgressCount = processingRecords.filter(
                      (vp) => vp.status === 'IN_PROGRESS'
                    ).length
                    const pendingCount = processingRecords.filter(
                      (vp) => vp.status === 'PENDING'
                    ).length

                    return (
                      <div className='visa-processing-progress'>
                        <div className='visa-progress-header'>
                          <span className='visa-progress-title'>
                            Processing Progress
                          </span>
                          <span className='visa-progress-count'>
                            {completedCount}/{needsProcessing} completed
                          </span>
                        </div>
                        <div className='visa-progress-bar'>
                          <div
                            className='visa-progress-fill'
                            style={{
                              width: `${
                                (completedCount / needsProcessing) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className='visa-progress-details'>
                          {completedCount > 0 && (
                            <span className='visa-progress-item'>
                              <FiCheckCircle /> {completedCount} completed
                            </span>
                          )}
                          {inProgressCount > 0 && (
                            <span className='visa-progress-item'>
                              <FiClock /> {inProgressCount} in progress
                            </span>
                          )}
                          {pendingCount > 0 && (
                            <span className='visa-progress-item'>
                              <FiClock /> {pendingCount} pending
                            </span>
                          )}
                        </div>

                        {/* Visa Processing References */}
                        {processingRecords.length > 0 && (
                          <div className='visa-processing-references'>
                            <div className='visa-references-header'>
                              <FiFileText className='visa-ref-icon' />
                              <span className='visa-ref-title'>
                                Processing References
                              </span>
                            </div>
                            <div className='visa-references-list'>
                              {processingRecords.map((vp, idx) => (
                                <Link
                                  key={idx}
                                  to={`/admin/visa-inquiries/${vp.id}`}
                                  className='visa-reference-item'
                                  title={`View visa processing for ${vp.passenger_name}`}
                                >
                                  <div className='visa-ref-content'>
                                    <span className='visa-ref-passenger'>
                                      {vp.passenger_name}
                                    </span>
                                    <span
                                      className={`visa-ref-status visa-ref-status--${vp.status.toLowerCase()}`}
                                    >
                                      {vp.status}
                                    </span>
                                  </div>
                                  <FiNavigation className='visa-ref-arrow' />
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
              </div>
            </div>
          )
        })()}

      {/* Tabs */}
      <div className='tour-booking-detail__tabs'>
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'package' ? 'active' : ''}`}
          onClick={() => setActiveTab('package')}
        >
          <FiPackage /> Package Details
        </button>
        <button
          className={`tab ${activeTab === 'passenger' ? 'active' : ''}`}
          onClick={() => setActiveTab('passenger')}
        >
          <FiUsers /> Passenger Details
        </button>
        <button
          className={`tab ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          <FiCreditCard /> Payment
        </button>
        <button
          className={`tab ${activeTab === 'flights' ? 'active' : ''}`}
          onClick={() => setActiveTab('flights')}
        >
          <FiNavigation /> Flights
        </button>
        <button
          className={`tab ${activeTab === 'pdf' ? 'active' : ''}`}
          onClick={() => setActiveTab('pdf')}
        >
          <FiFile /> PDF Receipt
        </button>
      </div>

      {/* Tab Content */}
      <div className='tour-booking-detail__content'>
        {activeTab === 'overview' && (
          <div className='tab-content'>
            <div className='overview-header'>
              <h3>
                <FiMap /> Booking Overview
              </h3>
              <p>Complete summary of your tour booking details</p>
            </div>

            <div className='overview-grid'>
              <div className='overview-card'>
                <div className='card-header'>
                  <FiPackage className='card-icon' />
                  <h4>Tour Package</h4>
                </div>
                <div className='card-content'>
                  <div className='info-item'>
                    <span className='label'>Package:</span>
                    <span className='value'>
                      {tourPackage?.title || 'Unknown'}
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Duration:</span>
                    <span className='value'>
                      {packageDetails?.start_date && packageDetails?.end_date
                        ? Math.ceil(
                            (new Date(packageDetails.end_date) -
                              new Date(packageDetails.start_date)) /
                              (1000 * 60 * 60 * 24)
                          ) + 1
                        : 'N/A'}{' '}
                      days
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Start Date:</span>
                    <span className='value'>
                      {formatDate(packageDetails?.start_date)}
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>End Date:</span>
                    <span className='value'>
                      {formatDate(packageDetails?.end_date)}
                    </span>
                  </div>
                </div>
              </div>

              <div className='overview-card'>
                <div className='card-header'>
                  <FiUsers className='card-icon' />
                  <h4>Passenger Summary</h4>
                </div>
                <div className='card-content'>
                  <div className='info-item'>
                    <span className='label'>Lead Contact:</span>
                    <span className='value'>
                      {booking.lead_first_name} {booking.lead_last_name}
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Email:</span>
                    <span className='value'>{booking.lead_email}</span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Phone:</span>
                    <span className='value'>{booking.lead_phone}</span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Passenger Count:</span>
                    <span className='value'>
                      {booking.passenger_count} person(s)
                    </span>
                  </div>
                </div>
              </div>

              <div className='overview-card'>
                <div className='card-header'>
                  <FiCreditCard className='card-icon' />
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
                    <span className='label'>Reservation Amount:</span>
                    <span className='value'>
                      ₱
                      {parseFloat(
                        booking.reservation_amount || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Payment Type:</span>
                    <span className='value'>{booking.payment_type}</span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>Status:</span>
                    <span
                      className={`value status ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'package' && (
          <div className='tab-content'>
            <div className='package-header'>
              <h3>
                <FiPackage /> Package Details
              </h3>
              <p>Complete tour package information and itinerary</p>
            </div>

            <div className='package-details'>
              {tourPackage && (
                <div className='package-card'>
                  <div className='package-card-header'>
                    <FiPackage className='package-icon' />
                    <h4>{tourPackage.title}</h4>
                  </div>
                  <div className='package-content'>
                    <div className='package-info'>
                      <div className='info-section'>
                        <div className='section-header'>
                          <FiCalendar className='section-icon' />
                          <h5>Package Information</h5>
                        </div>
                        <div className='info-grid'>
                          <div className='info-item'>
                            <span className='label'>Duration:</span>
                            <span className='value'>
                              {packageDetails?.start_date &&
                              packageDetails?.end_date
                                ? Math.ceil(
                                    (new Date(packageDetails.end_date) -
                                      new Date(packageDetails.start_date)) /
                                      (1000 * 60 * 60 * 24)
                                  ) + 1
                                : 'N/A'}{' '}
                              days
                            </span>
                          </div>
                          <div className='info-item'>
                            <span className='label'>Available Slots:</span>
                            <span className='value'>
                              {packageDetails?.total_slots || 0} slots
                            </span>
                          </div>
                          <div className='info-item'>
                            <span className='label'>Package Price:</span>
                            <span className='value'>
                              ₱
                              {parseFloat(
                                booking.total_amount /
                                  booking.passenger_count || 0
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* <div className="info-section">
                                                <div className="section-header">
                                                    <FiFileText className="section-icon" />
                                                    <h5>Package Information</h5>
                                                </div>
                                                <div className="description-content">
                                                    <p>Package details are not available in the current database schema. Please contact the administrator for more information about this tour package.</p>
                                                </div>
                                            </div> */}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'passenger' && (
          <div className='tab-content'>
            <div className='passenger-header'>
              <h3>
                <FiUsers /> Passenger Details
              </h3>
              <p>Complete passenger information for all travelers</p>
            </div>

            <div className='passenger-details passenger-details--tour-detail bg-white'>
              {/* All Passengers Table */}
              <div className='passenger-table-section'>
                <div className='section-header'>
                  <FiUsers className='section-icon' />
                  <h5>All Passengers ({booking.passenger_count})</h5>
                  <div className='passenger-edit-actions'>
                    {!isEditingPassengers ? (
                      <button
                        className='btn btn-warning btn-sm'
                        onClick={handleToggleEditMode}
                        disabled={booking.status === 'CANCELLED'}
                        title={
                          booking.status === 'CANCELLED'
                            ? 'Cannot edit cancelled booking'
                            : 'Edit passenger details'
                        }
                      >
                        <FiEdit /> Edit Passengers
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
                          onClick={handleToggleEditMode}
                          disabled={savingPassengers}
                        >
                          <FiX /> Cancel
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
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Date of Birth</th>
                        <th>Document No.</th>
                        <th>Nationality</th>
                        <th>Expiry</th>
                        <th>Passenger Visa Status</th>
                        {tourPackage?.visa_required && (
                          <th>Processing Status</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Use editedPassengers in edit mode, otherwise use booking data
                        let passengers = []
                        if (isEditingPassengers) {
                          passengers = editedPassengers
                        } else {
                          try {
                            if (booking.passenger_details) {
                              passengers =
                                typeof booking.passenger_details === 'string'
                                  ? JSON.parse(booking.passenger_details)
                                  : booking.passenger_details
                            }
                          } catch (error) {
                            console.error(
                              'Error parsing passenger details:',
                              error
                            )
                            passengers = []
                          }
                        }

                        if (passengers && passengers.length > 0) {
                          return passengers.map((passenger, index) => {
                            const doc =
                              Array.isArray(passenger.documents) &&
                              passenger.documents.length > 0
                                ? passenger.documents[0]
                                : null
                            const phoneObj = passenger.contact?.phones?.[0]
                            const phoneStr = phoneObj?.number
                              ? `${phoneObj.countryCallingCode || ''} ${
                                  phoneObj.number
                                }`
                              : null
                            return (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                  {isEditingPassengers ? (
                                    <div className='edit-name-fields'>
                                      <input
                                        type='text'
                                        value={passenger.name?.firstName || ''}
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
                                        value={passenger.name?.lastName || ''}
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
                                        {passenger.name?.firstName || ''}{' '}
                                        {passenger.name?.lastName || ''}
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
                                      value={passenger.type || 'Adult'}
                                      onChange={(e) =>
                                        handlePassengerFieldChange(
                                          index,
                                          'type',
                                          e.target.value
                                        )
                                      }
                                      className='edit-select'
                                    >
                                      <option value='Adult'>Adult</option>
                                      <option value='Child'>Child</option>
                                      <option value='Infant'>Infant</option>
                                    </select>
                                  ) : (
                                    <span
                                      className={`passenger-type ${
                                        passenger.type?.toLowerCase() || 'adult'
                                      }`}
                                    >
                                      {passenger.type || 'Adult'}
                                    </span>
                                  )}
                                </td>
                                <td>
                                  {isEditingPassengers ? (
                                    <select
                                      value={passenger.gender || ''}
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
                                    passenger.gender || (
                                      <span className='no-data'>-</span>
                                    )
                                  )}
                                </td>
                                <td>
                                  {isEditingPassengers ? (
                                    <input
                                      type='email'
                                      value={
                                        passenger.contact?.emailAddress || ''
                                      }
                                      onChange={(e) =>
                                        handlePassengerFieldChange(
                                          index,
                                          'contact.emailAddress',
                                          e.target.value
                                        )
                                      }
                                      className='edit-input'
                                      placeholder='email@example.com'
                                    />
                                  ) : passenger.contact?.emailAddress ? (
                                    <a
                                      href={`mailto:${passenger.contact.emailAddress}`}
                                      className='email-link'
                                    >
                                      <FiMail />{' '}
                                      {passenger.contact.emailAddress}
                                    </a>
                                  ) : (
                                    <span className='no-data'>-</span>
                                  )}
                                </td>
                                <td>
                                  {isEditingPassengers ? (
                                    <input
                                      type='tel'
                                      value={phoneObj?.number || ''}
                                      onChange={(e) =>
                                        handlePassengerFieldChange(
                                          index,
                                          'contact.phones[0].number',
                                          e.target.value
                                        )
                                      }
                                      className='edit-input'
                                      placeholder='9123456789'
                                    />
                                  ) : phoneStr ? (
                                    <a
                                      href={`tel:${
                                        phoneObj?.countryCallingCode || ''
                                      }${phoneObj?.number || ''}`}
                                      className='phone-link'
                                    >
                                      <FiPhone /> {phoneStr}
                                    </a>
                                  ) : (
                                    <span className='no-data'>-</span>
                                  )}
                                </td>
                                <td>
                                  {isEditingPassengers ? (
                                    <Flatpickr
                                      value={
                                        passenger.dateOfBirth
                                          ? new Date(passenger.dateOfBirth)
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
                                  ) : passenger.dateOfBirth ? (
                                    <span className='date-of-birth'>
                                      {new Date(
                                        passenger.dateOfBirth
                                      ).toLocaleDateString()}
                                    </span>
                                  ) : (
                                    <span className='no-data'>-</span>
                                  )}
                                </td>
                                <td>
                                  {isEditingPassengers ? (
                                    <input
                                      type='text'
                                      value={doc?.number || ''}
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
                                    doc?.number || (
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
                                            opt.value === doc?.nationality
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
                                    doc?.nationality || (
                                      <span className='no-data'>-</span>
                                    )
                                  )}
                                </td>
                                <td>
                                  {isEditingPassengers ? (
                                    <Flatpickr
                                      value={
                                        doc?.expiryDate
                                          ? new Date(doc.expiryDate)
                                          : null
                                      }
                                      onChange={([date]) =>
                                        handlePassengerFieldChange(
                                          index,
                                          'documents[0].expiryDate',
                                          date
                                            ? date.toISOString().split('T')[0]
                                            : ''
                                        )
                                      }
                                      options={{
                                        minDate: 'today',
                                        dateFormat: 'Y-m-d',
                                        disableMobile: true,
                                        closeOnSelect: true,
                                      }}
                                      className='edit-input'
                                      placeholder='YYYY-MM-DD'
                                    />
                                  ) : doc?.expiryDate ? (
                                    new Date(
                                      doc.expiryDate
                                    ).toLocaleDateString()
                                  ) : (
                                    <span className='no-data'>-</span>
                                  )}
                                </td>
                                <td>
                                  <div className='visa-status-cell'>
                                    {tourPackage?.visa_required ? (
                                      <div className='visa-status-container'>
                                        <span
                                          className={`visa-status-badge visa-status--${
                                            passenger.visa_status ||
                                            'visa_required'
                                          } visa-badge-clickable`}
                                          onClick={() =>
                                            setEditingVisaField({
                                              passengerIndex: index,
                                              passenger: passenger,
                                            })
                                          }
                                          title='Click to edit visa details'
                                        >
                                          {passenger.visa_status ===
                                          'needs_processing'
                                            ? 'Needs Processing'
                                            : passenger.visa_status ===
                                              'already_has'
                                            ? 'Has Visa'
                                            : 'Visa Required'}
                                        </span>
                                        {passenger.visa_status ===
                                          'already_has' &&
                                          passenger.visa_expiry_date && (
                                            <div className='visa-expiry-info'>
                                              <span className='visa-expiry-label'>
                                                Expires:
                                              </span>
                                              <span
                                                className={`visa-expiry-date ${
                                                  passenger.existing_visa_status ===
                                                  'expired'
                                                    ? 'expired'
                                                    : passenger.existing_visa_status ===
                                                      'expiring_soon'
                                                    ? 'expiring-soon'
                                                    : 'valid'
                                                }`}
                                              >
                                                {new Date(
                                                  passenger.visa_expiry_date
                                                ).toLocaleDateString()}
                                              </span>
                                            </div>
                                          )}
                                      </div>
                                    ) : (
                                      <span className='visa-status-badge visa-status--not_applicable'>
                                        Not Applicable
                                      </span>
                                    )}
                                  </div>
                                </td>
                                {tourPackage?.visa_required && (
                                  <td>
                                    <div className='processing-status-cell'>
                                      {(() => {
                                        const visaProcessing =
                                          booking.visa_processings?.find(
                                            (vp) => vp.passenger_index === index
                                          )
                                        if (visaProcessing) {
                                          return (
                                            <>
                                              <span
                                                className={`processing-status-badge processing-status--${visaProcessing.status.toLowerCase()}`}
                                              >
                                                {visaProcessing.status}
                                              </span>
                                              <button
                                                className='visa-process-btn'
                                                onClick={() =>
                                                  handleVisaProcessing(
                                                    passenger,
                                                    index
                                                  )
                                                }
                                                title='Manage Visa Processing'
                                              >
                                                Manage
                                              </button>
                                            </>
                                          )
                                        } else if (
                                          passenger.visa_status ===
                                          'needs_processing'
                                        ) {
                                          return (
                                            <button
                                              className='visa-process-btn'
                                              onClick={() =>
                                                handleVisaProcessing(
                                                  passenger,
                                                  index
                                                )
                                              }
                                              title='Start Visa Processing'
                                            >
                                              Start Processing
                                            </button>
                                          )
                                        } else {
                                          return (
                                            <span className='no-data'>-</span>
                                          )
                                        }
                                      })()}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            )
                          })
                        } else {
                          // Fallback to lead passenger only
                          return (
                            <tr>
                              <td>1</td>
                              <td>
                                <div className='passenger-name'>
                                  <strong>
                                    {booking.lead_first_name}{' '}
                                    {booking.lead_last_name}
                                  </strong>
                                  <span className='lead-badge'>Lead</span>
                                </div>
                              </td>
                              <td>
                                <span className='passenger-type adult'>
                                  Lead Passenger
                                </span>
                              </td>
                              <td>
                                <span className='no-data'>-</span>
                              </td>
                              <td>
                                <a
                                  href={`mailto:${booking.lead_email}`}
                                  className='email-link'
                                >
                                  <FiMail /> {booking.lead_email}
                                </a>
                              </td>
                              <td>
                                <a
                                  href={`tel:${booking.lead_phone}`}
                                  className='phone-link'
                                >
                                  <FiPhone /> {booking.lead_phone}
                                </a>
                              </td>
                              <td>
                                <span className='no-data'>-</span>
                              </td>
                              <td>
                                <span className='no-data'>-</span>
                              </td>
                              <td>
                                <span className='no-data'>-</span>
                              </td>
                              <td>
                                <span className='no-data'>-</span>
                              </td>
                              <td>
                                <span className='visa-status-badge visa-status--not_applicable'>
                                  Not Applicable
                                </span>
                              </td>
                              {tourPackage?.visa_required && (
                                <td>
                                  <span className='no-data'>-</span>
                                </td>
                              )}
                            </tr>
                          )
                        }
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lead Contact Summary */}
              <div className='lead-contact-summary'>
                <div className='passenger-card'>
                  <div className='passenger-card-header'>
                    <div className='passenger-avatar-large'>
                      {booking.lead_first_name?.charAt(0)}
                      {booking.lead_last_name?.charAt(0)}
                    </div>
                    <div className='passenger-title'>
                      <h4>Lead Contact</h4>
                      <p>
                        {booking.lead_first_name} {booking.lead_last_name}
                      </p>
                    </div>
                  </div>

                  <div className='passenger-sections'>
                    <div className='info-section'>
                      <div className='section-header'>
                        <FiUsers className='section-icon' />
                        <h5>Contact Information</h5>
                      </div>
                      <div className='info-grid'>
                        <div className='info-item'>
                          <span className='label'>Full Name:</span>
                          <span className='value'>
                            {booking.lead_first_name} {booking.lead_last_name}
                          </span>
                        </div>
                        <div className='info-item'>
                          <span className='label'>Email:</span>
                          <span className='value'>
                            <FiMail /> {booking.lead_email}
                          </span>
                        </div>
                        <div className='info-item'>
                          <span className='label'>Phone:</span>
                          <span className='value'>
                            <FiPhone /> {booking.lead_phone}
                          </span>
                        </div>
                        <div className='info-item'>
                          <span className='label'>Passenger Count:</span>
                          <span className='value'>
                            <FiUsers /> {booking.passenger_count} person(s)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className='tab-content'>
            <div className='payment-header'>
              <h3>
                <FiCreditCard /> Payment Information
              </h3>
              <p>Complete payment details and transaction information</p>
            </div>

            <div className='payment-details'>
              <div className='payment-card'>
                <div className='payment-card-header'>
                  <FiCreditCard className='payment-icon' />
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
                      <span className='label'>Reservation Amount:</span>
                      <span className='value'>
                        ₱
                        {parseFloat(
                          booking.reservation_amount || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className='info-item'>
                      <span className='label'>Payment Type:</span>
                      <span className='value'>{booking.payment_type}</span>
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
                      <span
                        className='value stripe-id'
                        title={booking.stripe_checkout_id || 'Not available'}
                      >
                        {booking.stripe_checkout_id
                          ? `${booking.stripe_checkout_id.substring(0, 20)}...`
                          : 'Not available'}
                      </span>
                    </div>
                    <div className='info-item'>
                      <span className='label'>Booking Reference:</span>
                      <span className='value'>{booking.booking_reference}</span>
                    </div>
                    <div className='info-item'>
                      <span className='label'>Created At:</span>
                      <span className='value'>
                        {formatDateTime(booking.created_at)}
                      </span>
                    </div>
                    <div className='info-item'>
                      <span className='label'>Updated At:</span>
                      <span className='value'>
                        {formatDateTime(booking.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className='price-breakdown-card'>
                <div className='price-breakdown-header'>
                  <FiDollarSign className='price-icon' />
                  <h4>Price Breakdown</h4>
                </div>
                <div className='price-breakdown-content'>
                  <div className='price-breakdown'>
                    <div className='price-item'>
                      <span className='label'>Price per Person:</span>
                      <span className='value'>
                        ₱
                        {parseFloat(
                          booking.total_amount / booking.passenger_count || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className='price-item'>
                      <span className='label'>Number of Passengers:</span>
                      <span className='value'>{booking.passenger_count}</span>
                    </div>
                    <div className='price-item'>
                      <span className='label'>Subtotal:</span>
                      <span className='value'>
                        ₱
                        {parseFloat(booking.total_amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className='price-item total'>
                      <span className='label'>Total Amount:</span>
                      <span className='value'>
                        ₱
                        {parseFloat(booking.total_amount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flights' && (
          <div className='tab-content'>
            <div className='flight-header'>
              <h3>
                <FiNavigation /> Flight Information
              </h3>
              <p>Linked flight booking details and itinerary</p>
            </div>

            <div className='flight-details'>
              {flightLoading ? (
                <div className='flight-loading'>
                  <div className='loading-spinner'></div>
                  <p>Loading flight details...</p>
                </div>
              ) : flightData ? (
                <div className='flight-card'>
                  <div className='flight-card__header'>
                    <div className='flight-card__main'>
                      <div className='flight-card__icon'>
                        <FiNavigation className='flight-icon' />
                        <div className='flight-card__status-indicator'></div>
                      </div>
                      <div className='flight-card__title'>
                        <h4>Flight Booking: {flightData.booking_reference}</h4>
                      </div>
                    </div>
                    <div
                      className={`flight-card__status ${getStatusColor(
                        flightData.status
                      )}`}
                    >
                      {flightData.status === 'PENDING_TICKETING'
                        ? 'Confirmed'
                        : flightData.status === 'CONFIRMED'
                        ? 'Confirmed'
                        : flightData.status === 'PENDING'
                        ? 'Pending'
                        : flightData.status === 'CANCELLED'
                        ? 'Cancelled'
                        : flightData.status}
                    </div>
                  </div>

                  <div className='flight-card__content'>
                    {/* Quick Stats Grid */}
                    <div className='flight-stats'>
                      <div className='stat-item'>
                        <div className='stat-icon'>
                          <FiDollarSign />
                        </div>
                        <div className='stat-content'>
                          <span className='stat-label'>Total Amount</span>
                          <span className='stat-value'>
                            ₱
                            {parseFloat(
                              flightData.total_amount || 0
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className='stat-item'>
                        <div className='stat-icon'>
                          <IoCardOutline />
                        </div>
                        <div className='stat-content'>
                          <span className='stat-label'>PNR</span>
                          <span className='stat-value'>
                            {flightData.pnr || 'Not assigned'}
                          </span>
                        </div>
                      </div>
                      <div className='stat-item'>
                        <div className='stat-icon'>
                          <FiDollarSign />
                        </div>
                        <div className='stat-content'>
                          <span className='stat-label'>Currency</span>
                          <span className='stat-value'>
                            {flightData.currency}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Route Information */}
                    {flightData.search_criteria && (
                      <div className='flight-route'>
                        <div className='section-header'>
                          <h5>
                            <IoAirplaneOutline /> Route Information
                          </h5>
                        </div>
                        <div className='route-card'>
                          <div className='route-path'>
                            <div className='airport'>
                              <div className='airport-code'>
                                {flightData.search_criteria.origin}
                              </div>
                              <div className='airport-label'>Origin</div>
                            </div>
                            <div className='route-arrow'>
                              <div className='arrow-line'></div>
                              <div className='arrow-head'></div>
                            </div>
                            <div className='airport'>
                              <div className='airport-code'>
                                {flightData.search_criteria.destination}
                              </div>
                              <div className='airport-label'>Destination</div>
                            </div>
                          </div>
                          <div className='route-dates'>
                            <div className='date-item'>
                              <span className='date-label'>Departure</span>
                              <span className='date-value'>
                                {flightData.search_criteria.outboundDeparture}
                              </span>
                            </div>
                            <div className='date-item'>
                              <span className='date-label'>Return</span>
                              <span className='date-value'>
                                {flightData.search_criteria.inboundDeparture ||
                                  'One-way'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Flight Itineraries */}
                    {flightData.amadeus_flight_offer &&
                      (() => {
                        try {
                          const amadeusOffer =
                            typeof flightData.amadeus_flight_offer === 'string'
                              ? JSON.parse(flightData.amadeus_flight_offer)
                              : flightData.amadeus_flight_offer

                          // Check if it's the correct structure with flightOffers array
                          const flightOffers =
                            amadeusOffer?.flightOffers || amadeusOffer
                          const itineraries =
                            flightOffers?.[0]?.itineraries ||
                            amadeusOffer?.itineraries

                          console.log(
                            'Frontend - Found itineraries:',
                            itineraries?.length
                          )
                          console.log(
                            'Frontend - Itinerary details:',
                            itineraries?.map((it) => ({
                              hasSegments: it.segments?.length > 0,
                              segmentCount: it.segments?.length || 0,
                              duration: it.duration,
                            }))
                          )

                          if (itineraries && itineraries.length > 0) {
                            return (
                              <div className='flight-itineraries'>
                                <div className='section-header'>
                                  <h5>
                                    <IoAirplaneOutline /> Flight Details
                                  </h5>
                                </div>
                                <div className='itineraries-container'>
                                  {itineraries.map((itinerary, index) => (
                                    <div
                                      key={index}
                                      className='itinerary-card'
                                    >
                                      <div className='itinerary-header'>
                                        <h6>
                                          {index === 0
                                            ? 'Outbound Flight'
                                            : 'Return Flight'}
                                        </h6>
                                        <div className='itinerary-duration'>
                                          <IoTimeOutline />
                                          {itinerary.duration ||
                                            itinerary.segments?.[0]?.duration ||
                                            'N/A'}
                                        </div>
                                      </div>
                                      <div className='segments-container'>
                                        {itinerary.segments.map(
                                          (segment, segIndex) => {
                                            console.log(
                                              `Frontend - Segment ${segIndex}:`,
                                              {
                                                id: segment.id,
                                                number: segment.number,
                                                carrierCode:
                                                  segment.carrierCode,
                                                departure: segment.departure,
                                                arrival: segment.arrival,
                                                duration: segment.duration,
                                                aircraft: segment.aircraft,
                                              }
                                            )
                                            return (
                                              <div
                                                key={segIndex}
                                                className='segment-card'
                                              >
                                                <div className='segment-route'>
                                                  <div className='segment-airport'>
                                                    <div className='airport-code'>
                                                      {
                                                        segment.departure
                                                          ?.iataCode
                                                      }
                                                    </div>
                                                    <div className='airport-time'>
                                                      {segment.departure?.at
                                                        ? new Date(
                                                            segment.departure.at
                                                          ).toLocaleTimeString(
                                                            'en-US',
                                                            {
                                                              hour: '2-digit',
                                                              minute: '2-digit',
                                                              hour12: false,
                                                            }
                                                          )
                                                        : 'N/A'}
                                                    </div>
                                                    <div className='airport-date'>
                                                      {segment.departure?.at
                                                        ? new Date(
                                                            segment.departure.at
                                                          ).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                              month: 'short',
                                                              day: 'numeric',
                                                            }
                                                          )
                                                        : 'N/A'}
                                                    </div>
                                                  </div>
                                                  <div className='segment-flight'>
                                                    <div className='flight-line'></div>
                                                    <div className='flight-info'>
                                                      <div className='airline'>
                                                        {segment.carrierCode}{' '}
                                                        {segment.number}
                                                      </div>
                                                      <div className='aircraft'>
                                                        {segment.aircraft
                                                          ?.code || 'N/A'}
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className='segment-airport'>
                                                    <div className='airport-code'>
                                                      {
                                                        segment.arrival
                                                          ?.iataCode
                                                      }
                                                    </div>
                                                    <div className='airport-time'>
                                                      {segment.arrival?.at
                                                        ? new Date(
                                                            segment.arrival.at
                                                          ).toLocaleTimeString(
                                                            'en-US',
                                                            {
                                                              hour: '2-digit',
                                                              minute: '2-digit',
                                                              hour12: false,
                                                            }
                                                          )
                                                        : 'N/A'}
                                                    </div>
                                                    <div className='airport-date'>
                                                      {segment.arrival?.at
                                                        ? new Date(
                                                            segment.arrival.at
                                                          ).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                              month: 'short',
                                                              day: 'numeric',
                                                            }
                                                          )
                                                        : 'N/A'}
                                                    </div>
                                                  </div>
                                                </div>
                                                {segment.numberOfStops > 0 && (
                                                  <div className='segment-stops'>
                                                    <span className='stops-badge'>
                                                      {segment.numberOfStops}{' '}
                                                      stop
                                                      {segment.numberOfStops !==
                                                      1
                                                        ? 's'
                                                        : ''}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          }
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          }
                          return null
                        } catch (error) {
                          console.error('Error parsing flight offer:', error)
                          return null
                        }
                      })()}

                    {/* Passenger Information */}
                    {flightData.search_criteria?.travelerCount && (
                      <div className='flight-passengers'>
                        <div className='section-header'>
                          <h5>
                            <IoPeopleOutline /> Passengers
                          </h5>
                        </div>
                        <div className='passenger-card'>
                          <div className='passenger-count'>
                            <div className='passenger-item'>
                              <span className='passenger-icon'>
                                <FiUsers />
                              </span>
                              <span className='passenger-text'>
                                {flightData.search_criteria.travelerCount
                                  .adults || 0}{' '}
                                Adult
                                {(flightData.search_criteria.travelerCount
                                  .adults || 0) !== 1
                                  ? 's'
                                  : ''}
                              </span>
                            </div>
                            <div className='passenger-item'>
                              <span className='passenger-icon'>
                                <FiUsers />
                              </span>
                              <span className='passenger-text'>
                                {flightData.search_criteria.travelerCount
                                  .children || 0}{' '}
                                Child
                                {(flightData.search_criteria.travelerCount
                                  .children || 0) !== 1
                                  ? 'ren'
                                  : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className='flight-actions'>
                      <button
                        className='btn btn-primary btn-modern'
                        onClick={() =>
                          navigate(`/admin/flights/${flightData.id}`)
                        }
                      >
                        <FiEye /> View Full Flight Details
                      </button>
                      <button
                        className='btn btn-secondary btn-modern'
                        onClick={() => setShowEditModal(true)}
                      >
                        <FiEdit /> Edit Flight Link
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='flight-empty'>
                  <div className='flight-empty__icon'>
                    <FiNavigation className='empty-icon' />
                    <div className='flight-empty__pulse'></div>
                  </div>
                  <div className='flight-empty__content'>
                    <h4>No Flight Linked Yet</h4>
                    <p className='flight-empty__description'>
                      This tour booking doesn't have an associated flight
                      booking.
                    </p>
                    <div className='flight-empty__steps'>
                      <div className='step'>
                        <div className='step__number'>1</div>
                        <span>
                          Create a flight booking to get a TRB-FLT reference
                        </span>
                      </div>
                      <div className='step'>
                        <div className='step__number'>2</div>
                        <span>Click Edit and paste the flight reference</span>
                      </div>
                      <div className='step'>
                        <div className='step__number'>3</div>
                        <span>
                          Flight details will appear here automatically
                        </span>
                      </div>
                    </div>
                    <div className='flight-empty__actions'>
                      <button
                        className='btn btn-primary'
                        onClick={() => setShowEditModal(true)}
                      >
                        <FiEdit /> Link Flight Booking
                      </button>
                      <button
                        className='btn btn-secondary'
                        onClick={() => navigate('/admin/flights')}
                      >
                        <FiNavigation /> View All Flights
                      </button>
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
                  <FiFile /> Tour Booking PDF
                </h3>
                <p>Download the official tour booking PDF receipt</p>
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
                        <FiEye /> Preview
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
                        <FiPrinter /> Generate PDF
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
                      {booking.status}
                    </span>
                  </div>
                  <div className='info-item'>
                    <span className='label'>File Name:</span>
                    <span className='value'>
                      Tour-Booking-
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
                    The document contains the complete tour booking details with
                    all passenger and package information
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
      {/* Edit Modal */}
      <TourBookingEditModal
        isOpen={showEditModal}
        booking={booking}
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        context='detail'
      />

      {/* Visa Processing Modal */}
      <VisaProcessingModal
        isOpen={visaProcessingModal.isOpen}
        onClose={handleVisaProcessingClose}
        passenger={visaProcessingModal.passenger}
        passengerIndex={visaProcessingModal.passengerIndex}
        bookingId={id}
        onStatusUpdate={handleVisaStatusUpdate}
      />

      {/* Visa Status Edit Modal */}
      {editingVisaField &&
        (() => {
          // Get current passenger data from the updated booking state
          const passengers =
            typeof booking.passenger_details === 'string'
              ? JSON.parse(booking.passenger_details)
              : booking.passenger_details
          const currentPassenger = passengers[editingVisaField.passengerIndex]

          return (
            <div
              className='modal-overlay'
              onClick={() => setEditingVisaField(null)}
            >
              <div
                className='modal-content'
                onClick={(e) => e.stopPropagation()}
              >
                <div className='modal-header'>
                  <h3>Edit Visa Status</h3>
                  <button
                    className='modal-close-btn'
                    onClick={() => setEditingVisaField(null)}
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <div className='modal-body'>
                  <div className='form-group'>
                    <label>Visa Status:</label>
                    <Select
                      value={{
                        value: currentPassenger.visa_status || 'not_applicable',
                        label:
                          currentPassenger.visa_status === 'needs_processing'
                            ? 'Needs Processing'
                            : currentPassenger.visa_status === 'already_has'
                            ? 'Has Visa'
                            : 'Not Applicable',
                      }}
                      options={[
                        {
                          value: 'not_applicable',
                          label: 'Not Applicable',
                        },
                        {
                          value: 'already_has',
                          label: 'Has Visa',
                        },
                        {
                          value: 'needs_processing',
                          label: 'Needs Processing',
                        },
                      ]}
                      onChange={(selected) =>
                        handleVisaStatusChange(
                          editingVisaField.passengerIndex,
                          'visa_status',
                          selected.value
                        )
                      }
                      isDisabled={
                        updatingVisaForPassenger ===
                        editingVisaField.passengerIndex
                      }
                      styles={compactSelectStyles}
                    />
                  </div>

                  {/* Visa type dropdown - only show if visa_status === 'already_has' */}
                  {currentPassenger.visa_status === 'already_has' && (
                    <div className='form-group'>
                      <label>Visa Type:</label>
                      <Select
                        value={{
                          value: currentPassenger.visa_type || '',
                          label:
                            currentPassenger.visa_type || 'Select Visa Type',
                        }}
                        options={[
                          {
                            value: 'Tourist Visa',
                            label: 'Tourist Visa',
                          },
                          {
                            value: 'Business Visa',
                            label: 'Business Visa',
                          },
                          {
                            value: 'Student Visa',
                            label: 'Student Visa',
                          },
                          {
                            value: 'Fiancee Visa',
                            label: 'Fiancee Visa',
                          },
                          {
                            value: 'Spousal Visa',
                            label: 'Spousal Visa',
                          },
                        ]}
                        onChange={(selected) =>
                          handleVisaStatusChange(
                            editingVisaField.passengerIndex,
                            'visa_type',
                            selected.value
                          )
                        }
                        isDisabled={
                          updatingVisaForPassenger ===
                          editingVisaField.passengerIndex
                        }
                        styles={compactSelectStyles}
                        placeholder='Select Visa Type'
                      />
                    </div>
                  )}

                  {/* Existing visa status dropdown - only show if visa_status === 'already_has' */}
                  {currentPassenger.visa_status === 'already_has' && (
                    <div className='form-group'>
                      <label>Existing Visa Status:</label>
                      <Select
                        value={{
                          value:
                            currentPassenger.existing_visa_status ||
                            'not_specified',
                          label:
                            currentPassenger.existing_visa_status === 'valid'
                              ? 'Valid'
                              : currentPassenger.existing_visa_status ===
                                'expiring_soon'
                              ? 'Expiring Soon'
                              : currentPassenger.existing_visa_status ===
                                'expired'
                              ? 'Expired'
                              : 'Not Specified',
                        }}
                        options={[
                          {
                            value: 'valid',
                            label: 'Valid',
                          },
                          {
                            value: 'expiring_soon',
                            label: 'Expiring Soon',
                          },
                          {
                            value: 'expired',
                            label: 'Expired',
                          },
                          {
                            value: 'not_specified',
                            label: 'Not Specified',
                          },
                        ]}
                        onChange={(selected) =>
                          handleVisaStatusChange(
                            editingVisaField.passengerIndex,
                            'existing_visa_status',
                            selected.value
                          )
                        }
                        isDisabled={
                          updatingVisaForPassenger ===
                          editingVisaField.passengerIndex
                        }
                        styles={compactSelectStyles}
                      />
                    </div>
                  )}

                  {/* Visa expiry date - only show if existing_visa_status is 'valid' or 'expiring_soon' */}
                  {currentPassenger.visa_status === 'already_has' &&
                    (currentPassenger.existing_visa_status === 'valid' ||
                      currentPassenger.existing_visa_status ===
                        'expiring_soon') && (
                      <div className='form-group'>
                        <label>Visa Expiry Date:</label>
                        <input
                          type='date'
                          value={currentPassenger.visa_expiry_date || ''}
                          onChange={(e) =>
                            handleVisaStatusChange(
                              editingVisaField.passengerIndex,
                              'visa_expiry_date',
                              e.target.value
                            )
                          }
                          disabled={
                            updatingVisaForPassenger ===
                            editingVisaField.passengerIndex
                          }
                          className='form-input'
                        />
                      </div>
                    )}
                </div>
                <div className='modal-footer'>
                  <button
                    className='btn btn-secondary'
                    onClick={() => setEditingVisaField(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )
        })()}
    </div>
  )
}

export default TourBookingDetail
