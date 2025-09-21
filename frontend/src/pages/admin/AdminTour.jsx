// AdminTour.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
    FiMap, 
    FiUsers, 
    FiDollarSign, 
    FiTrendingUp, 
    FiPackage,
    FiSearch,
    FiFilter,
    FiRefreshCw,
    FiEye,
    FiEdit,
    FiTrash2,
    FiUserPlus,
    FiFileText,
    FiDownload
} from 'react-icons/fi'
import ReactPaginate from 'react-paginate'
import './AdminTour.css'
import { supabase } from '../../api/supabaseClient'
import AssignmentModal from '../../components/admin/AssignmentModal'
import adminClient from '../../api/adminClient'

const AdminTours = () => {
    const [tourBookings, setTourBookings] = useState([])
    const [tourStats, setTourStats] = useState({})
    const [page, setPage] = useState(0)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [sort, setSort] = useState({
        key: 'created_at',
        direction: 'asc',
    })
    const [filters, setFilters] = useState({ status: 'All', package_name: '', reference: '' })
    const [searchInput, setSearchInput] = useState('')
    const [referenceInput, setReferenceInput] = useState('')
    const [assignmentModal, setAssignmentModal] = useState({
        isOpen: false,
        bookingId: null,
        bookingReference: '',
        bookingType: 'tour'
    })

    const pageSize = 5
    const jwt = localStorage.getItem('adminToken')
    const userRole = localStorage.getItem('admin_role')

    useEffect(() => {
        if (jwt) {
            supabase.auth.setSession({ access_token: jwt })
        }
    }, [jwt])

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prev) => ({ ...prev, package_name: searchInput }))
        }, 500)

        return () => clearTimeout(timer)
    }, [searchInput])

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prev) => ({ ...prev, reference: referenceInput }))
        }, 500)

        return () => clearTimeout(timer)
    }, [referenceInput])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                let query = supabase
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
              tour_packages (title)
            ),
            assigned_staff:assigned_to (
              id,
              first_name,
              last_name,
              email
            )
          `,
                        { count: 'exact' }
                    )
                    .range(page * pageSize, (page + 1) * pageSize - 1)
                    .order(sort.key, { ascending: sort.direction === 'asc' })

                if (filters.status && filters.status !== 'All') {
                    query = query.eq('status', filters.status)
                }
                if (filters.package_name) {
                    query = query.ilike(
                        'package_dates.tour_packages.title',
                        `%${filters.package_name}%`
                    )
                }
                if (filters.reference) {
                    query = query.ilike(
                        'booking_reference',
                        `%${filters.reference}%`
                    )
                }

                const [bookingsRes, statsRes] = await Promise.all([
                    query,
                    supabase.rpc('get_tour_stats'),
                ])

                if (bookingsRes.error || statsRes.error) {
                    throw new Error('Failed to fetch data')
                }

                setTourBookings(bookingsRes.data)
                setTourStats(statsRes.data[0] || {})
                setTotal(bookingsRes.count || 0)
                setLoading(false)
            } catch (err) {
                console.error(err)
                setError('Failed to load tours. Please try again.')
                setLoading(false)
            }
        }

        fetchData()
    }, [page, filters, sort, jwt])

    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((o, k) => o?.[k], obj) || ''
    }

    const handleSort = (key) => {
        setSort((prev) => ({
            key,
            direction:
                prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }))
        setPage(0)
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        if (name === 'package_name') {
            setSearchInput(value)
        } else if (name === 'reference') {
            setReferenceInput(value)
        } else {
            setFilters((prev) => ({ ...prev, [name]: value }))
            setPage(0)
        }
    }

    const clearFilters = () => {
        setFilters({ status: 'All', package_name: '', reference: '' })
        setSearchInput('')
        setReferenceInput('')
        setPage(0)
    }

    const handleAssignBooking = (bookingId, bookingReference) => {
        setAssignmentModal({
            isOpen: true,
            bookingId,
            bookingReference,
            bookingType: 'tour'
        })
    }

    const handleAssignmentSuccess = (updatedBooking) => {
        // Refresh the data to show updated assignment
        setTourBookings(prev => 
            prev.map(booking => 
                booking.id === updatedBooking.id ? updatedBooking : booking
            )
        )
    }

    const handlePreviewPDF = async (bookingId) => {
        try {
            const token = localStorage.getItem('adminToken')
            const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/tours/${bookingId}/html`
            window.open(`${url}?token=${token}`, '_blank')
        } catch (error) {
            console.error('Error opening PDF preview:', error)
        }
    }

    const handleDownloadPDF = async (bookingId) => {
        try {
            const token = localStorage.getItem('adminToken')
            const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/tours/${bookingId}/pdf`
            window.open(`${url}?token=${token}`, '_blank')
        } catch (error) {
            console.error('Error downloading PDF:', error)
        }
    }


    if (loading) {
        return <div className='tours__loading'>Loading...</div>
    }

    if (error) {
        return (
            <div className='tours__error'>
                <p>{error}</p>
                <button
                    className='tours__retry'
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className='tours'>
            <div className='tours__header'>
                <div className='tours__header-content'>
                    <div className='tours__header-icon'>
                        <FiMap size={32} />
                    </div>
                    <div className='tours__header-text'>
                        <h1>Tour Sales Management</h1>
                        <p>Manage and monitor all tour bookings and sales</p>
                    </div>
                </div>
                <div className='tours__header-actions'>
                    <button className='tours__action-btn tours__action-btn--refresh'>
                        <FiRefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className='tours__summary'>
                <div className='tours__summary-card tours__summary-card--bookings'>
                    <div className='tours__summary-icon'>
                        <FiUsers size={24} />
                    </div>
                    <div className='tours__summary-content'>
                        <h3>Total Bookings</h3>
                        <p>{tourStats.total_bookings || 0}</p>
                        <span className='tours__summary-label'>Active bookings</span>
                    </div>
                </div>
                <div className='tours__summary-card tours__summary-card--revenue'>
                    <div className='tours__summary-icon'>
                        <FiDollarSign size={24} />
                    </div>
                    <div className='tours__summary-content'>
                        <h3>Total Revenue</h3>
                        <p>₱{(tourStats.total_revenue || 0).toLocaleString()}</p>
                        <span className='tours__summary-label'>All time</span>
                    </div>
                </div>
                <div className='tours__summary-card tours__summary-card--average'>
                    <div className='tours__summary-icon'>
                        <FiTrendingUp size={24} />
                    </div>
                    <div className='tours__summary-content'>
                        <h3>Avg. Booking Cost</h3>
                        <p>₱{(tourStats.avg_booking_cost || 0).toLocaleString()}</p>
                        <span className='tours__summary-label'>Per booking</span>
                    </div>
                </div>
                <div className='tours__summary-card tours__summary-card--popular'>
                    <div className='tours__summary-icon'>
                        <FiPackage size={24} />
                    </div>
                    <div className='tours__summary-content'>
                        <h3>Top Package</h3>
                        <p>{tourStats.popular_package || '-'}</p>
                        <span className='tours__summary-label'>Most booked</span>
                    </div>
                </div>
            </div>

            <div className='tours__filter'>
                <div className='tours__filter-header'>
                    <FiFilter size={20} />
                    <h3>Filters & Search</h3>
                </div>
                <div className='tours__filter-content'>
                    <div className='tours__filter-group'>
                        <label className='tours__filter-label'>
                            <FiPackage size={16} />
                            Status
                        </label>
                        <select
                            name='status'
                            value={filters.status}
                            onChange={handleFilterChange}
                            className='tours__filter-select'
                        >
                            <option value='All'>All Statuses</option>
                            <option value='CONFIRMED'>Confirmed</option>
                            <option value='PENDING_PAYMENT'>Pending Payment</option>
                            <option value='CANCELLED'>Cancelled</option>
                        </select>
                    </div>
                    <div className='tours__filter-group'>
                        <label className='tours__filter-label'>
                            <FiSearch size={16} />
                            Search Package
                        </label>
                        <input
                            type='text'
                            name='package_name'
                            value={searchInput}
                            onChange={handleFilterChange}
                            placeholder='Search Package (e.g., Boracay Tour)'
                            className='tours__filter-input'
                        />
                    </div>
                    <div className='tours__filter-group'>
                        <label className='tours__filter-label'>
                            <FiSearch size={16} />
                            Search Reference
                        </label>
                        <input
                            type='text'
                            name='reference'
                            value={referenceInput}
                            onChange={handleFilterChange}
                            placeholder='Search Reference (e.g., TR123)'
                            className='tours__filter-input'
                        />
                    </div>
                    <div className='tours__filter-actions'>
                        <button
                            className='tours__filter-clear'
                            onClick={clearFilters}
                        >
                            <FiRefreshCw size={16} />
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className='tours__section'>
                <div className='tours__section-header'>
                    <div className='tours__section-title'>
                        <FiPackage size={24} />
                        <h2>Tour Bookings</h2>
                        <span className='tours__section-count'>({total} bookings)</span>
                    </div>
                    {/* <div className='tours__section-actions'>
                        <button className='tours__action-btn tours__action-btn--export'>
                            <FiTrendingUp size={16} />
                            Export
                        </button>
                    </div> */}
                </div>
                
                <div className='tours__table-container'>
                    <table className='tours__table'>
                        <thead>
                            <tr>
                                <th
                                    onClick={() => handleSort('booking_reference')}
                                    className='tours__table-header tours__table-header--sortable'
                                >
                                    <div className='tours__table-header-content'>
                                        <span>Reference</span>
                                        {sort.key === 'booking_reference' && (
                                            <span className='tours__sort-indicator'>
                                                {sort.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th 
                                    onClick={() => handleSort('status')}
                                    className='tours__table-header tours__table-header--sortable'
                                >
                                    <div className='tours__table-header-content'>
                                        <span>Status</span>
                                        {sort.key === 'status' && (
                                            <span className='tours__sort-indicator'>
                                                {sort.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('package_dates.tour_packages.title')}
                                    className='tours__table-header tours__table-header--sortable'
                                >
                                    <div className='tours__table-header-content'>
                                        <span>Package</span>
                                        {sort.key === 'package_dates.tour_packages.title' && (
                                            <span className='tours__sort-indicator'>
                                                {sort.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('package_dates.start_date')}
                                    className='tours__table-header tours__table-header--sortable'
                                >
                                    <div className='tours__table-header-content'>
                                        <span>Start Date</span>
                                        {sort.key === 'package_dates.start_date' && (
                                            <span className='tours__sort-indicator'>
                                                {sort.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('package_dates.end_date')}
                                    className='tours__table-header tours__table-header--sortable'
                                >
                                    <div className='tours__table-header-content'>
                                        <span>End Date</span>
                                        {sort.key === 'package_dates.end_date' && (
                                            <span className='tours__sort-indicator'>
                                                {sort.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('passenger_count')}
                                    className='tours__table-header tours__table-header--sortable'
                                >
                                    <div className='tours__table-header-content'>
                                        <span>Passengers</span>
                                        {sort.key === 'passenger_count' && (
                                            <span className='tours__sort-indicator'>
                                                {sort.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className='tours__table-header'>Lead Contact</th>
                                <th 
                                    onClick={() => handleSort('total_amount')}
                                    className='tours__table-header tours__table-header--sortable'
                                >
                                    <div className='tours__table-header-content'>
                                        <span>Amount</span>
                                        {sort.key === 'total_amount' && (
                                            <span className='tours__sort-indicator'>
                                                {sort.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className='tours__table-header'>Assignment</th>
                                <th className='tours__table-header'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tourBookings.map((booking) => (
                                <tr key={booking.id} className='tours__table-row'>
                                    <td className='tours__table-cell tours__table-cell--reference'>
                                        <Link 
                                            to={`/admin/tour-sales/${booking.id}`}
                                            className='tours__booking-link'
                                        >
                                            {booking.booking_reference}
                                        </Link>
                                    </td>
                                    <td className='tours__table-cell'>
                                        <span className={`tours__status tours__status--${booking.status.toLowerCase()}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className='tours__table-cell tours__table-cell--package'>
                                        <div className='tours__package-info'>
                                            <span className='tours__package-name'>
                                                {getNestedValue(booking, 'package_dates.tour_packages.title') || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className='tours__table-cell'>
                                        {booking.package_dates?.start_date ? 
                                            new Date(booking.package_dates.start_date).toLocaleDateString() : '-'
                                        }
                                    </td>
                                    <td className='tours__table-cell'>
                                        {booking.package_dates?.end_date ? 
                                            new Date(booking.package_dates.end_date).toLocaleDateString() : '-'
                                        }
                                    </td>
                                    <td className='tours__table-cell tours__table-cell--passengers'>
                                        <div className='tours__passenger-count'>
                                            <FiUsers size={16} />
                                            <span>{booking.passenger_count}</span>
                                        </div>
                                    </td>
                                    <td className='tours__table-cell tours__table-cell--lead'>
                                        <div className='tours__lead-info'>
                                            <div className='tours__lead-name'>
                                                {booking.lead_first_name} {booking.lead_last_name}
                                            </div>
                                            <div className='tours__lead-email'>
                                                {booking.lead_email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className='tours__table-cell tours__table-cell--amount'>
                                        <div className='tours__amount'>
                                            <span className='tours__amount-value'>
                                                ₱{(booking.total_amount || 0).toLocaleString()}
                                            </span>
                                            <span className='tours__payment-type'>
                                                {booking.payment_type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className='tours__table-cell tours__table-cell--assignment'>
                                        <div className='tours__assignment'>
                                            {booking.assigned_to ? (
                                                <div className='tours__assignment-assigned'>
                                                    <div className='tours__assignment-staff'>
                                                        <span className='tours__assignment-staff-name'>
                                                            {booking.assigned_staff?.first_name} {booking.assigned_staff?.last_name}
                                                        </span>
                                                        <span className='tours__assignment-staff-email'>
                                                            {booking.assigned_staff?.email}
                                                        </span>
                                                    </div>
                                                    <span className={`tours__assignment-status tours__assignment-status--${booking.assignment_status}`}>
                                                        {booking.assignment_status?.replace('_', ' ') || 'pending'}
                                                    </span>
                                                    <span className='tours__assignment-date'>
                                                        {booking.assigned_at ? new Date(booking.assigned_at).toLocaleDateString() : '-'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className='tours__assignment-unassigned'>Unassigned</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className='tours__table-cell tours__table-cell--actions'>
                                        <div className='tours__actions'>
                                            <Link 
                                                to={`/admin/tour-sales/${booking.id}`}
                                                className='tours__action-btn tours__action-btn--view'
                                                title='View Details'
                                            >
                                                <FiEye size={16} />
                                            </Link>
                                            {userRole === 'admin' && (
                                                <button 
                                                    className='tours__action-btn tours__action-btn--assign'
                                                    title='Assign to Accounting'
                                                    onClick={() => handleAssignBooking(booking.id, booking.booking_reference)}
                                                >
                                                    <FiUserPlus size={16} />
                                                </button>
                                            )}
                                            <button 
                                                className='tours__action-btn tours__action-btn--edit'
                                                title='Edit Booking'
                                            >
                                                <FiEdit size={16} />
                                            </button>
                                            <button 
                                                className='tours__action-btn tours__action-btn--pdf-preview'
                                                title='Preview PDF'
                                                onClick={() => handlePreviewPDF(booking.id)}
                                            >
                                                <FiFileText size={16} />
                                            </button>
                                            <button 
                                                className='tours__action-btn tours__action-btn--pdf-download'
                                                title='Download PDF'
                                                onClick={() => handleDownloadPDF(booking.id)}
                                            >
                                                <FiDownload size={16} />
                                            </button>
                                            <button 
                                                className='tours__action-btn tours__action-btn--delete'
                                                title='Cancel Booking'
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className='tours__pagination-container'>
                    <ReactPaginate
                        previousLabel={'← Previous'}
                        nextLabel={'Next →'}
                        pageCount={Math.ceil(total / pageSize)}
                        onPageChange={({ selected }) => setPage(selected)}
                        containerClassName={'tours__pagination'}
                        activeClassName={'tours__pagination--active'}
                        forcePage={page}
                        breakLabel={'...'}
                        pageRangeDisplayed={3}
                        marginPagesDisplayed={1}
                    />
                </div>
            </div>

            {/* Assignment Modal */}
            <AssignmentModal
                isOpen={assignmentModal.isOpen}
                onClose={() => setAssignmentModal({ isOpen: false, bookingId: null, bookingReference: '', bookingType: 'tour' })}
                bookingId={assignmentModal.bookingId}
                bookingReference={assignmentModal.bookingReference}
                bookingType={assignmentModal.bookingType}
                onSuccess={handleAssignmentSuccess}
            />
        </div>
    )
}

export default AdminTours
