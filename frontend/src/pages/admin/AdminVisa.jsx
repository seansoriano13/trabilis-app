import React, { useState, useEffect, useCallback } from 'react'
import { useSnackbar } from '../../context/SnackbarContext'
import { 
    FiShield, 
    FiUsers, 
    FiDollarSign, 
    FiTrendingUp, 
    FiMapPin,
    FiSearch,
    FiFilter,
    FiRefreshCw,
    FiEye,
    FiEdit,
    FiTrash2,
    FiCalendar,
    FiClock,
    FiUser,
    FiNavigation,
    FiUserPlus,
    FiFileText,
    FiDownload,
    FiMail,
    FiPhone,
    FiGlobe,
    FiMessageSquare,
    FiCheckCircle,
    FiXCircle,
    FiX,
    FiAlertCircle,
    FiClock as FiClockIcon,
    FiPackage
} from 'react-icons/fi'
import ReactPaginate from 'react-paginate'
import './AdminVisa.css'
import adminClient from '../../api/adminClient'
import AssignmentModal from '../../components/admin/AssignmentModal'

const AdminVisa = () => {
    const { showInfo } = useSnackbar()
    // Tab state
    const [activeTab, setActiveTab] = useState('inquiries')
    
    // Inquiries state (existing functionality)
    const [inquiries, setInquiries] = useState([])
    const [inquiryPage, setInquiryPage] = useState(0)
    const [inquiryTotal, setInquiryTotal] = useState(0)
    const [inquiryLoading, setInquiryLoading] = useState(true)
    const [inquirySearchLoading, setInquirySearchLoading] = useState(false)
    const [inquiryError, setInquiryError] = useState(null)
    const [inquirySort, setInquirySort] = useState({
        key: 'created_at',
        direction: 'desc',
    })
    const [inquiryFilters, setInquiryFilters] = useState({ 
        status: 'ALL', 
        visa_type: '', 
        destination: '',
        search: ''
    })
    const [inquirySearchInput] = useState('')
    const [assignmentModal, setAssignmentModal] = useState({
        isOpen: false,
        bookingId: null,
        bookingReference: '',
        bookingType: 'visa-inquiry'
    })

    // Visa Processing state (new functionality)
    const [visaProcessings, setVisaProcessings] = useState([])
    const [processingPage, setProcessingPage] = useState(0)
    const [processingTotal, setProcessingTotal] = useState(0)
    const [processingLoading, setProcessingLoading] = useState(false)
    const [processingSearchLoading, setProcessingSearchLoading] = useState(false)
    const [processingError, setProcessingError] = useState(null)
    const [processingSort, setProcessingSort] = useState({
        key: 'created_at',
        direction: 'desc',
    })
    const [processingFilters, setProcessingFilters] = useState({ 
        status: 'ALL', 
        country: '', 
        assigned_to: '',
        search: ''
    })
    const [processingSearchInput] = useState('')

    const pageSize = 20
    const jwt = localStorage.getItem('adminToken')
    const userRole = localStorage.getItem('admin_role')

    // Existing inquiries functions
    const fetchInquiries = useCallback(async (isInitialLoad = false) => {
        try {
            if (isInitialLoad) {
                setInquiryLoading(true)
            } else {
                setInquirySearchLoading(true)
            }
            const params = new URLSearchParams({
                page: inquiryPage + 1,
                limit: pageSize,
                status: inquiryFilters.status,
                ...(inquiryFilters.search && { search: inquiryFilters.search })
            })

            const response = await adminClient.get(`/visa/inquiries?${params}`)
            
            if (response.data.success) {
                setInquiries(response.data.data)
                setInquiryTotal(response.data.pagination?.total || 0)
            } else {
                setInquiryError('Failed to fetch inquiries')
            }
        } catch (error) {
            console.error('Error fetching inquiries:', error)
            setInquiryError('Error loading inquiries')
        } finally {
            setInquiryLoading(false)
            setInquirySearchLoading(false)
        }
    }, [inquiryPage, inquiryFilters, pageSize])

    // New visa processing functions
    const fetchVisaProcessings = useCallback(async (isInitialLoad = false) => {
        try {
            if (isInitialLoad) {
                setProcessingLoading(true)
            } else {
                setProcessingSearchLoading(true)
            }
            const params = new URLSearchParams({
                page: processingPage + 1,
                limit: pageSize,
                status: processingFilters.status,
                country: processingFilters.country,
                assigned_to: processingFilters.assigned_to,
                ...(processingFilters.search && { search: processingFilters.search })
            })

            const response = await adminClient.get(`/processings?${params}`, {
                baseURL: import.meta.env.VITE_BACKEND_URL + '/api/v1/visa-processing'
            })
            
            if (response.data.success) {
                setVisaProcessings(response.data.data || [])
                setProcessingTotal(response.data.pagination?.total || 0)
            } else {
                setProcessingError('Failed to fetch visa processings')
            }
        } catch (error) {
            console.error('Error fetching visa processings:', error)
            setProcessingError('Error loading visa processings')
        } finally {
            setProcessingLoading(false)
            setProcessingSearchLoading(false)
        }
    }, [processingPage, processingFilters, pageSize])

    // Load data based on active tab
    useEffect(() => {
        if (!jwt) {
            window.location.href = '/admin/login'
            return
        }
        
        if (activeTab === 'inquiries') {
            fetchInquiries()
        } else if (activeTab === 'processing') {
            fetchVisaProcessings()
        }
    }, [activeTab, inquiryPage, inquiryFilters, inquirySort, processingPage, processingFilters, processingSort, fetchInquiries, fetchVisaProcessings, jwt])

    // Fetch counts for both tabs on initial load
    useEffect(() => {
        if (!jwt) return
        
        const fetchCounts = async () => {
            try {
                // Fetch inquiry count
                const inquiryParams = new URLSearchParams({
                    page: 1,
                    limit: 1,
                    status: 'ALL'
                })
                const inquiryResponse = await adminClient.get(`/visa/inquiries?${inquiryParams}`)
                if (inquiryResponse.data.success) {
                    setInquiryTotal(inquiryResponse.data.pagination?.total || 0)
                }

                // Fetch processing count
                const processingParams = new URLSearchParams({
                    page: 1,
                    limit: 1,
                    status: 'ALL'
                })
                const processingResponse = await adminClient.get(`/processings?${processingParams}`, {
                    baseURL: import.meta.env.VITE_BACKEND_URL + '/api/v1/visa-processing'
                })
                if (processingResponse.data.success) {
                    setProcessingTotal(processingResponse.data.pagination?.total || 0)
                }
            } catch (error) {
                console.error('Error fetching counts:', error)
            }
        }

        fetchCounts()
    }, [jwt])

    // Debounced search for inquiries
    useEffect(() => {
        const timer = setTimeout(() => {
            setInquiryFilters(prev => ({ ...prev, search: inquirySearchInput }))
        }, 500)
        return () => clearTimeout(timer)
    }, [inquirySearchInput])

    // Debounced search for processing
    useEffect(() => {
        const timer = setTimeout(() => {
            setProcessingFilters(prev => ({ ...prev, search: processingSearchInput }))
        }, 500)
        return () => clearTimeout(timer)
    }, [processingSearchInput])

    const handleInquirySort = (key) => {
        setInquirySort(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const handleProcessingSort = (key) => {
        setProcessingSort(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const handleInquiryAssignment = (inquiryId, inquiryReference) => {
        setAssignmentModal({
            isOpen: true,
            bookingId: inquiryId,
            bookingReference: inquiryReference,
            bookingType: 'visa-inquiry'
        })
    }

    const handleProcessingAssignment = (processingId, processingReference) => {
        setAssignmentModal({
            isOpen: true,
            bookingId: processingId,
            bookingReference: processingReference,
            bookingType: 'visa-processing'
        })
    }

    const handleAssignmentSuccess = () => {
        if (activeTab === 'inquiries') {
            // Always refresh to get updated assigned staff information
            fetchInquiries()
        } else if (activeTab === 'processing') {
            // Always refresh to get updated assigned staff information
            fetchVisaProcessings()
        }
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'PENDING': { color: 'pending', label: 'Pending' },
            'IN_PROGRESS': { color: 'in-progress', label: 'In Progress' },
            'APPROVED': { color: 'approved', label: 'Approved' },
            'REJECTED': { color: 'rejected', label: 'Rejected' },
            'CANCELLED': { color: 'cancelled', label: 'Cancelled' },
            'COMPLETED': { color: 'completed', label: 'Completed' }
        }
        
        const config = statusConfig[status] || { color: 'default', label: status }
        return (
            <span className={`status-badge status-badge--${config.color}`}>
                {config.label}
            </span>
        )
    }

    const getAssignmentStatusBadge = (assignmentStatus) => {
        const statusConfig = {
            'pending': { color: 'pending', label: 'Pending' },
            'in_progress': { color: 'in-progress', label: 'In Progress' },
            'completed': { color: 'completed', label: 'Completed' }
        }
        
        const config = statusConfig[assignmentStatus] || { color: 'default', label: assignmentStatus }
        return (
            <span className={`assignment-status-badge assignment-status-badge--${config.color}`}>
                {config.label}
            </span>
        )
    }

    if (inquiryLoading && inquiries.length === 0 && activeTab === 'inquiries') {
        return (
            <div className="admin-visa">
                <div className="visa__loading">
                    <p>Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-visa">
            <div className="admin-visa__header">
                <div className="admin-visa__title">
                    <div className="admin-visa__header-icon">
                        <FiShield />
                    </div>
                    <div className="admin-visa__header-text">
                        <h1>Visa Management</h1>
                        <p>Manage visa inquiries and processing</p>
                    </div>
                </div>
                <button 
                    className="refresh-btn"
                    onClick={() => activeTab === 'inquiries' ? fetchInquiries() : fetchVisaProcessings()}
                    disabled={activeTab === 'inquiries' ? inquiryLoading : processingLoading}
                >
                    <FiRefreshCw className={(activeTab === 'inquiries' ? inquiryLoading : processingLoading) ? 'spinning' : ''} />
                    Refresh
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="visa-tabs">
                <button 
                    className={`tab-button ${activeTab === 'inquiries' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inquiries')}
                >
                    <FiMessageSquare className="tab-icon" />
                    Visa Inquiries
                    <span className="tab-count">{inquiryTotal}</span>
                </button>
                <button 
                    className={`tab-button ${activeTab === 'processing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('processing')}
                >
                    <FiPackage className="tab-icon" />
                    Visa Processing
                    <span className="tab-count">{processingTotal}</span>
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'inquiries' && (
                <div className="tab-content">
                    {/* Inquiries Stats */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FiUsers />
                            </div>
                            <div className="stat-content">
                                <h3>{inquiryTotal}</h3>
                                <p>Total Inquiries</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FiClockIcon />
                            </div>
                            <div className="stat-content">
                                <h3>{inquiries?.filter(i => i.status === 'PENDING').length || 0}</h3>
                                <p>Pending</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FiAlertCircle />
                            </div>
                            <div className="stat-content">
                                <h3>{inquiries?.filter(i => i.status === 'IN_PROGRESS').length || 0}</h3>
                                <p>In Progress</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FiCheckCircle />
                            </div>
                            <div className="stat-content">
                                <h3>{inquiries?.filter(i => i.status === 'COMPLETED').length || 0}</h3>
                                <p>Completed</p>
                            </div>
                        </div>
                    </div>

                    {/* Inquiries Table */}
                    <div className="table-container">
                        <div className="table-header">
                            <h3>Visa Inquiries</h3>
                            {inquirySearchLoading && (
                                <div className='visa__search-loading'>
                                    <div className='visa__search-spinner'></div>
                                    <span>Searching...</span>
                                </div>
                            )}
                        </div>
                        
                        {inquiryError && (
                            <div className="error-message">
                                <FiAlertCircle />
                                {inquiryError}
                            </div>
                        )}

                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th onClick={() => handleInquirySort('reference')}>
                                            Reference
                                        </th>
                                        <th onClick={() => handleInquirySort('created_at')}>
                                            Date
                                        </th>
                                        <th onClick={() => handleInquirySort('status')}>
                                            Status
                                        </th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Destination</th>
                                        <th>Visa Type</th>
                                        <th>Assignment</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inquiries?.map((inquiry) => (
                                        <tr key={inquiry.id}>
                                            <td className="reference-cell">
                                                <span className="reference-text">{inquiry.reference}</span>
                                            </td>
                                            <td>
                                                {new Date(inquiry.created_at).toLocaleDateString()}
                                            </td>
                                            <td>
                                                {getStatusBadge(inquiry.status)}
                                            </td>
                                            <td>
                                                <div className="name-cell">
                                                    <span className="name-text">
                                                        {inquiry.first_name} {inquiry.last_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <a href={`mailto:${inquiry.email}`} className="email-link">
                                                    <FiMail size={14} />
                                                    {inquiry.email}
                                                </a>
                                            </td>
                                            <td>
                                                <a href={`tel:${inquiry.phone}`} className="phone-link">
                                                    <FiPhone size={14} />
                                                    {inquiry.phone}
                                                </a>
                                            </td>
                                            <td>
                                                <span className="destination-text">{inquiry.destination}</span>
                                            </td>
                                            <td>
                                                <span className="visa-type-text">{inquiry.visa_type}</span>
                                            </td>
                                            <td>
                                                {inquiry.assigned_to ? (
                                                    <div className="assignment-info">
                                                        <span className="assigned-staff">
                                                            {inquiry.assigned_staff?.first_name} {inquiry.assigned_staff?.last_name}
                                                        </span>
                                                        {getAssignmentStatusBadge(inquiry.assignment_status)}
                                                    </div>
                                                ) : (
                                                    <span className="unassigned">Unassigned</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    {userRole === 'admin' && (
                                                        <button 
                                                            className="action-btn assign-btn"
                                                            onClick={() => handleInquiryAssignment(inquiry.id, inquiry.reference)}
                                                            title="Assign Inquiry"
                                                        >
                                                            <FiUserPlus size={16} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        className="action-btn view-btn"
                                                        onClick={() => {
                                                            // TODO: Implement inquiry details modal
                                                            showInfo(`View inquiry details for ${inquiry.reference}`)
                                                        }}
                                                        title="View Details"
                                                    >
                                                        <FiEye size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="pagination-container">
                            <ReactPaginate
                                previousLabel={'← Previous'}
                                nextLabel={'Next →'}
                                pageCount={Math.ceil(inquiryTotal / pageSize)}
                                onPageChange={({ selected }) => setInquiryPage(selected)}
                                containerClassName={'pagination'}
                                activeClassName={'pagination--active'}
                                forcePage={inquiryPage}
                                breakLabel={'...'}
                                pageRangeDisplayed={3}
                                marginPagesDisplayed={1}
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'processing' && (
                <div className="tab-content">
                    {/* Processing Stats */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FiPackage />
                            </div>
                            <div className="stat-content">
                                <h3>{processingTotal}</h3>
                                <p>Total Processings</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FiClockIcon />
                            </div>
                            <div className="stat-content">
                                <h3>{visaProcessings?.filter(p => p.status === 'PENDING').length || 0}</h3>
                                <p>Pending</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FiAlertCircle />
                            </div>
                            <div className="stat-content">
                                <h3>{visaProcessings?.filter(p => p.status === 'IN_PROGRESS').length || 0}</h3>
                                <p>In Progress</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FiCheckCircle />
                            </div>
                            <div className="stat-content">
                                <h3>{visaProcessings?.filter(p => p.status === 'APPROVED').length || 0}</h3>
                                <p>Approved</p>
                            </div>
                        </div>
                    </div>

                    {/* Processing Table */}
                    <div className="table-container">
                        <div className="table-header">
                            <h3>Visa Processing</h3>
                            {processingSearchLoading && (
                                <div className='visa__search-loading'>
                                    <div className='visa__search-spinner'></div>
                                    <span>Searching...</span>
                                </div>
                            )}
                        </div>
                        
                        {processingError && (
                            <div className="error-message">
                                <FiAlertCircle />
                                {processingError}
                            </div>
                        )}

                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th onClick={() => handleProcessingSort('id')}>
                                            ID
                                        </th>
                                        <th onClick={() => handleProcessingSort('created_at')}>
                                            Date
                                        </th>
                                        <th onClick={() => handleProcessingSort('status')}>
                                            Status
                                        </th>
                                        <th>Passenger</th>
                                        <th>Email</th>
                                        <th>Country</th>
                                        <th>Visa Type</th>
                                        <th>Tour Booking</th>
                                        <th>Assignment</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visaProcessings?.map((processing) => (
                                        <tr key={processing.id}>
                                            <td className="reference-cell">
                                                <span className="reference-text">#{processing.id}</span>
                                            </td>
                                            <td>
                                                {new Date(processing.created_at).toLocaleDateString()}
                                            </td>
                                            <td>
                                                {getStatusBadge(processing.status)}
                                            </td>
                                            <td>
                                                <div className="name-cell">
                                                    <span className="name-text">
                                                        {processing.passenger_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                {processing.passenger_email ? (
                                                    <a href={`mailto:${processing.passenger_email}`} className="email-link">
                                                        <FiMail size={14} />
                                                        {processing.passenger_email}
                                                    </a>
                                                ) : (
                                                    <span className="no-data">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="country-text">{processing.country}</span>
                                            </td>
                                            <td>
                                                <span className="visa-type-text">{processing.visa_type}</span>
                                            </td>
                                            <td>
                                                <a 
                                                    href={`/admin/tour-sales/${processing.tour_booking_id}`}
                                                    className="booking-link"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <FiNavigation size={14} />
                                                    View Booking
                                                </a>
                                            </td>
                                            <td>
                                                {processing.assigned_to ? (
                                                    <div className="assignment-info">
                                                        <span className="assigned-staff">
                                                            {processing.assigned_staff_first_name} {processing.assigned_staff_last_name}
                                                        </span>
                                                        {getAssignmentStatusBadge(processing.assignment_status)}
                                                    </div>
                                                ) : (
                                                    <span className="unassigned">Unassigned</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    {userRole === 'admin' && (
                                                        <button 
                                                            className="action-btn assign-btn"
                                                            onClick={() => handleProcessingAssignment(processing.id, `#${processing.id}`)}
                                                            title="Assign Processing"
                                                        >
                                                            <FiUserPlus size={16} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        className="action-btn view-btn"
                                                        onClick={() => {
                                                            // TODO: Open processing details modal
                                                            showInfo(`View processing details for #${processing.id}`)
                                                        }}
                                                        title="View Details"
                                                    >
                                                        <FiEye size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="pagination-container">
                            <ReactPaginate
                                previousLabel={'← Previous'}
                                nextLabel={'Next →'}
                                pageCount={Math.ceil(processingTotal / pageSize)}
                                onPageChange={({ selected }) => setProcessingPage(selected)}
                                containerClassName={'pagination'}
                                activeClassName={'pagination--active'}
                                forcePage={processingPage}
                                breakLabel={'...'}
                                pageRangeDisplayed={3}
                                marginPagesDisplayed={1}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Assignment Modal */}
            <AssignmentModal
                isOpen={assignmentModal.isOpen}
                onClose={() => setAssignmentModal({ isOpen: false, bookingId: null, bookingReference: '', bookingType: 'visa-inquiry' })}
                bookingId={assignmentModal.bookingId}
                bookingReference={assignmentModal.bookingReference}
                bookingType={assignmentModal.bookingType}
                onSuccess={handleAssignmentSuccess}
            />
        </div>
    )
}

export default AdminVisa
