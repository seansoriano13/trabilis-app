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
    FiFile
} from 'react-icons/fi'
import { supabase } from '../../api/supabaseClient'
import adminClient from '../../api/adminClient'
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
        passengerIndex: null
    })


    const jwt = localStorage.getItem('adminToken')

    // Set Supabase auth session
    useEffect(() => {
        if (jwt) {
            supabase.auth.setSession({ access_token: jwt })
        }
    }, [jwt])

    // Fetch booking data function
    const fetchBooking = useCallback(async () => {
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
                `)
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
            setLoading(false)
        } catch (err) {
            console.error(err)
            setError(err.message)
            setLoading(false)
        }
    }, [id])

    // Fetch booking data
    useEffect(() => {
        if (id) {
            fetchBooking()
        }
    }, [id, fetchBooking])


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

    const handlePreview = async () => {
        if (!booking) return
        
        setPreviewLoading(true)
        try {
            // Use admin client with proper authentication for preview
            const response = await adminClient.get(`/tours/${booking.id}/html?t=${Date.now()}`, {
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
            passengerIndex: passengerIndex
        })
    }

    const handleVisaProcessingClose = () => {
        setVisaProcessingModal({
            isOpen: false,
            passenger: null,
            passengerIndex: null
        })
    }

    const handleVisaStatusUpdate = () => {
        // Refresh the booking data to show updated visa processing status
        fetchBooking()
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
                            <p>Complete passenger information for all travelers</p>
                        </div>
                        
                        <div className="passenger-details passenger-details--tour-detail bg-white">
                            {/* All Passengers Table */}
                            <div className="passenger-table-section">
                                <div className="section-header">
                                    <FiUsers className="section-icon" />
                                    <h5>All Passengers ({booking.passenger_count})</h5>
                                </div>
                                
                                <div className="passenger-table-container">
                                    <table className="passenger-table">
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
                                                {tourPackage?.visa_required && <th>Processing Status</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                let passengers = []
                                                try {
                                                    if (booking.passenger_details) {
                                                        passengers = typeof booking.passenger_details === 'string' 
                                                            ? JSON.parse(booking.passenger_details) 
                                                            : booking.passenger_details
                                                    }
                                                } catch (error) {
                                                    console.error('Error parsing passenger details:', error)
                                                    passengers = []
                                                }
                                                
                                                if (passengers && passengers.length > 0) {
                                                    return passengers.map((passenger, index) => {
                                                        const doc = Array.isArray(passenger.documents) && passenger.documents.length > 0 ? passenger.documents[0] : null
                                                        const phoneObj = passenger.contact?.phones?.[0]
                                                        const phoneStr = phoneObj?.number ? `${phoneObj.countryCallingCode || ''} ${phoneObj.number}` : null
                                                        return (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>
                                                                    <div className="passenger-name">
                                                                        <strong>{passenger.name?.firstName || ''} {passenger.name?.lastName || ''}</strong>
                                                                        {index === 0 && <span className="lead-badge">Lead</span>}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span className={`passenger-type ${passenger.type?.toLowerCase() || 'adult'}`}>
                                                                        {passenger.type || 'Adult'}
                                                                    </span>
                                                                </td>
                                                                <td>{passenger.gender || <span className="no-data">-</span>}</td>
                                                                <td>
                                                                    {passenger.contact?.emailAddress ? (
                                                                        <a href={`mailto:${passenger.contact.emailAddress}`} className="email-link">
                                                                            <FiMail /> {passenger.contact.emailAddress}
                                                                        </a>
                                                                    ) : (
                                                                        <span className="no-data">-</span>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {phoneStr ? (
                                                                        <a href={`tel:${phoneObj?.countryCallingCode || ''}${phoneObj?.number || ''}`} className="phone-link">
                                                                            <FiPhone /> {phoneStr}
                                                                        </a>
                                                                    ) : (
                                                                        <span className="no-data">-</span>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {passenger.dateOfBirth ? (
                                                                        <span className="date-of-birth">
                                                                            {new Date(passenger.dateOfBirth).toLocaleDateString()}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="no-data">-</span>
                                                                    )}
                                                                </td>
                                                                <td>{doc?.number || <span className="no-data">-</span>}</td>
                                                                <td>{doc?.nationality || <span className="no-data">-</span>}</td>
                                                                <td>{doc?.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : <span className="no-data">-</span>}</td>
                                                                <td>
                                                                    <div className="visa-status-cell">
                                                                        {tourPackage?.visa_required ? (
                                                                            <>
                                                                                <span className={`visa-status-badge visa-status--${passenger.visa_status || 'visa_required'}`}>
                                                                                    {passenger.visa_status === 'needs_processing' ? 'Needs Processing' :
                                                                                     passenger.visa_status === 'already_has' ? 'Has Visa' :
                                                                                     'Visa Required'}
                                                                                </span>
                                                                                {passenger.visa_status === 'already_has' && passenger.existing_visa_status && (
                                                                                    <div className="visa-details">
                                                                                        <span className={`visa-existing-status visa-existing-status--${passenger.existing_visa_status}`}>
                                                                                            {passenger.existing_visa_status === 'valid' ? 'Valid' :
                                                                                             passenger.existing_visa_status === 'expired' ? 'Expired' :
                                                                                             passenger.existing_visa_status === 'expiring_soon' ? 'Expiring Soon' : 'Not Specified'}
                                                                                        </span>
                                                                                        {passenger.visa_expiry_date && (
                                                                                            <span className="visa-expiry">
                                                                                                Expires: {new Date(passenger.visa_expiry_date).toLocaleDateString()}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        ) : (
                                                                            <span className="visa-status-badge visa-status--not_applicable">
                                                                                Not Applicable
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                {tourPackage?.visa_required && (
                                                                    <td>
                                                                        <div className="processing-status-cell">
                                                                            {(() => {
                                                                                const visaProcessing = booking.visa_processings?.find(vp => vp.passenger_index === index)
                                                                                if (visaProcessing) {
                                                                                    return (
                                                                                        <>
                                                                                            <span className={`processing-status-badge processing-status--${visaProcessing.status.toLowerCase()}`}>
                                                                                                {visaProcessing.status}
                                                                                            </span>
                                                                                            <button 
                                                                                                className="visa-process-btn"
                                                                                                onClick={() => handleVisaProcessing(passenger, index)}
                                                                                                title="Manage Visa Processing"
                                                                                            >
                                                                                                Manage
                                                                                            </button>
                                                                                        </>
                                                                                    )
                                                                                } else if (passenger.visa_status === 'needs_processing') {
                                                                                    return (
                                                                                        <button 
                                                                                            className="visa-process-btn"
                                                                                            onClick={() => handleVisaProcessing(passenger, index)}
                                                                                            title="Start Visa Processing"
                                                                                        >
                                                                                            Start Processing
                                                                                        </button>
                                                                                    )
                                                                                } else {
                                                                                    return <span className="no-data">-</span>
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
                                                                <div className="passenger-name">
                                                                    <strong>{booking.lead_first_name} {booking.lead_last_name}</strong>
                                                                    <span className="lead-badge">Lead</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className="passenger-type adult">Lead Passenger</span>
                                                            </td>
                                                            <td>
                                                                <span className="no-data">-</span>
                                                            </td>
                                                            <td>
                                                                <a href={`mailto:${booking.lead_email}`} className="email-link">
                                                                    <FiMail /> {booking.lead_email}
                                                                </a>
                                                            </td>
                                                            <td>
                                                                <a href={`tel:${booking.lead_phone}`} className="phone-link">
                                                                    <FiPhone /> {booking.lead_phone}
                                                                </a>
                                                            </td>
                                                            <td>
                                                                <span className="no-data">-</span>
                                                            </td>
                                                            <td>
                                                                <span className="no-data">-</span>
                                                            </td>
                                                            <td>
                                                                <span className="no-data">-</span>
                                                            </td>
                                                            <td>
                                                                <span className="no-data">-</span>
                                                            </td>
                                                            <td>
                                                                <span className="visa-status-badge visa-status--not_applicable">
                                                                    Not Applicable
                                                                </span>
                                                            </td>
                                                            {tourPackage?.visa_required && (
                                                                <td>
                                                                    <span className="no-data">-</span>
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
                            <div className="lead-contact-summary">
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
                                        disabled={previewLoading}
                                    >
                                        {previewLoading ? (
                                            <>
                                                <div className="loading-spinner-small"></div>
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <FiEye /> Preview
                                            </>
                                        )}
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
                                    <li>Uncheck "Headers and Footers" in print options to remove browser watermarks</li>
                                    <li>Use the HTML preview to check the layout before generating the PDF</li>
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
                context="detail"
            />

            {/* Visa Processing Modal */}
            <VisaProcessingModal
                isOpen={visaProcessingModal.isOpen}
                onClose={handleVisaProcessingClose}
                passenger={visaProcessingModal.passenger}
                bookingId={id}
                onStatusUpdate={handleVisaStatusUpdate}
            />
        </div>
    )
}

export default TourBookingDetail
