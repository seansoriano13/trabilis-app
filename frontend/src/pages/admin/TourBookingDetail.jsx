import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import AsyncSelect from 'react-select/async'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
    FiFile
} from 'react-icons/fi'
import { supabase } from '../../api/supabaseClient'
import adminClient from '../../api/adminClient'
import ReactFlatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/material_red.css'
import airlines from '../../data/airlines.json'
import { useAirports } from '../../context/AirportContext'
import { loadOptions } from '../../utils/airportOptionsLoader'
import { defaultAirportOptionsData } from '../../utils/defaultAirportOptions'
import './TourBookingDetail.css'

const TourBookingDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [booking, setBooking] = useState(null)
    const [packageDetails, setPackageDetails] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('overview')
    const [printLoading, setPrintLoading] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editLoading, setEditLoading] = useState(false)
    const [editForm, setEditForm] = useState({
        status: '',
        assigned_to: '',
        assignment_status: 'pending',
        flight_details: {
            outbound: [ { airline: '', flight_no: '', departure: '', arrival: '', date: '' } ],
            return: [ { airline: '', flight_no: '', departure: '', arrival: '', date: '' } ]
        }
    })
    const [adminOptions, setAdminOptions] = useState([])
    const [loadingAdmins, setLoadingAdmins] = useState(false)
    const [assignedAdminName, setAssignedAdminName] = useState('')
    const [tripType, setTripType] = useState('round-trip')
    const { airports } = useAirports()
    const { asyncLoader, defaultOptions } = loadOptions(airports, defaultAirportOptionsData)

    const airlineOptions = (airlines || [])
        .filter(a => a && a.name)
        .map(a => ({ value: a.name, label: a.name, logo: a.logo }))

    // Status options for tours
    const statusOptions = [
        { value: 'CONFIRMED', label: 'Confirmed', color: '#28a745' },
        { value: 'PENDING_PAYMENT', label: 'Pending Payment', color: '#fd7e14' },
        { value: 'CANCELLED', label: 'Cancelled', color: '#dc3545' }
    ]

    const assignmentStatusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' }
    ]

    const jwt = localStorage.getItem('adminToken')

    // Set Supabase auth session
    useEffect(() => {
        if (jwt) {
            supabase.auth.setSession({ access_token: jwt })
        }
    }, [jwt])

    // Fetch booking data
    useEffect(() => {
        const fetchBooking = async () => {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('tour_bookings')
                    .select(`
                        *,
                        package_dates (
                            id,
                            start_date,
                            end_date,
                            total_slots,
                            tour_package_id,
                            tour_packages (
                                id,
                                title
                            )
                        )
                    `)
                    .eq('id', id)
                    .single()

                if (error) {
                    throw new Error('Failed to fetch booking details')
                }

                if (!data) {
                    throw new Error('Booking not found')
                }

                // console.log('Booking data received:', data)
                setBooking(data)
                setPackageDetails(data.package_dates)

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

    // Admin options for assignment
    const fetchAdminOptions = async () => {
        setLoadingAdmins(true)
        try {
            const response = await adminClient.get('/appointments/all-staff')
            if (response.data.success) {
                const options = response.data.data.map(admin => ({
                    value: admin.id,
                    label: `${admin.first_name} ${admin.last_name} (${admin.email})`,
                    email: admin.email,
                    name: `${admin.first_name} ${admin.last_name}`
                }))
                setAdminOptions(options)
            }
        } catch (error) {
            console.error('Error fetching admin options:', error)
        } finally {
            setLoadingAdmins(false)
        }
    }

    const fetchAssignedAdminName = async (adminId) => {
        if (!adminId) return
        try {
            const response = await adminClient.get('/appointments/all-staff')
            if (response.data.success) {
                const admin = response.data.data.find(a => a.id === adminId)
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
            day: 'numeric'
        })
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
                return <FiCheckCircle className="status-icon" />
            case 'PENDING_PAYMENT':
                return <FiClock className="status-icon" />
            case 'CANCELLED':
                return <FiXCircle className="status-icon" />
            default:
                return <FiClock className="status-icon" />
        }
    }

    const handlePrint = () => {
        window.print()
    }

    const handlePreview = async () => {
        if (!booking) return
        
        try {
            // Use admin client with proper authentication for preview
            const response = await adminClient.get(`/tours/${booking.id}/html`, {
                responseType: 'blob'
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
            alert('Failed to open preview. Please try again.')
        }
    }

    const handlePrintReceipt = async () => {
        if (!booking) return
        
        setPrintLoading(true)
        try {
            // Use the new admin PDF route that doesn't use PDFShift
            const response = await adminClient.get(`/tours/${booking.id}/pdfadmin`, {
                responseType: 'blob'
            })

            const blob = new Blob([response.data], { type: 'text/html' })
            const url = URL.createObjectURL(blob)
            
            // Open in new tab with print dialog for PDF generation
            const newWindow = window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
            
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
            alert('Failed to open PDF receipt. Please try again.')
        } finally {
            setPrintLoading(false)
        }
    }

    const handleEdit = async () => {
        await fetchAdminOptions()
        setEditForm({
            status: booking.status,
            assigned_to: booking.assigned_to || '',
            assignment_status: booking.assignment_status || 'pending',
            flight_details: (() => {
                const fd = booking.flight_details || {}
                const normalizeLeg = (leg) => {
                    if (!leg) return [ { airline: '', flight_no: '', departure: '', arrival: '', date: '' } ]
                    if (Array.isArray(leg)) return leg.length ? leg : [ { airline: '', flight_no: '', departure: '', arrival: '', date: '' } ]
                    return [ leg ]
                }
                return {
                    outbound: normalizeLeg(fd.outbound || fd.outboundSegments),
                    return: normalizeLeg(fd.return || fd.inbound || fd.returnSegments)
                }
            })()
        })
        setShowEditModal(true)
    }

    const handleCloseEditModal = () => {
        setShowEditModal(false)
        setEditForm({
            status: '',
            assigned_to: '',
            assignment_status: 'pending',
            flight_details: {
                outbound: { airline: '', flight_no: '', departure: '', arrival: '', date: '' },
                return: { airline: '', flight_no: '', departure: '', arrival: '', date: '' }
            }
        })
    }

    const handleEditFormChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }))
    }

    const handleFlightChange = (direction, field, value, index = 0) => {
        setEditForm(prev => ({
            ...prev,
            flight_details: {
                ...prev.flight_details,
                [direction]: (prev.flight_details?.[direction] || []).map((seg, i) => i === index ? { ...seg, [field]: value } : seg)
            }
        }))
    }

    const addSegment = (direction) => {
        setEditForm(prev => ({
            ...prev,
            flight_details: {
                ...prev.flight_details,
                [direction]: [
                    ...(prev.flight_details?.[direction] || []),
                    { airline: '', flight_no: '', departure: '', arrival: '', date: '' }
                ]
            }
        }))
    }

    const removeSegment = (direction, index) => {
        setEditForm(prev => ({
            ...prev,
            flight_details: {
                ...prev.flight_details,
                [direction]: (prev.flight_details?.[direction] || []).filter((_, i) => i !== index)
            }
        }))
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        setEditLoading(true)
        try {
            const submitData = {
                status: editForm.status,
                assigned_to: editForm.assigned_to || null,
                assignment_status: editForm.assignment_status,
                flight_details: {
                    outbound: editForm.flight_details?.outbound || [],
                    return: tripType === 'round-trip' ? (editForm.flight_details?.return || []) : []
                }
            }
            const response = await adminClient.put(`/tours/${booking.id}/edit`, submitData)
            if (response.data.success) {
                setBooking(prev => ({
                    ...prev,
                    ...submitData,
                    updated_at: new Date().toISOString()
                }))
                if (submitData.assigned_to && submitData.assigned_to !== booking.assigned_to) {
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

    const handleCancel = () => {
        if (booking.status === 'CANCELLED') {
            alert('This booking is already cancelled.')
            return
        }
        const reason = prompt('Please provide a reason for cancellation (optional):', '')
        if (window.confirm(`Are you sure you want to cancel this booking?\n\nBooking Reference: ${booking.booking_reference}\n${reason ? `Reason: ${reason}` : ''}`)) {
            cancelBooking(reason)
        }
    }

    const cancelBooking = async (reason) => {
        try {
            const response = await adminClient.put(`/tours/${booking.id}/cancel`, { reason: reason || null })
            if (response.data.success) {
                setBooking(prev => ({
                    ...prev,
                    status: 'CANCELLED',
                    cancelled_at: new Date().toISOString(),
                    cancellation_reason: reason || null,
                    updated_at: new Date().toISOString()
                }))
                alert('Booking cancelled successfully!')
            } else {
                alert('Failed to cancel booking')
            }
        } catch (error) {
            console.error('Error cancelling booking:', error)
            if (error.response?.data?.error) {
                alert(`Error: ${error.response.data.error}`)
            } else {
                alert('Error cancelling booking. Please try again.')
            }
        }
    }

    if (loading) {
        return (
            <div className="tour-booking-detail">
                <div className="tour-booking-detail__loading">
                    <div className="loading-spinner"></div>
                    <p>Loading booking details...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="tour-booking-detail">
                <div className="tour-booking-detail__error">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button 
                        className="btn btn-primary"
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
            <div className="tour-booking-detail">
                <div className="tour-booking-detail__error">
                    <h2>Booking Not Found</h2>
                    <p>The requested booking could not be found.</p>
                    <button 
                        className="btn btn-primary"
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
        <div className="tour-booking-detail">
            {/* Header */}
            <div className="tour-booking-detail__header">
                <div className="tour-booking-detail__breadcrumb">
                    <Link to="/admin/tour-sales" className="breadcrumb-link">
                        <FiArrowLeft /> Tour Sales
                    </Link>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">Booking Details</span>
                </div>
                
                <div className="tour-booking-detail__title">
                    <FiMap className="title-icon" />
                    <h1>Tour Booking Details</h1>
                </div>

                <div className="booking-detail__actions">
                    <button 
                        className="btn btn-warning" 
                        onClick={handleEdit}
                        disabled={booking.status === 'CANCELLED'}
                        title={booking.status === 'CANCELLED' ? 'Cannot edit cancelled booking' : 'Edit booking details'}
                    >
                        <FiEdit /> Edit
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

            {/* Status Banner (reusing flight styles) */}
            <div className={`booking-detail__status ${getStatusColor(booking.status)}`}>
                <div className="status-content">
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
                    <div className="assignment-status">
                        <div className="assignment-status__content">
                            <div className="assignment-status__icon">
                                {booking.assignment_status === 'completed' && <FiCheckCircle />}
                                {booking.assignment_status === 'in_progress' && <FiClock />}
                                {booking.assignment_status === 'pending' && <FiClock />}
                            </div>
                            <div className="assignment-status__details">
                                <h4>Assignment Status: {booking.assignment_status.charAt(0).toUpperCase() + booking.assignment_status.slice(1).replace('_', ' ')}</h4>
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

            {/* Tabs */}
            <div className="tour-booking-detail__tabs">
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
                    className={`tab ${activeTab === 'pdf' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pdf')}
                >
                    <FiFile /> PDF Receipt
                </button>
            </div>

            {/* Tab Content */}
            <div className="tour-booking-detail__content">
                {activeTab === 'overview' && (
                    <div className="tab-content">
                        <div className="overview-header">
                            <h3><FiMap /> Booking Overview</h3>
                            <p>Complete summary of your tour booking details</p>
                        </div>
                        
                        <div className="overview-grid">
                            <div className="overview-card">
                                <div className="card-header">
                                    <FiPackage className="card-icon" />
                                    <h4>Tour Package</h4>
                                </div>
                                <div className="card-content">
                                    <div className="info-item">
                                        <span className="label">Package:</span>
                                        <span className="value">{tourPackage?.title || 'Unknown'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Duration:</span>
                                        <span className="value">
                                            {packageDetails?.start_date && packageDetails?.end_date ? 
                                                Math.ceil((new Date(packageDetails.end_date) - new Date(packageDetails.start_date)) / (1000 * 60 * 60 * 24)) + 1 : 
                                                'N/A'
                                            } days
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Start Date:</span>
                                        <span className="value">{formatDate(packageDetails?.start_date)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">End Date:</span>
                                        <span className="value">{formatDate(packageDetails?.end_date)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="overview-card">
                                <div className="card-header">
                                    <FiUsers className="card-icon" />
                                    <h4>Passenger Summary</h4>
                                </div>
                                <div className="card-content">
                                    <div className="info-item">
                                        <span className="label">Lead Contact:</span>
                                        <span className="value">
                                            {booking.lead_first_name} {booking.lead_last_name}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Email:</span>
                                        <span className="value">{booking.lead_email}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Phone:</span>
                                        <span className="value">{booking.lead_phone}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Passenger Count:</span>
                                        <span className="value">{booking.passenger_count} person(s)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="overview-card">
                                <div className="card-header">
                                    <FiCreditCard className="card-icon" />
                                    <h4>Payment Summary</h4>
                                </div>
                                <div className="card-content">
                                    <div className="info-item">
                                        <span className="label">Total Amount:</span>
                                        <span className="value amount">
                                            ₱{parseFloat(booking.total_amount || 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Reservation Amount:</span>
                                        <span className="value">
                                            ₱{parseFloat(booking.reservation_amount || 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Payment Type:</span>
                                        <span className="value">{booking.payment_type}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Status:</span>
                                        <span className={`value status ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'package' && (
                    <div className="tab-content">
                        <div className="package-header">
                            <h3><FiPackage /> Package Details</h3>
                            <p>Complete tour package information and itinerary</p>
                        </div>
                        
                        <div className="package-details">
                            {tourPackage && (
                                <div className="package-card">
                                    <div className="package-card-header">
                                        <FiPackage className="package-icon" />
                                        <h4>{tourPackage.title}</h4>
                                    </div>
                                    <div className="package-content">
                                        <div className="package-info">
                                            <div className="info-section">
                                                <div className="section-header">
                                                    <FiCalendar className="section-icon" />
                                                    <h5>Package Information</h5>
                                                </div>
                                                <div className="info-grid">
                                                    <div className="info-item">
                                                        <span className="label">Duration:</span>
                                                        <span className="value">
                                                            {packageDetails?.start_date && packageDetails?.end_date ? 
                                                                Math.ceil((new Date(packageDetails.end_date) - new Date(packageDetails.start_date)) / (1000 * 60 * 60 * 24)) + 1 : 
                                                                'N/A'
                                                            } days
                                                        </span>
                                                    </div>
                                                    <div className="info-item">
                                                        <span className="label">Available Slots:</span>
                                                        <span className="value">{packageDetails?.total_slots || 0} slots</span>
                                                    </div>
                                    <div className="info-item">
                                        <span className="label">Package Price:</span>
                                        <span className="value">₱{parseFloat(booking.total_amount / booking.passenger_count || 0).toLocaleString()}</span>
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
                    <div className="tab-content">
                        <div className="passenger-header">
                            <h3><FiUsers /> Passenger Details</h3>
                            <p>Lead contact information and passenger details</p>
                        </div>
                        
                        <div className="passenger-details passenger-details--tour-detail bg-white">
                            <div className="passenger-card">
                                <div className="passenger-card-header">
                                    <div className="passenger-avatar-large">
                                        {booking.lead_first_name?.charAt(0)}{booking.lead_last_name?.charAt(0)}
                                    </div>
                                    <div className="passenger-title">
                                        <h4>Lead Contact</h4>
                                        <p>{booking.lead_first_name} {booking.lead_last_name}</p>
                                    </div>
                                </div>
                                
                                <div className="passenger-sections">
                                    <div className="info-section">
                                        <div className="section-header">
                                            <FiUsers className="section-icon" />
                                            <h5>Contact Information</h5>
                                        </div>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <span className="label">Full Name:</span>
                                                <span className="value">
                                                    {booking.lead_first_name} {booking.lead_last_name}
                                                </span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Email:</span>
                                                <span className="value">
                                                    <FiMail /> {booking.lead_email}
                                                </span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Phone:</span>
                                                <span className="value">
                                                    <FiPhone /> {booking.lead_phone}
                                                </span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Passenger Count:</span>
                                                <span className="value">
                                                    <FiUsers /> {booking.passenger_count} person(s)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'payment' && (
                    <div className="tab-content">
                        <div className="payment-header">
                            <h3><FiCreditCard /> Payment Information</h3>
                            <p>Complete payment details and transaction information</p>
                        </div>
                        
                        <div className="payment-details">
                            <div className="payment-card">
                                <div className="payment-card-header">
                                    <FiCreditCard className="payment-icon" />
                                    <h4>Payment Summary</h4>
                                </div>
                                <div className="payment-content">
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="label">Total Amount:</span>
                                            <span className="value amount">₱{parseFloat(booking.total_amount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Reservation Amount:</span>
                                            <span className="value">₱{parseFloat(booking.reservation_amount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Payment Type:</span>
                                            <span className="value">{booking.payment_type}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Payment Status:</span>
                                            <span className={`value status ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Stripe Checkout ID:</span>
                                            <span className="value stripe-id" title={booking.stripe_checkout_id || 'Not available'}>
                                                {booking.stripe_checkout_id ? 
                                                    `${booking.stripe_checkout_id.substring(0, 20)}...` : 
                                                    'Not available'
                                                }
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Booking Reference:</span>
                                            <span className="value">{booking.booking_reference}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Created At:</span>
                                            <span className="value">{formatDateTime(booking.created_at)}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Updated At:</span>
                                            <span className="value">{formatDateTime(booking.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="price-breakdown-card">
                                <div className="price-breakdown-header">
                                    <FiDollarSign className="price-icon" />
                                    <h4>Price Breakdown</h4>
                                </div>
                                <div className="price-breakdown-content">
                                    <div className="price-breakdown">
                                        <div className="price-item">
                                            <span className="label">Price per Person:</span>
                                            <span className="value">₱{parseFloat(booking.total_amount / booking.passenger_count || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="price-item">
                                            <span className="label">Number of Passengers:</span>
                                            <span className="value">{booking.passenger_count}</span>
                                        </div>
                                        <div className="price-item">
                                            <span className="label">Subtotal:</span>
                                            <span className="value">₱{parseFloat(booking.total_amount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="price-item total">
                                            <span className="label">Total Amount:</span>
                                            <span className="value">₱{parseFloat(booking.total_amount || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pdf' && (
                    <div className="tab-content">
                        <div className="pdf-receipt">
                            <div className="pdf-header">
                                <h3><FiFile /> Tour Booking PDF</h3>
                                <p>Download the official tour booking PDF receipt</p>
                            </div>

                            <div className="pdf-actions">
                                <div className="pdf-actions-group">
                                    <button 
                                        className="btn btn-info"
                                        onClick={handlePreview}
                                    >
                                        <FiEye />Preview
                                    </button>
                                    <button 
                                        className="btn btn-success"
                                        onClick={handlePrintReceipt}
                                        disabled={printLoading}
                                    >
                                        {printLoading ? (
                                            <>
                                                <div className="loading-spinner-small"></div>
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


                            <div className="pdf-info">
                                <h4>PDF Information</h4>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="label">Booking Reference:</span>
                                        <span className="value">{booking.booking_reference}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Status:</span>
                                        <span className={`value status ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">File Name:</span>
                                        <span className="value">
                                            Tour-Booking-{booking.booking_reference}.pdf
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Format:</span>
                                        <span className="value">Print-optimized PDF</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pdf-notes">
                                <h4>Notes</h4>
                                <ul>                      
                                    <li>The document contains the complete tour booking details with all passenger and package information</li>
                                    <li>This is the official admin receipt that can be used for internal records and printing</li>
                                    <li>Click "Generate PDF" to open a print dialog where you can save as PDF</li>
                                    <li>In the print dialog, select "Save as PDF" as the destination to create a PDF file</li>
                                    <li><strong>For Firefox users:</strong> Uncheck "Headers and Footers" in print options to remove browser watermarks</li>
                                    <li>Use the HTML preview to check the layout before generating the PDF</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={handleCloseEditModal}>
                    <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Edit Tour Booking</h3>
                            <button 
                                className="modal-close" 
                                onClick={handleCloseEditModal}
                                disabled={editLoading}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="edit-form">
                            <div className="form-group">
                                <label htmlFor="status">Status</label>
                                <Select
                                    value={statusOptions.find(option => option.value === editForm.status)}
                                    onChange={(selectedOption) => 
                                        handleEditFormChange('status', selectedOption?.value || '')
                                    }
                                    options={statusOptions}
                                    placeholder="Select status"
                                    isSearchable={false}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    formatOptionLabel={(option) => (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div 
                                                style={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    backgroundColor: option.color,
                                                    marginRight: 8
                                                }}
                                            />
                                            {option.label}
                                        </div>
                                    )}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="assigned_to">Assigned To</label>
                                <Select
                                    value={adminOptions.find(option => option.value === editForm.assigned_to)}
                                    onChange={(selectedOption) => 
                                        handleEditFormChange('assigned_to', selectedOption?.value || '')
                                    }
                                    options={adminOptions}
                                    placeholder={loadingAdmins ? 'Loading admins...' : 'Select admin'}
                                    isSearchable={true}
                                    isLoading={loadingAdmins}
                                    isClearable={true}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="assignment_status">Assignment Status</label>
                                <Select
                                    value={assignmentStatusOptions.find(option => option.value === editForm.assignment_status)}
                                    onChange={(selectedOption) => 
                                        handleEditFormChange('assignment_status', selectedOption?.value || 'pending')
                                    }
                                    options={assignmentStatusOptions}
                                    placeholder="Select assignment status"
                                    isSearchable={false}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="trip_type">Trip Type</label>
                                <Select
                                    value={{ value: tripType, label: tripType === 'round-trip' ? 'Round-trip' : 'One-way' }}
                                    onChange={(opt) => setTripType(opt?.value || 'round-trip')}
                                    options={[{ value: 'round-trip', label: 'Round-trip' }, { value: 'one-way', label: 'One-way' }]}
                                    isSearchable={false}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>

                            <div className="form-group">
                                <label>Flight Details (Optional)</label>
                                <div className="flight-details-grid">
                                    <div className="flight-group">
                                        <h5>Outbound</h5>
                                        {(editForm.flight_details?.outbound || []).map((seg, idx) => (
                                            <div key={`outbound-${idx}`} className="grid-2">
                                            <Select
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                placeholder="Airline"
                                                options={airlineOptions}
                                                value={airlineOptions.find(o => o.label === (seg?.airline || '')) || null}
                                                onChange={(opt) => handleFlightChange('outbound', 'airline', opt?.label || '', idx)}
                                                isClearable
                                            />
                                            <input
                                                type="text"
                                                placeholder="Flight No."
                                                value={seg?.flight_no || ''}
                                                onChange={(e) => handleFlightChange('outbound', 'flight_no', e.target.value, idx)}
                                            />
                                            <AsyncSelect
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                placeholder="Departure Airport"
                                                cacheOptions
                                                defaultOptions={(defaultOptions || []).slice(0, 10)}
                                                loadOptions={asyncLoader}
                                                value={seg?.departure ? { label: seg.departure, value: seg.departure } : null}
                                                onChange={(opt) => handleFlightChange('outbound', 'departure', opt?.label || '', idx)}
                                                isClearable
                                            />
                                            <AsyncSelect
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                placeholder="Arrival Airport"
                                                cacheOptions
                                                defaultOptions={(defaultOptions || []).slice(0, 10)}
                                                loadOptions={asyncLoader}
                                                value={seg?.arrival ? { label: seg.arrival, value: seg.arrival } : null}
                                                onChange={(opt) => handleFlightChange('outbound', 'arrival', opt?.label || '', idx)}
                                                isClearable
                                            />
                                            <ReactFlatpickr
                                                options={{ enableTime: true, dateFormat: 'Y-m-d H:i' }}
                                                value={seg?.date || ''}
                                                onChange={(dates) => handleFlightChange('outbound', 'date', dates?.[0] ? dates[0].toISOString() : '', idx)}
                                                style={{
                                                    background: '#fff',
                                                    border: '1px solid #ced4da',
                                                    borderRadius: 4,
                                                    padding: '7px 10px',
                                                    height: 38,
                                                    width: '100%'
                                                }}
                                            />
                                            <div className="segment-actions">
                                                <button type="button" className="btn btn-secondary" onClick={() => addSegment('outbound')}>+ Segment</button>
                                                {(editForm.flight_details?.outbound?.length || 1) > 1 && (
                                                    <button type="button" className="btn btn-danger" onClick={() => removeSegment('outbound', idx)}>Remove</button>
                                                )}
                                            </div>
                                        </div>
                                        ))}
                                    </div>
                                    {tripType === 'round-trip' && (
                                    <div className="flight-group">
                                        <h5>Return</h5>
                                        {(editForm.flight_details?.return || []).map((seg, idx) => (
                                        <div key={`return-${idx}`} className="grid-2">
                                            <Select
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                placeholder="Airline"
                                                options={airlineOptions}
                                                value={airlineOptions.find(o => o.label === (seg?.airline || '')) || null}
                                                onChange={(opt) => handleFlightChange('return', 'airline', opt?.label || '', idx)}
                                                isClearable
                                            />
                                            <input
                                                type="text"
                                                placeholder="Flight No."
                                                value={seg?.flight_no || ''}
                                                onChange={(e) => handleFlightChange('return', 'flight_no', e.target.value, idx)}
                                            />
                                            <AsyncSelect
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                placeholder="Departure Airport"
                                                cacheOptions
                                                defaultOptions={(defaultOptions || []).slice(0, 10)}
                                                loadOptions={asyncLoader}
                                                value={seg?.departure ? { label: seg.departure, value: seg.departure } : null}
                                                onChange={(opt) => handleFlightChange('return', 'departure', opt?.label || '', idx)}
                                                isClearable
                                            />
                                            <AsyncSelect
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                placeholder="Arrival Airport"
                                                cacheOptions
                                                defaultOptions={(defaultOptions || []).slice(0, 10)}
                                                loadOptions={asyncLoader}
                                                value={seg?.arrival ? { label: seg.arrival, value: seg.arrival } : null}
                                                onChange={(opt) => handleFlightChange('return', 'arrival', opt?.label || '', idx)}
                                                isClearable
                                            />
                                            <ReactFlatpickr
                                                options={{ enableTime: true, dateFormat: 'Y-m-d H:i' }}
                                                value={seg?.date || ''}
                                                onChange={(dates) => handleFlightChange('return', 'date', dates?.[0] ? dates[0].toISOString() : '', idx)}
                                                style={{
                                                    background: '#fff',
                                                    border: '1px solid #ced4da',
                                                    borderRadius: 4,
                                                    padding: '7px 10px',
                                                    height: 38,
                                                    width: '100%'
                                                }}
                                            />
                                            <div className="segment-actions">
                                                <button type="button" className="btn btn-secondary" onClick={() => addSegment('return')}>+ Segment</button>
                                                {(editForm.flight_details?.return?.length || 1) > 1 && (
                                                    <button type="button" className="btn btn-danger" onClick={() => removeSegment('return', idx)}>Remove</button>
                                                )}
                                            </div>
                                        </div>
                                        ))}
                                    </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={handleCloseEditModal}
                                    disabled={editLoading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={editLoading}
                                >
                                    {editLoading ? (
                                        <>
                                            <div className="loading-spinner-small"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
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

export default TourBookingDetail
