import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
} from 'react-icons/bs'
import Select from 'react-select'
import { supabase } from '../../api/supabaseClient'
import adminClient from '../../api/adminClient'
import './FlightBookingDetail.css'
// import axios from 'axios'

const FlightBookingDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [booking, setBooking] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('overview')
    const [printLoading, setPrintLoading] = useState(false)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editLoading, setEditLoading] = useState(false)
    const [editForm, setEditForm] = useState({
        status: '',
        pnr: '',
        e_ticket_numbers: '',
        assigned_to: '',
        assignment_status: 'pending',
    })
    const [adminOptions, setAdminOptions] = useState([])
    const [loadingAdmins, setLoadingAdmins] = useState(false)
    const [assignedAdminName, setAssignedAdminName] = useState('')

    // Status options for dropdown
    const statusOptions = [
        { value: 'PENDING', label: 'Pending', color: '#ffc107' },
        {
            value: 'PENDING_PAYMENT',
            label: 'Pending Payment',
            color: '#fd7e14',
        },
        { value: 'TICKETED', label: 'Confirmed', color: '#28a745' },
        { value: 'CANCELLED', label: 'Cancelled', color: '#dc3545' },
    ]

    // Assignment status options
    const assignmentStatusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
    ]

    const jwt = localStorage.getItem('adminToken')

    // Set Supabase auth session
    useEffect(() => {
        if (jwt) {
            supabase.auth.setSession({ access_token: jwt })
        }
    }, [jwt])

    // Fetch admin options for assignment dropdown
    const fetchAdminOptions = async () => {
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
    }

    // Fetch assigned admin name
    const fetchAssignedAdminName = async (adminId) => {
        if (!adminId) return
        try {
            const response = await adminClient.get('/appointments/all-staff')
            if (response.data.success) {
                const admin = response.data.data.find((a) => a.id === adminId)
                if (admin) {
                    setAssignedAdminName(
                        `${admin.first_name} ${admin.last_name}`
                    )
                }
            }
        } catch (error) {
            console.error('Error fetching assigned admin name:', error)
        }
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
            case 'TICKETED':
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
            const response = await adminClient.get(
                `/flights/${booking.id}/html`,
                { responseType: 'blob' }
            )

            const blob = new Blob([response.data], { type: 'text/html' })
            const url = URL.createObjectURL(blob)

            window.open(url, '_blank')

            setTimeout(() => {
                URL.revokeObjectURL(url)
            }, 10000)
        } catch (error) {
            console.error('Error opening preview:', error)
            alert('Failed to open preview. Please try again.')
        } finally {
            setPreviewLoading(false)
        }
    }

    const handleEdit = async () => {
        // Fetch admin options first
        await fetchAdminOptions()

        // Populate form with current booking data
        setEditForm({
            status: booking.status,
            pnr: booking.pnr || '',
            e_ticket_numbers: Array.isArray(booking.e_ticket_numbers)
                ? booking.e_ticket_numbers.join(', ')
                : booking.e_ticket_numbers || '',
            assigned_to: booking.assigned_to || '',
            assignment_status: booking.assignment_status || 'pending',
        })
        setShowEditModal(true)
    }

    const handleCloseEditModal = () => {
        setShowEditModal(false)
        setEditForm({
            status: '',
            pnr: '',
            e_ticket_numbers: '',
            assigned_to: '',
            assignment_status: 'pending',
        })
    }

    const handleEditFormChange = (field, value) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        setEditLoading(true)

        try {
            // Prepare data for submission
            const submitData = {
                status: editForm.status,
                pnr: editForm.pnr || null,
                assigned_to: editForm.assigned_to || null,
                assignment_status: editForm.assignment_status,
            }

            // Handle e_ticket_numbers - convert string back to array if needed
            if (editForm.e_ticket_numbers) {
                submitData.e_ticket_numbers = editForm.e_ticket_numbers
                    .split(',')
                    .map((ticket) => ticket.trim())
                    .filter((ticket) => ticket.length > 0)
            }

            const response = await adminClient.put(
                `/flights/${booking.id}/edit`,
                submitData
            )

            if (response.data.success) {
                // Update local state
                setBooking((prev) => ({
                    ...prev,
                    ...submitData,
                    e_ticket_numbers:
                        submitData.e_ticket_numbers || prev.e_ticket_numbers,
                    updated_at: new Date().toISOString(),
                }))

                // Update assigned admin name if assignment changed
                if (
                    submitData.assigned_to &&
                    submitData.assigned_to !== booking.assigned_to
                ) {
                    fetchAssignedAdminName(submitData.assigned_to)
                } else if (!submitData.assigned_to) {
                    setAssignedAdminName('')
                }

                handleCloseEditModal()
                alert('Booking updated successfully!')
            } else {
                alert('Failed to update booking')
            }
        } catch (error) {
            console.error('Error updating booking:', error)
            if (error.response?.data?.error) {
                alert(`Error: ${error.response.data.error}`)
            } else {
                alert('Error updating booking. Please try again.')
            }
        } finally {
            setEditLoading(false)
        }
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
            const response = await adminClient.get(
                `/flights/${booking.id}/print`,
                {
                    responseType: 'blob',
                }
            )

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
            alert('Failed to open PDF receipt. Please try again.')
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
                        <BsPencil />{' '}
                        {booking.status === 'CANCELLED'
                            ? 'Cannot edit cancelled booking'
                            : 'Edit booking details'}
                    </button>
                    {/* <button 
                        className="btn btn-danger" 
                        onClick={handleCancel}
                        disabled={booking.status === 'CANCELLED' || booking.status === 'TICKETED'}
                        title={
                            booking.status === 'CANCELLED' ? 'Booking already cancelled' :
                            booking.status === 'TICKETED' ? 'Cannot cancel ticketed booking' :
                            'Cancel this booking'
                        }
                    >
                        <BsXCircle /> 
                        {booking.status === 'CANCELLED' ? 'Cancelled' : 'Cancel'}
                    </button> */}
                </div>
            </div>

            {/* Status Banner */}
            <div
                className={`booking-detail__status ${getStatusColor(
                    booking.status
                )}`}
            >
                <div className='status-content'>
                    {getStatusIcon(booking.status)}
                    <div>
                        <h3>
                            Booking Status:{' '}
                            {booking.status === 'TICKETED'
                                ? 'Confirmed'
                                : booking.status}
                        </h3>
                        <p>Reference: {booking.booking_reference}</p>
                        {booking.status === 'CANCELLED' &&
                            booking.cancelled_at && (
                                <p>
                                    Cancelled on:{' '}
                                    {formatDate(booking.cancelled_at)}
                                </p>
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
                                {booking.assignment_status === 'completed' && (
                                    <BsCheckCircle />
                                )}
                                {booking.assignment_status ===
                                    'in_progress' && <BsClock />}
                                {booking.assignment_status === 'pending' && (
                                    <BsClock />
                                )}
                            </div>
                            <div className='assignment-status__details'>
                                <h4>
                                    Assignment Status:{' '}
                                    {booking.assignment_status
                                        .charAt(0)
                                        .toUpperCase() +
                                        booking.assignment_status
                                            .slice(1)
                                            .replace('_', ' ')}
                                </h4>
                                {booking.assigned_to && (
                                    <p>
                                        Assigned to:{' '}
                                        {assignedAdminName || 'Loading...'}
                                    </p>
                                )}
                                {booking.assigned_at && (
                                    <p>
                                        Assigned on:{' '}
                                        {formatDate(booking.assigned_at)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className='booking-detail__tabs'>
                <button
                    className={`tab ${
                        activeTab === 'overview' ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`tab ${
                        activeTab === 'passenger' ? 'active' : ''
                    }`}
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
                            <p>
                                Complete summary of your flight booking details
                            </p>
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
                                            {searchCriteria?.origin} →{' '}
                                            {searchCriteria?.destination}
                                        </span>
                                    </div>
                                    <div className='info-item'>
                                        <span className='label'>
                                            Departure:
                                        </span>
                                        <span className='value'>
                                            {searchCriteria?.outboundDeparture}
                                        </span>
                                    </div>
                                    <div className='info-item'>
                                        <span className='label'>Return:</span>
                                        <span className='value'>
                                            {searchCriteria?.inboundDeparture ||
                                                'One-way'}
                                        </span>
                                    </div>
                                    <div className='info-item'>
                                        <span className='label'>
                                            Passengers:
                                        </span>
                                        <span className='value'>
                                            {searchCriteria?.travelerCount
                                                ?.adults || 0}{' '}
                                            Adult(s),
                                            {searchCriteria?.travelerCount
                                                ?.children || 0}{' '}
                                            Child(ren)
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
                                    {passengerDetails?.travelers?.map(
                                        (traveler, index) => (
                                            <div
                                                key={index}
                                                className='passenger-item'
                                            >
                                                <div className='passenger-avatar'>
                                                    {traveler.name?.firstName?.charAt(
                                                        0
                                                    )}
                                                    {traveler.name?.lastName?.charAt(
                                                        0
                                                    )}
                                                </div>
                                                <div className='passenger-info'>
                                                    <div className='passenger-name'>
                                                        {
                                                            traveler.name
                                                                ?.firstName
                                                        }{' '}
                                                        {
                                                            traveler.name
                                                                ?.lastName
                                                        }
                                                    </div>
                                                    <div className='passenger-type'>
                                                        {traveler.type}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className='overview-card'>
                                <div className='card-header'>
                                    <BsCreditCard className='card-icon' />
                                    <h4>Payment Summary</h4>
                                </div>
                                <div className='card-content'>
                                    <div className='info-item'>
                                        <span className='label'>
                                            Total Amount:
                                        </span>
                                        <span className='value amount'>
                                            ₱
                                            {parseFloat(
                                                booking.total_amount || 0
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className='info-item'>
                                        <span className='label'>Currency:</span>
                                        <span className='value'>
                                            {booking.currency}
                                        </span>
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
                                <BsPerson /> Passenger Details
                            </h3>
                            <p>
                                Complete passenger information and travel
                                documents
                            </p>
                        </div>

                        <div className='passenger-details passenger-details-flight'>
                            {passengerDetails?.travelers?.map(
                                (traveler, index) => (
                                    <div
                                        key={index}
                                        className='passenger-card'
                                    >
                                        <div className='passenger-card-header'>
                                            <div className='passenger-avatar-large'>
                                                {traveler.name?.firstName?.charAt(
                                                    0
                                                )}
                                                {traveler.name?.lastName?.charAt(
                                                    0
                                                )}
                                            </div>
                                            <div className='passenger-title'>
                                                <h4>Passenger {index + 1}</h4>
                                                <p>
                                                    {traveler.name?.firstName}{' '}
                                                    {traveler.name?.lastName}
                                                </p>
                                            </div>
                                        </div>

                                        <div className='passenger-sections'>
                                            <div className='info-section'>
                                                <div className='section-header'>
                                                    <BsPerson className='section-icon' />
                                                    <h5>
                                                        Personal Information
                                                    </h5>
                                                </div>
                                                <div className='info-grid'>
                                                    <div className='info-item'>
                                                        <span className='label'>
                                                            Full Name:
                                                        </span>
                                                        <span className='value'>
                                                            {
                                                                traveler.name
                                                                    ?.firstName
                                                            }{' '}
                                                            {
                                                                traveler.name
                                                                    ?.lastName
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className='info-item'>
                                                        <span className='label'>
                                                            Title:
                                                        </span>
                                                        <span className='value'>
                                                            {traveler.title}
                                                        </span>
                                                    </div>
                                                    <div className='info-item'>
                                                        <span className='label'>
                                                            Type:
                                                        </span>
                                                        <span className='value'>
                                                            {traveler.type}
                                                        </span>
                                                    </div>
                                                    <div className='info-item'>
                                                        <span className='label'>
                                                            Gender:
                                                        </span>
                                                        <span className='value'>
                                                            {traveler.gender}
                                                        </span>
                                                    </div>
                                                    <div className='info-item'>
                                                        <span className='label'>
                                                            Date of Birth:
                                                        </span>
                                                        <span className='value'>
                                                            {traveler.dateOfBirth
                                                                ? new Date(
                                                                      traveler.dateOfBirth
                                                                  ).toLocaleDateString()
                                                                : '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='info-section'>
                                                <div className='section-header'>
                                                    <BsEnvelope className='section-icon' />
                                                    <h5>Contact Information</h5>
                                                </div>
                                                <div className='info-grid'>
                                                    <div className='info-item'>
                                                        <span className='label'>
                                                            Email:
                                                        </span>
                                                        <span className='value'>
                                                            <BsEnvelope />{' '}
                                                            {
                                                                traveler.contact
                                                                    ?.emailAddress
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className='info-item'>
                                                        <span className='label'>
                                                            Phone:
                                                        </span>
                                                        <span className='value'>
                                                            <BsTelephone /> +
                                                            {
                                                                traveler.contact
                                                                    ?.phones?.[0]
                                                                    ?.countryCallingCode
                                                            }{' '}
                                                            {
                                                                traveler.contact
                                                                    ?.phones?.[0]
                                                                    ?.number
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='info-section'>
                                                <div className='section-header'>
                                                    <BsCreditCard className='section-icon' />
                                                    <h5>
                                                        Document Information
                                                    </h5>
                                                </div>
                                                {traveler.documents?.map(
                                                    (doc, docIndex) => (
                                                        <div
                                                            key={docIndex}
                                                            className='document-card'
                                                        >
                                                            <div className='document-header'>
                                                                <span className='document-type'>
                                                                    {
                                                                        doc.documentType
                                                                    }
                                                                </span>
                                                                <span className='document-number'>
                                                                    {doc.number}
                                                                </span>
                                                            </div>
                                                            <div className='info-grid'>
                                                                <div className='info-item'>
                                                                    <span className='label'>
                                                                        Nationality:
                                                                    </span>
                                                                    <span className='value'>
                                                                        {
                                                                            doc.nationality
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className='info-item'>
                                                                    <span className='label'>
                                                                        Expiry
                                                                        Date:
                                                                    </span>
                                                                    <span className='value'>
                                                                        {doc.expiryDate
                                                                            ? new Date(
                                                                                  doc.expiryDate
                                                                              ).toLocaleDateString()
                                                                            : '-'}
                                                                    </span>
                                                                </div>
                                                                <div className='info-item'>
                                                                    <span className='label'>
                                                                        Issuance
                                                                        Country:
                                                                    </span>
                                                                    <span className='value'>
                                                                        {
                                                                            doc.issuanceCountry
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}

                            {/* Contact Information */}
                            {/* {passengerDetails?.contacts && (
                                <div className="contact-card">
                                    <div className="contact-header">
                                        <BsTelephone className="contact-icon" />
                                        <h4>Booking Contact</h4>
                                    </div>
                                    <div className="contact-content">
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <span className="label">Company:</span>
                                                <span className="value">{passengerDetails.contacts[0]?.companyName}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Contact Person:</span>
                                                <span className="value">
                                                    {passengerDetails.contacts[0]?.addresseeName?.firstName} {passengerDetails.contacts[0]?.addresseeName?.lastName}
                                                </span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Email:</span>
                                                <span className="value">
                                                    <BsEnvelope /> {passengerDetails.contacts[0]?.emailAddress}
                                                </span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Address:</span>
                                                <span className="value">
                                                    <BsGeoAlt /> {passengerDetails.contacts[0]?.address?.lines?.[0]}, {passengerDetails.contacts[0]?.address?.cityName}, {passengerDetails.contacts[0]?.address?.countryCode}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )} */}
                        </div>
                    </div>
                )}

                {activeTab === 'flight' && (
                    <div className='tab-content'>
                        <div className='flight-header'>
                            <h3>
                                <BsFillAirplaneFill /> Flight Details
                            </h3>
                            <p>
                                Complete flight itinerary and pricing
                                information
                            </p>
                        </div>

                        <div className='flight-details'>
                            {flightOffer?.itineraries?.map(
                                (itinerary, index) => (
                                    <div
                                        key={index}
                                        className='itinerary-card'
                                    >
                                        <div className='itinerary-header'>
                                            <div className='itinerary-title'>
                                                <BsFillAirplaneFill className='itinerary-icon' />
                                                <h4>
                                                    {index === 0
                                                        ? 'Outbound Flight'
                                                        : 'Return Flight'}
                                                </h4>
                                            </div>
                                            <div className='flight-date'>
                                                {formatDate(
                                                    itinerary.segments[0]
                                                        ?.departure?.at
                                                )}
                                            </div>
                                        </div>

                                        {itinerary.segments?.map(
                                            (segment, segIndex) => (
                                                <div
                                                    key={segIndex}
                                                    className='segment-card'
                                                >
                                                    <div className='segment-header'>
                                                        <div className='airline-info'>
                                                            <div className='airline-logo'>
                                                                <span className='airline-code'>
                                                                    {
                                                                        segment.carrierCode
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className='flight-info'>
                                                                <span className='flight-number'>
                                                                    {
                                                                        segment.number
                                                                    }
                                                                </span>
                                                                <span className='aircraft-info'>
                                                                    Aircraft:{' '}
                                                                    {
                                                                        segment
                                                                            .aircraft
                                                                            ?.code
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className='flight-status'>
                                                            <span className='status-badge'>
                                                                {segment.numberOfStops ===
                                                                0
                                                                    ? 'Direct'
                                                                    : `${segment.numberOfStops} stop(s)`}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className='segment-route'>
                                                        <div className='airport-departure'>
                                                            <div className='airport-code'>
                                                                {
                                                                    segment
                                                                        .departure
                                                                        ?.iataCode
                                                                }
                                                            </div>
                                                            <div className='airport-name'>
                                                                Departure
                                                            </div>
                                                            <div className='airport-time'>
                                                                {formatTime(
                                                                    segment
                                                                        .departure
                                                                        ?.at
                                                                )}
                                                            </div>
                                                            <div className='airport-date'>
                                                                {formatDate(
                                                                    segment
                                                                        .departure
                                                                        ?.at
                                                                )}
                                                            </div>
                                                            <div className='airport-terminal'>
                                                                Terminal{' '}
                                                                {
                                                                    segment
                                                                        .departure
                                                                        ?.terminal
                                                                }
                                                            </div>
                                                        </div>

                                                        <div className='flight-path'>
                                                            <div className='flight-duration'>
                                                                {
                                                                    segment.duration
                                                                }
                                                            </div>
                                                            <div className='flight-arrow'>
                                                                ✈
                                                            </div>
                                                        </div>

                                                        <div className='airport-arrival'>
                                                            <div className='airport-code'>
                                                                {
                                                                    segment
                                                                        .arrival
                                                                        ?.iataCode
                                                                }
                                                            </div>
                                                            <div className='airport-name'>
                                                                Arrival
                                                            </div>
                                                            <div className='airport-time'>
                                                                {formatTime(
                                                                    segment
                                                                        .arrival
                                                                        ?.at
                                                                )}
                                                            </div>
                                                            <div className='airport-date'>
                                                                {formatDate(
                                                                    segment
                                                                        .arrival
                                                                        ?.at
                                                                )}
                                                            </div>
                                                            <div className='airport-terminal'>
                                                                Terminal{' '}
                                                                {
                                                                    segment
                                                                        .arrival
                                                                        ?.terminal
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className='segment-details'>
                                                        <div className='detail-item'>
                                                            <span className='label'>
                                                                Operating
                                                                Carrier:
                                                            </span>
                                                            <span className='value'>
                                                                {
                                                                    segment
                                                                        .operating
                                                                        ?.carrierCode
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className='detail-item'>
                                                            <span className='label'>
                                                                CO2 Emissions:
                                                            </span>
                                                            <span className='value'>
                                                                {
                                                                    segment
                                                                        .co2Emissions?.[0]
                                                                        ?.weight
                                                                }{' '}
                                                                {
                                                                    segment
                                                                        .co2Emissions?.[0]
                                                                        ?.weightUnit
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )
                            )}

                            {/* Pricing Information */}
                            {flightOffer?.travelerPricings && (
                                <div className='pricing-card'>
                                    <div className='pricing-header'>
                                        <BsCreditCard className='pricing-icon' />
                                        <h4>Pricing Details</h4>
                                    </div>
                                    <div className='pricing-content'>
                                        {flightOffer.travelerPricings.map(
                                            (pricing, index) => (
                                                <div
                                                    key={index}
                                                    className='pricing-item'
                                                >
                                                    <div className='pricing-item-header'>
                                                        <span className='traveler-type'>
                                                            {
                                                                pricing.travelerType
                                                            }
                                                        </span>
                                                        <span className='fare-option'>
                                                            {pricing.fareOption}
                                                        </span>
                                                    </div>
                                                    <div className='pricing-breakdown'>
                                                        <div className='price-item'>
                                                            <span className='label'>
                                                                Base Price:
                                                            </span>
                                                            <span className='value'>
                                                                ₱
                                                                {parseFloat(
                                                                    pricing
                                                                        .price
                                                                        ?.base ||
                                                                        0
                                                                ).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        {pricing.price?.taxes?.map(
                                                            (tax, taxIndex) => (
                                                                <div
                                                                    key={
                                                                        taxIndex
                                                                    }
                                                                    className='price-item'
                                                                >
                                                                    <span className='label'>
                                                                        Tax (
                                                                        {
                                                                            tax.code
                                                                        }
                                                                        ):
                                                                    </span>
                                                                    <span className='value'>
                                                                        ₱
                                                                        {parseFloat(
                                                                            tax.amount ||
                                                                                0
                                                                        ).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            )
                                                        )}
                                                        <div className='price-item total'>
                                                            <span className='label'>
                                                                Total:
                                                            </span>
                                                            <span className='value'>
                                                                ₱
                                                                {parseFloat(
                                                                    pricing
                                                                        .price
                                                                        ?.total ||
                                                                        0
                                                                ).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
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
                            <p>
                                Complete payment details and transaction
                                information
                            </p>
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
                                            <span className='label'>
                                                Total Amount:
                                            </span>
                                            <span className='value amount'>
                                                ₱
                                                {parseFloat(
                                                    booking.total_amount || 0
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className='info-item'>
                                            <span className='label'>
                                                Currency:
                                            </span>
                                            <span className='value'>
                                                {booking.currency}
                                            </span>
                                        </div>
                                        <div className='info-item'>
                                            <span className='label'>
                                                Payment Status:
                                            </span>
                                            <span
                                                className={`value status ${getStatusColor(
                                                    booking.status
                                                )}`}
                                            >
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div className='info-item'>
                                            <span className='label'>
                                                Stripe Checkout ID:
                                            </span>
                                            <span className='value'>
                                                {booking.stripe_checkout_id ||
                                                    'Not available'}
                                            </span>
                                        </div>
                                        <div className='info-item'>
                                            <span className='label'>
                                                Amadeus Order ID:
                                            </span>
                                            <span className='value'>
                                                {booking.amadeus_order_id ||
                                                    'Not available'}
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
                                            {eTicketNumbers.map(
                                                (ticket, index) => (
                                                    <div
                                                        key={index}
                                                        className='ticket-item'
                                                    >
                                                        <div className='ticket-number'>
                                                            {ticket}
                                                        </div>
                                                        <div className='ticket-status'>
                                                            Confirmed
                                                        </div>
                                                    </div>
                                                )
                                            )}
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
                                                <span className='label'>
                                                    Base Price:
                                                </span>
                                                <span className='value'>
                                                    ₱
                                                    {parseFloat(
                                                        flightOffer.price
                                                            ?.base || 0
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                            {flightOffer.price?.fees?.map(
                                                (fee, index) => (
                                                    <div
                                                        key={index}
                                                        className='price-item'
                                                    >
                                                        <span className='label'>
                                                            Fee ({fee.type}):
                                                        </span>
                                                        <span className='value'>
                                                            ₱
                                                            {parseFloat(
                                                                fee.amount || 0
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                            <div className='price-item total'>
                                                <span className='label'>
                                                    Grand Total:
                                                </span>
                                                <span className='value'>
                                                    ₱
                                                    {parseFloat(
                                                        flightOffer.price
                                                            ?.grandTotal || 0
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
                                <p>
                                    Download the official flight itinerary PDF
                                    receipt
                                </p>
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
                                        <span className='label'>
                                            Booking Reference:
                                        </span>
                                        <span className='value'>
                                            {booking.booking_reference}
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
                                    <div className='info-item'>
                                        <span className='label'>
                                            File Name:
                                        </span>
                                        <span className='value'>
                                            Flight-Itinerary-
                                            {booking.booking_reference}.pdf
                                        </span>
                                    </div>
                                    <div className='info-item'>
                                        <span className='label'>Format:</span>
                                        <span className='value'>
                                            Print-optimized PDF
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className='pdf-notes'>
                                <h4>Notes</h4>
                                <ul>
                                    <li>
                                        The document contains the complete
                                        flight itinerary with all passenger and
                                        flight details
                                    </li>
                                    <li>
                                        This is the official admin receipt that
                                        can be used for internal records and
                                        printing
                                    </li>
                                    <li>
                                        Click "Generate PDF" to open a print
                                        dialog where you can save as PDF
                                    </li>
                                    <li>
                                        In the print dialog, select "Save as
                                        PDF" as the destination to create a PDF
                                        file
                                    </li>
                                    <li>
                                       
                                        Uncheck "Headers and Footers" in print
                                        options to remove browser watermarks
                                    </li>
                                    <li>
                                        Use the HTML preview to check the layout
                                        before generating the PDF
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div
                    className='modal-overlay'
                    onClick={handleCloseEditModal}
                >
                    <div
                        className='modal-content'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='modal-header'>
                            <h3>Edit Flight Booking</h3>
                            <button
                                className='modal-close'
                                onClick={handleCloseEditModal}
                                disabled={editLoading}
                            >
                                <BsX />
                            </button>
                        </div>

                        <form
                            onSubmit={handleEditSubmit}
                            className='edit-form'
                        >
                            <div className='form-group'>
                                <label htmlFor='status'>Status</label>
                                <Select
                                    value={statusOptions.find(
                                        (option) =>
                                            option.value === editForm.status
                                    )}
                                    onChange={(selectedOption) =>
                                        handleEditFormChange(
                                            'status',
                                            selectedOption?.value || ''
                                        )
                                    }
                                    options={statusOptions}
                                    placeholder='Select status'
                                    isSearchable={false}
                                    className='react-select-container'
                                    classNamePrefix='react-select'
                                    formatOptionLabel={(option) => (
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    backgroundColor:
                                                        option.color,
                                                    marginRight: 8,
                                                }}
                                            />
                                            {option.label}
                                        </div>
                                    )}
                                />
                            </div>

                            <div className='form-group'>
                                <label htmlFor='pnr'>PNR</label>
                                <input
                                    type='text'
                                    id='pnr'
                                    value={editForm.pnr}
                                    onChange={(e) =>
                                        handleEditFormChange(
                                            'pnr',
                                            e.target.value
                                        )
                                    }
                                    placeholder='Enter PNR'
                                    className='form-input'
                                />
                            </div>

                            <div className='form-group'>
                                <label htmlFor='e_ticket_numbers'>
                                    E-Ticket Numbers
                                </label>
                                <input
                                    type='text'
                                    id='e_ticket_numbers'
                                    value={editForm.e_ticket_numbers}
                                    onChange={(e) =>
                                        handleEditFormChange(
                                            'e_ticket_numbers',
                                            e.target.value
                                        )
                                    }
                                    placeholder='Enter ticket numbers (comma-separated)'
                                    className='form-input'
                                />
                                <small className='form-help'>
                                    Separate multiple ticket numbers with commas
                                </small>
                            </div>

                            <div className='form-group'>
                                <label htmlFor='assigned_to'>Assigned To</label>
                                <Select
                                    value={adminOptions.find(
                                        (option) =>
                                            option.value ===
                                            editForm.assigned_to
                                    )}
                                    onChange={(selectedOption) =>
                                        handleEditFormChange(
                                            'assigned_to',
                                            selectedOption?.value || ''
                                        )
                                    }
                                    options={adminOptions}
                                    placeholder={
                                        loadingAdmins
                                            ? 'Loading admins...'
                                            : 'Select admin'
                                    }
                                    isSearchable={true}
                                    isLoading={loadingAdmins}
                                    isClearable={true}
                                    className='react-select-container'
                                    classNamePrefix='react-select'
                                />
                            </div>

                            <div className='form-group'>
                                <label htmlFor='assignment_status'>
                                    Assignment Status
                                </label>
                                <Select
                                    value={assignmentStatusOptions.find(
                                        (option) =>
                                            option.value ===
                                            editForm.assignment_status
                                    )}
                                    onChange={(selectedOption) =>
                                        handleEditFormChange(
                                            'assignment_status',
                                            selectedOption?.value || 'pending'
                                        )
                                    }
                                    options={assignmentStatusOptions}
                                    placeholder='Select assignment status'
                                    isSearchable={false}
                                    className='react-select-container'
                                    classNamePrefix='react-select'
                                />
                            </div>

                            <div className='modal-actions'>
                                <button
                                    type='button'
                                    className='btn btn-secondary'
                                    onClick={handleCloseEditModal}
                                    disabled={editLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    className='btn btn-primary'
                                    disabled={editLoading}
                                >
                                    {editLoading ? (
                                        <>
                                            <div className='loading-spinner-small'></div>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <BsPencil />
                                            Update Booking
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FlightBookingDetail
