import React, { useState, useEffect } from 'react'
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
    FiClock as FiClockIcon
} from 'react-icons/fi'
import ReactPaginate from 'react-paginate'
import './AdminVisaInquiries.css'
import adminClient from '../../api/adminClient'
import AssignmentModal from '../../components/admin/AssignmentModal'

const AdminVisaInquiries = () => {
    const [inquiries, setInquiries] = useState([])
    // const [inquiryStats, setInquiryStats] = useState({})
    const [page, setPage] = useState(0)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [sort, setSort] = useState({
        key: 'created_at',
        direction: 'desc',
    })
    const [filters, setFilters] = useState({ 
        status: 'ALL', 
        visa_type: '', 
        destination: '',
        search: ''
    })
    const [searchInput, setSearchInput] = useState('')
    const [selectedInquiry, setSelectedInquiry] = useState(null)
    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        inquiryId: null,
        currentStatus: '',
        notes: ''
    })
    const [assignmentModal, setAssignmentModal] = useState({
        isOpen: false,
        inquiryId: null,
        inquiryReference: '',
        inquiryType: 'visa'
    })

    const pageSize = 10
    const jwt = localStorage.getItem('adminToken')
    const userRole = localStorage.getItem('admin_role')

    useEffect(() => {
        if (!jwt) {
            window.location.href = '/admin/login'
            return
        }
        fetchInquiries()
    }, [page, filters, sort])

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput }))
        }, 500)
        return () => clearTimeout(timer)
    }, [searchInput])

    const fetchInquiries = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page + 1,
                limit: pageSize,
                status: filters.status,
                ...(filters.search && { search: filters.search })
            })

            const response = await adminClient.get(`/visa/inquiries?${params}`)
            
            if (response.data.success) {
                setInquiries(response.data.data)
                setTotal(response.data.pagination.total)
            } else {
                throw new Error(response.data.message || 'Failed to fetch inquiries')
            }
        } catch (err) {
            console.error('Error fetching visa inquiries:', err)
            setError(err.response?.data?.message || 'Failed to fetch visa inquiries')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (e) => {
        e.preventDefault()
        
        try {
            setLoading(true)
            setError(null)
            
            const response = await adminClient.put(
                `/visa/inquiries/${statusModal.inquiryId}/status`,
                {
                    status: statusModal.currentStatus,
                    notes: statusModal.notes
                }
            )

            if (response.data.success) {
                setStatusModal({ isOpen: false, inquiryId: null, currentStatus: '', notes: '' })
                await fetchInquiries()
            } else {
                throw new Error(response.data.message || 'Failed to update status')
            }
        } catch (err) {
            console.error('Error updating inquiry status:', err)
            setError(err.response?.data?.message || 'Failed to update inquiry status')
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <FiClockIcon className="status-icon status-pending" />
            case 'IN_PROGRESS':
                return <FiAlertCircle className="status-icon status-in-progress" />
            case 'COMPLETED':
                return <FiCheckCircle className="status-icon status-completed" />
            case 'CANCELLED':
                return <FiXCircle className="status-icon status-cancelled" />
            default:
                return <FiClockIcon className="status-icon status-pending" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return '#f59e0b'
            case 'IN_PROGRESS':
                return '#3b82f6'
            case 'COMPLETED':
                return '#10b981'
            case 'CANCELLED':
                return '#ef4444'
            default:
                return '#6b7280'
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleSort = (key) => {
        setSort(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const handlePageChange = ({ selected }) => {
        setPage(selected)
    }

    const handleAssignInquiry = (inquiryId, inquiryReference) => {
        setAssignmentModal({
            isOpen: true,
            inquiryId,
            inquiryReference,
            inquiryType: 'visa'
        })
    }

    const handleAssignmentSuccess = (updatedInquiry) => {
        // Update the specific inquiry in the list with assignment info
        if (updatedInquiry) {
            setInquiries(prev => 
                prev.map(inquiry => 
                    inquiry.id === updatedInquiry.id ? {
                        ...inquiry,
                        assigned_to: updatedInquiry.assigned_to,
                        assigned_by: updatedInquiry.assigned_by,
                        assigned_at: updatedInquiry.assigned_at,
                        assignment_status: updatedInquiry.assignment_status
                    } : inquiry
                )
            )
        } else {
            // Fallback: refresh entire data
            fetchInquiries()
        }
    }

    if (loading && inquiries.length === 0) {
        return (
            <div className="admin-visa-inquiries">
                <div className="visa-inquiries__loading">
                    <p>Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-visa-inquiries">
            <div className="admin-visa-inquiries__header">
                <div className="admin-visa-inquiries__title">
                    <div className="admin-visa-inquiries__header-icon">
                        <FiShield />
                    </div>
                    <div className="admin-visa-inquiries__header-text">
                        <h1>Visa Inquiries Management</h1>
                        <p>Manage and track visa consultation inquiries</p>
                    </div>
                </div>
                <button 
                    className="refresh-btn"
                    onClick={fetchInquiries}
                    disabled={loading}
                >
                    <FiRefreshCw className={loading ? 'spinning' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FiUsers />
                    </div>
                    <div className="stat-content">
                        <h3>{total}</h3>
                        <p>Total Inquiries</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FiClockIcon />
                    </div>
                    <div className="stat-content">
                        <h3>{inquiries.filter(i => i.status === 'PENDING').length}</h3>
                        <p>Pending</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FiAlertCircle />
                    </div>
                    <div className="stat-content">
                        <h3>{inquiries.filter(i => i.status === 'IN_PROGRESS').length}</h3>
                        <p>In Progress</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FiCheckCircle />
                    </div>
                    <div className="stat-content">
                        <h3>{inquiries.filter(i => i.status === 'COMPLETED').length}</h3>
                        <p>Completed</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or reference..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <FiXCircle />
                    {error}
                </div>
            )}

            {/* Inquiries Table */}
            <div className="inquiries-table-container">
                <table className="inquiries-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('inquiry_reference')}>
                                Reference
                                {sort.key === 'inquiry_reference' && (
                                    <span className="sort-indicator">
                                        {sort.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => handleSort('full_name')}>
                                Client
                                {sort.key === 'full_name' && (
                                    <span className="sort-indicator">
                                        {sort.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => handleSort('visa_type')}>
                                Visa Type
                                {sort.key === 'visa_type' && (
                                    <span className="sort-indicator">
                                        {sort.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => handleSort('destination')}>
                                Destination
                                {sort.key === 'destination' && (
                                    <span className="sort-indicator">
                                        {sort.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => handleSort('status')}>
                                Status
                                {sort.key === 'status' && (
                                    <span className="sort-indicator">
                                        {sort.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => handleSort('created_at')}>
                                Date
                                {sort.key === 'created_at' && (
                                    <span className="sort-indicator">
                                        {sort.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th>Assignment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inquiries.map((inquiry) => (
                            <tr key={inquiry.id}>
                                <td>
                                    <span className="reference-code">
                                        {inquiry.inquiry_reference}
                                    </span>
                                </td>
                                <td>
                                    <div className="client-info">
                                        <div className="client-name">{inquiry.full_name}</div>
                                        <div className="client-email">
                                            <FiMail />
                                            {inquiry.email_address}
                                        </div>
                                        <div className="client-phone">
                                            <FiPhone />
                                            {inquiry.mobile_number}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="visa-type">{inquiry.visa_type}</span>
                                </td>
                                <td>
                                    <span className="destination">
                                        <FiGlobe />
                                        {inquiry.destination}
                                    </span>
                                </td>
                                <td>
                                    <div className="status-cell">
                                        {getStatusIcon(inquiry.status)}
                                        <span 
                                            className="status-text"
                                            style={{ color: getStatusColor(inquiry.status) }}
                                        >
                                            {inquiry.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <span className="date">
                                        {formatDate(inquiry.created_at)}
                                    </span>
                                </td>
                                <td>
                                    <div className="assignment-cell">
                                        {inquiry.assigned_to ? (
                                            <div className="assignment-assigned">
                                                <div className="assignment-staff">
                                                    <span className="assignment-staff-name">
                                                        {inquiry.assigned_staff_first_name} {inquiry.assigned_staff_last_name}
                                                    </span>
                                                    <span className="assignment-staff-email">
                                                        {inquiry.assigned_staff_email}
                                                    </span>
                                                </div>
                                                <span className={`assignment-status assignment-status--${inquiry.assignment_status}`}>
                                                    {inquiry.assignment_status?.replace('_', ' ') || 'pending'}
                                                </span>
                                                <span className="assignment-date">
                                                    {inquiry.assigned_at ? new Date(inquiry.assigned_at).toLocaleDateString() : '-'}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="assignment-unassigned">Unassigned</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn view-btn"
                                            onClick={() => setSelectedInquiry(inquiry)}
                                            title="View Details"
                                        >
                                            <FiEye />
                                        </button>
                                        <button
                                            className="action-btn edit-btn"
                                            onClick={() => setStatusModal({
                                                isOpen: true,
                                                inquiryId: inquiry.id,
                                                currentStatus: inquiry.status,
                                                notes: inquiry.notes || ''
                                            })}
                                            title="Update Status"
                                        >
                                            <FiEdit />
                                        </button>
                                        {userRole === 'admin' && (
                                            <button
                                                className="action-btn assign-btn"
                                                onClick={() => handleAssignInquiry(inquiry.id, inquiry.inquiry_reference)}
                                                title="Assign to Staff"
                                            >
                                                <FiUserPlus />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {inquiries.length === 0 && !loading && (
                <div className="no-data">
                    <FiFileText />
                    <p>No visa inquiries found</p>
                </div>
            )}

            {/* Pagination */}
            {total > pageSize && (
                <ReactPaginate
                    previousLabel="Previous"
                    nextLabel="Next"
                    pageCount={Math.ceil(total / pageSize)}
                    onPageChange={handlePageChange}
                    containerClassName="pagination"
                    activeClassName="active"
                    disabledClassName="disabled"
                />
            )}

            {/* Inquiry Details Modal */}
            {selectedInquiry && (
                <div className="visa-inquiries__modal">
                    <div className="visa-inquiries__modal-content">
                        <div className="visa-inquiries__modal-header">
                            <div className="visa-inquiries__modal-title">
                                <FiEye size={24} />
                                <h2>Inquiry Details</h2>
                            </div>
                            <button
                                className="visa-inquiries__modal-close"
                                onClick={() => setSelectedInquiry(null)}
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="visa-inquiries__modal-body">
                            <div className="visa-inquiries__modal-section">
                                <h3>Client Information</h3>
                                <div className="visa-inquiries__modal-grid">
                                    <div className="visa-inquiries__modal-item">
                                        <label>Name:</label>
                                        <span>{selectedInquiry.full_name}</span>
                                    </div>
                                    <div className="visa-inquiries__modal-item">
                                        <label>Email:</label>
                                        <span>{selectedInquiry.email_address}</span>
                                    </div>
                                    <div className="visa-inquiries__modal-item">
                                        <label>Phone:</label>
                                        <span>{selectedInquiry.mobile_number}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="visa-inquiries__modal-section">
                                <h3>Visa Details</h3>
                                <div className="visa-inquiries__modal-grid">
                                    <div className="visa-inquiries__modal-item">
                                        <label>Reference:</label>
                                        <span>{selectedInquiry.inquiry_reference}</span>
                                    </div>
                                    <div className="visa-inquiries__modal-item">
                                        <label>Visa Type:</label>
                                        <span>{selectedInquiry.visa_type}</span>
                                    </div>
                                    <div className="visa-inquiries__modal-item">
                                        <label>Destination:</label>
                                        <span>{selectedInquiry.destination}</span>
                                    </div>
                                    <div className="visa-inquiries__modal-item">
                                        <label>Status:</label>
                                        <span 
                                            className="visa-inquiries__status-badge"
                                            style={{ color: getStatusColor(selectedInquiry.status) }}
                                        >
                                            {getStatusIcon(selectedInquiry.status)}
                                            {selectedInquiry.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="visa-inquiries__modal-section">
                                <h3>Message</h3>
                                <div className="visa-inquiries__message-content">
                                    <FiMessageSquare />
                                    <p>{selectedInquiry.message}</p>
                                </div>
                            </div>
                            {selectedInquiry.notes && (
                                <div className="visa-inquiries__modal-section">
                                    <h3>Admin Notes</h3>
                                    <div className="visa-inquiries__notes-content">
                                        <p>{selectedInquiry.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {statusModal.isOpen && (
                <div className="visa-inquiries__modal">
                    <div className="visa-inquiries__modal-content">
                        <div className="visa-inquiries__modal-header">
                            <div className="visa-inquiries__modal-title">
                                <FiEdit size={24} />
                                <h2>Update Inquiry Status</h2>
                            </div>
                            <button
                                className="visa-inquiries__modal-close"
                                onClick={() => setStatusModal({ isOpen: false, inquiryId: null, currentStatus: '', notes: '' })}
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleStatusUpdate} className="visa-inquiries__modal-form">
                            <div className="visa-inquiries__modal-form-group">
                                <label className="visa-inquiries__modal-label">
                                    <FiShield size={16} />
                                    Status
                                </label>
                                <select
                                    value={statusModal.currentStatus}
                                    onChange={(e) => setStatusModal(prev => ({ ...prev, currentStatus: e.target.value }))}
                                    className="visa-inquiries__modal-select"
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                            <div className="visa-inquiries__modal-form-group">
                                <label className="visa-inquiries__modal-label">
                                    <FiMessageSquare size={16} />
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={statusModal.notes}
                                    onChange={(e) => setStatusModal(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Add any notes about this inquiry..."
                                    rows="4"
                                    className="visa-inquiries__modal-textarea"
                                />
                            </div>
                            <div className="visa-inquiries__modal-actions">
                                <button 
                                    type="submit"
                                    className="visa-inquiries__modal-save"
                                    disabled={loading}
                                >
                                    <FiEdit size={16} />
                                    {loading ? 'Updating...' : 'Update Status'}
                                </button>
                                <button 
                                    type="button"
                                    className="visa-inquiries__modal-cancel"
                                    onClick={() => setStatusModal({ isOpen: false, inquiryId: null, currentStatus: '', notes: '' })}
                                    disabled={loading}
                                >
                                    <FiX size={16} />
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assignment Modal */}
            <AssignmentModal
                isOpen={assignmentModal.isOpen}
                onClose={() => setAssignmentModal({ isOpen: false, inquiryId: null, inquiryReference: '', inquiryType: 'visa' })}
                bookingId={assignmentModal.inquiryId}
                bookingReference={assignmentModal.inquiryReference}
                bookingType={assignmentModal.inquiryType}
                onSuccess={handleAssignmentSuccess}
            />
        </div>
    )
}

export default AdminVisaInquiries
