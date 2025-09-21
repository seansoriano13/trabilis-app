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
    BsEye
} from 'react-icons/bs'
import { supabase } from '../../api/supabaseClient'
import adminClient from '../../api/adminClient'
import './FlightBookingDetail.css'

const FlightBookingDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [booking, setBooking] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('overview')
    const [printLoading, setPrintLoading] = useState(false)
    const [previewLoading, setPreviewLoading] = useState(false)

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

                console.log('Booking data received:', data)
                setBooking(data)
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
            minute: '2-digit'
        })
    }

    const formatTime = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
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
                return <BsCheckCircle className="status-icon" />
            case 'PENDING':
            case 'PENDING_PAYMENT':
                return <BsClock className="status-icon" />
            case 'CANCELLED':
                return <BsXCircle className="status-icon" />
            default:
                return <BsClock className="status-icon" />
        }
    }

    const handlePrint = () => {
        window.print()
    }

    const handlePreview = async () => {
        if (!booking) return
        
        setPreviewLoading(true)
        try {
            // Use admin client with proper authentication for preview
            const response = await adminClient.get(`/flights/${booking.id}/html`, {
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
        } finally {
            setPreviewLoading(false)
        }
    }

    const handleEdit = () => {
        // TODO: Implement edit functionality
        console.log('Edit booking:', booking.id)
    }

    const handleCancel = () => {
        // TODO: Implement cancel functionality
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            console.log('Cancel booking:', booking.id)
        }
    }

    const handlePrintReceipt = async () => {
        if (!booking) return
        
        setPrintLoading(true)
        try {
            // Use the new admin PDF route that doesn't use PDFShift
            const response = await adminClient.get(`/flights/${booking.id}/pdfadmin`, {
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
            <div className="booking-detail">
                <div className="booking-detail__loading">
                    <div className="loading-spinner"></div>
                    <p>Loading booking details...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="booking-detail">
                <div className="booking-detail__error">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button 
                        className="btn btn-primary"
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
            <div className="booking-detail">
                <div className="booking-detail__error">
                    <h2>Booking Not Found</h2>
                    <p>The requested booking could not be found.</p>
                    <button 
                        className="btn btn-primary"
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

    const flightOffer = parseJsonField(booking.amadeus_flight_offer, 'amadeus_flight_offer')
    const passengerDetails = parseJsonField(booking.passenger_details, 'passenger_details')
    const searchCriteria = parseJsonField(booking.search_criteria, 'search_criteria')
    const eTicketNumbers = parseJsonField(booking.e_ticket_numbers, 'e_ticket_numbers')

    return (
        <div className="booking-detail">
            {/* Header */}
            <div className="booking-detail__header">
                <div className="booking-detail__breadcrumb">
                    <Link to="/admin/flights" className="breadcrumb-link">
                        <BsArrowLeft /> Flights
                    </Link>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">Booking Details</span>
                </div>
                
                <div className="booking-detail__title">
                    <BsFillAirplaneFill className="title-icon" />
                    <h1>Flight Booking Details</h1>
                </div>

                <div className="booking-detail__actions">
                    <button className="btn btn-secondary" onClick={handlePrint}>
                        <BsPrinter /> Print
                    </button>
                    <button className="btn btn-warning" onClick={handleEdit}>
                        <BsPencil /> Edit
                    </button>
                    <button className="btn btn-danger" onClick={handleCancel}>
                        <BsXCircle /> Cancel
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            <div className={`booking-detail__status ${getStatusColor(booking.status)}`}>
                <div className="status-content">
                    {getStatusIcon(booking.status)}
                    <div>
                        <h3>Booking Status: {booking.status === 'TICKETED' ? 'Confirmed' : booking.status}</h3>
                        <p>Reference: {booking.booking_reference}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="booking-detail__tabs">
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
            <div className="booking-detail__content">
                {activeTab === 'overview' && (
                    <div className="tab-content">
                        <div className="overview-header">
                            <h3><BsFillAirplaneFill /> Booking Overview</h3>
                            <p>Complete summary of your flight booking details</p>
                        </div>
                        
                        <div className="overview-grid">
                            <div className="overview-card">
                                <div className="card-header">
                                    <BsFillAirplaneFill className="card-icon" />
                                    <h4>Flight Information</h4>
                                </div>
                                <div className="card-content">
                                    <div className="info-item">
                                        <span className="label">Route:</span>
                                        <span className="value route">
                                            {searchCriteria?.origin} → {searchCriteria?.destination}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Departure:</span>
                                        <span className="value">{searchCriteria?.outboundDeparture}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Return:</span>
                                        <span className="value">{searchCriteria?.inboundDeparture || 'One-way'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Passengers:</span>
                                        <span className="value">
                                            {searchCriteria?.travelerCount?.adults || 0} Adult(s), 
                                            {searchCriteria?.travelerCount?.children || 0} Child(ren)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="overview-card">
                                <div className="card-header">
                                    <BsPerson className="card-icon" />
                                    <h4>Passenger Summary</h4>
                                </div>
                                <div className="card-content">
                                    {passengerDetails?.travelers?.map((traveler, index) => (
                                        <div key={index} className="passenger-item">
                                            <div className="passenger-avatar">
                                                {traveler.name?.firstName?.charAt(0)}{traveler.name?.lastName?.charAt(0)}
                                            </div>
                                            <div className="passenger-info">
                                                <div className="passenger-name">
                                                    {traveler.name?.firstName} {traveler.name?.lastName}
                                                </div>
                                                <div className="passenger-type">{traveler.type}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="overview-card">
                                <div className="card-header">
                                    <BsCreditCard className="card-icon" />
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
                                        <span className="label">Currency:</span>
                                        <span className="value">{booking.currency}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">PNR:</span>
                                        <span className="value">{booking.pnr || 'Not assigned'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Status:</span>
                                        <span className={`value status ${getStatusColor(booking.status)}`}>
                                            {booking.status === 'TICKETED' ? 'Confirmed' : booking.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'passenger' && (
                    <div className="tab-content">
                        <div className="passenger-header">
                            <h3><BsPerson /> Passenger Details</h3>
                            <p>Complete passenger information and travel documents</p>
                        </div>
                        
                        <div className="passenger-details">
                            {passengerDetails?.travelers?.map((traveler, index) => (
                                <div key={index} className="passenger-card">
                                    <div className="passenger-card-header">
                                        <div className="passenger-avatar-large">
                                            {traveler.name?.firstName?.charAt(0)}{traveler.name?.lastName?.charAt(0)}
                                        </div>
                                        <div className="passenger-title">
                                            <h4>Passenger {index + 1}</h4>
                                            <p>{traveler.name?.firstName} {traveler.name?.lastName}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="passenger-sections">
                                        <div className="info-section">
                                            <div className="section-header">
                                                <BsPerson className="section-icon" />
                                                <h5>Personal Information</h5>
                                            </div>
                                            <div className="info-grid">
                                                <div className="info-item">
                                                    <span className="label">Full Name:</span>
                                                    <span className="value">
                                                        {traveler.name?.firstName} {traveler.name?.lastName}
                                                    </span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="label">Title:</span>
                                                    <span className="value">{traveler.title}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="label">Type:</span>
                                                    <span className="value">{traveler.type}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="label">Gender:</span>
                                                    <span className="value">{traveler.gender}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="label">Date of Birth:</span>
                                                    <span className="value">
                                                        {traveler.dateOfBirth ? 
                                                            new Date(traveler.dateOfBirth).toLocaleDateString() : '-'
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="info-section">
                                            <div className="section-header">
                                                <BsEnvelope className="section-icon" />
                                                <h5>Contact Information</h5>
                                            </div>
                                            <div className="info-grid">
                                                <div className="info-item">
                                                    <span className="label">Email:</span>
                                                    <span className="value">
                                                        <BsEnvelope /> {traveler.contact?.emailAddress}
                                                    </span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="label">Phone:</span>
                                                    <span className="value">
                                                        <BsTelephone /> +{traveler.contact?.phones?.[0]?.countryCallingCode} {traveler.contact?.phones?.[0]?.number}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="info-section">
                                            <div className="section-header">
                                                <BsCreditCard className="section-icon" />
                                                <h5>Document Information</h5>
                                            </div>
                                            {traveler.documents?.map((doc, docIndex) => (
                                                <div key={docIndex} className="document-card">
                                                    <div className="document-header">
                                                        <span className="document-type">{doc.documentType}</span>
                                                        <span className="document-number">{doc.number}</span>
                                                    </div>
                                                    <div className="info-grid">
                                                        <div className="info-item">
                                                            <span className="label">Nationality:</span>
                                                            <span className="value">{doc.nationality}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="label">Expiry Date:</span>
                                                            <span className="value">
                                                                {doc.expiryDate ? 
                                                                    new Date(doc.expiryDate).toLocaleDateString() : '-'
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="label">Issuance Country:</span>
                                                            <span className="value">{doc.issuanceCountry}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Contact Information */}
                            {passengerDetails?.contacts && (
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
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'flight' && (
                    <div className="tab-content">
                        <div className="flight-header">
                            <h3><BsFillAirplaneFill /> Flight Details</h3>
                            <p>Complete flight itinerary and pricing information</p>
                        </div>
                        
                        <div className="flight-details">
                            {flightOffer?.itineraries?.map((itinerary, index) => (
                                <div key={index} className="itinerary-card">
                                    <div className="itinerary-header">
                                        <div className="itinerary-title">
                                            <BsFillAirplaneFill className="itinerary-icon" />
                                            <h4>{index === 0 ? 'Outbound Flight' : 'Return Flight'}</h4>
                                        </div>
                                        <div className="flight-date">
                                            {formatDate(itinerary.segments[0]?.departure?.at)}
                                        </div>
                                    </div>
                                    
                                    {itinerary.segments?.map((segment, segIndex) => (
                                        <div key={segIndex} className="segment-card">
                                            <div className="segment-header">
                                                <div className="airline-info">
                                                    <div className="airline-logo">
                                                        <span className="airline-code">{segment.carrierCode}</span>
                                                    </div>
                                                    <div className="flight-info">
                                                        <span className="flight-number">{segment.number}</span>
                                                        <span className="aircraft-info">Aircraft: {segment.aircraft?.code}</span>
                                                    </div>
                                                </div>
                                                <div className="flight-status">
                                                    <span className="status-badge">
                                                        {segment.numberOfStops === 0 ? 'Direct' : `${segment.numberOfStops} stop(s)`}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="segment-route">
                                                <div className="airport-departure">
                                                    <div className="airport-code">{segment.departure?.iataCode}</div>
                                                    <div className="airport-name">Departure</div>
                                                    <div className="airport-time">{formatTime(segment.departure?.at)}</div>
                                                    <div className="airport-date">{formatDate(segment.departure?.at)}</div>
                                                    <div className="airport-terminal">Terminal {segment.departure?.terminal}</div>
                                                </div>

                                                <div className="flight-path">
                                                    <div className="flight-duration">{segment.duration}</div>
                                                    <div className="flight-arrow">✈</div>
                                                </div>

                                                <div className="airport-arrival">
                                                    <div className="airport-code">{segment.arrival?.iataCode}</div>
                                                    <div className="airport-name">Arrival</div>
                                                    <div className="airport-time">{formatTime(segment.arrival?.at)}</div>
                                                    <div className="airport-date">{formatDate(segment.arrival?.at)}</div>
                                                    <div className="airport-terminal">Terminal {segment.arrival?.terminal}</div>
                                                </div>
                                            </div>

                                            <div className="segment-details">
                                                <div className="detail-item">
                                                    <span className="label">Operating Carrier:</span>
                                                    <span className="value">{segment.operating?.carrierCode}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="label">CO2 Emissions:</span>
                                                    <span className="value">
                                                        {segment.co2Emissions?.[0]?.weight} {segment.co2Emissions?.[0]?.weightUnit}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {/* Pricing Information */}
                            {flightOffer?.travelerPricings && (
                                <div className="pricing-card">
                                    <div className="pricing-header">
                                        <BsCreditCard className="pricing-icon" />
                                        <h4>Pricing Details</h4>
                                    </div>
                                    <div className="pricing-content">
                                        {flightOffer.travelerPricings.map((pricing, index) => (
                                            <div key={index} className="pricing-item">
                                                <div className="pricing-item-header">
                                                    <span className="traveler-type">{pricing.travelerType}</span>
                                                    <span className="fare-option">{pricing.fareOption}</span>
                                                </div>
                                                <div className="pricing-breakdown">
                                                    <div className="price-item">
                                                        <span className="label">Base Price:</span>
                                                        <span className="value">₱{parseFloat(pricing.price?.base || 0).toLocaleString()}</span>
                                                    </div>
                                                    {pricing.price?.taxes?.map((tax, taxIndex) => (
                                                        <div key={taxIndex} className="price-item">
                                                            <span className="label">Tax ({tax.code}):</span>
                                                            <span className="value">₱{parseFloat(tax.amount || 0).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                    <div className="price-item total">
                                                        <span className="label">Total:</span>
                                                        <span className="value">₱{parseFloat(pricing.price?.total || 0).toLocaleString()}</span>
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
                    <div className="tab-content">
                        <div className="payment-header">
                            <h3><BsCreditCard /> Payment Information</h3>
                            <p>Complete payment details and transaction information</p>
                        </div>
                        
                        <div className="payment-details">
                            <div className="payment-card">
                                <div className="payment-card-header">
                                    <BsCreditCard className="payment-icon" />
                                    <h4>Payment Summary</h4>
                                </div>
                                <div className="payment-content">
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="label">Total Amount:</span>
                                            <span className="value amount">₱{parseFloat(booking.total_amount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Currency:</span>
                                            <span className="value">{booking.currency}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Payment Status:</span>
                                            <span className={`value status ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Stripe Checkout ID:</span>
                                            <span className="value">{booking.stripe_checkout_id || 'Not available'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Amadeus Order ID:</span>
                                            <span className="value">{booking.amadeus_order_id || 'Not available'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {eTicketNumbers && (
                                <div className="ticket-card">
                                    <div className="ticket-header">
                                        <BsCheckCircle className="ticket-icon" />
                                        <h4>E-Ticket Numbers</h4>
                                    </div>
                                    <div className="ticket-content">
                                        <div className="ticket-list">
                                            {eTicketNumbers.map((ticket, index) => (
                                                <div key={index} className="ticket-item">
                                                    <div className="ticket-number">{ticket}</div>
                                                    <div className="ticket-status">Confirmed</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {flightOffer?.price && (
                                <div className="price-breakdown-card">
                                    <div className="price-breakdown-header">
                                        <BsCalendar className="price-icon" />
                                        <h4>Price Breakdown</h4>
                                    </div>
                                    <div className="price-breakdown-content">
                                        <div className="price-breakdown">
                                            <div className="price-item">
                                                <span className="label">Base Price:</span>
                                                <span className="value">₱{parseFloat(flightOffer.price?.base || 0).toLocaleString()}</span>
                                            </div>
                                            {flightOffer.price?.fees?.map((fee, index) => (
                                                <div key={index} className="price-item">
                                                    <span className="label">Fee ({fee.type}):</span>
                                                    <span className="value">₱{parseFloat(fee.amount || 0).toLocaleString()}</span>
                                                </div>
                                            ))}
                                            <div className="price-item total">
                                                <span className="label">Grand Total:</span>
                                                <span className="value">₱{parseFloat(flightOffer.price?.grandTotal || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'pdf' && (
                    <div className="tab-content">
                        <div className="pdf-receipt">
                            <div className="pdf-header">
                                <h3><BsFileEarmarkPdf /> Flight Itinerary PDF</h3>
                                <p>Download the official flight itinerary PDF receipt</p>
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
                                                <BsEye /> Preview
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
                                                <BsPrinter /> Generate PDF
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
                                            {booking.status === 'TICKETED' ? 'Confirmed' : booking.status}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">File Name:</span>
                                        <span className="value">
                                            Flight-Itinerary-{booking.booking_reference}.pdf
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
                                    <li>This admin version uses print-optimized HTML instead of PDFShift for faster generation</li>
                                    <li>The document contains the complete flight itinerary with all passenger and flight details</li>
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
        </div>
    )
}

export default FlightBookingDetail
