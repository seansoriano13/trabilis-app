import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BsFillAirplaneFill } from 'react-icons/bs'
import { 
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
    FiDownload
} from 'react-icons/fi'
import ReactPaginate from 'react-paginate'
import './AdminFlights.css'
import { supabase } from '../../api/supabaseClient'
import AssignmentModal from '../../components/admin/AssignmentModal'
import adminClient from '../../api/adminClient'

const AdminFlights = () => {
    const [flightBookings, setFlightBookings] = useState([])
    const [flightStats, setFlightStats] = useState({})
    const [page, setPage] = useState(0)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [sort, setSort] = useState({
        key: 'booking_reference',
        direction: 'asc',
    })
    const [filters, setFilters] = useState({ status: 'All', destination: '', reference: '' })
    const [searchInput, setSearchInput] = useState('')
    const [referenceInput, setReferenceInput] = useState('')
    const [assignmentModal, setAssignmentModal] = useState({
        isOpen: false,
        bookingId: null,
        bookingReference: '',
        bookingType: 'flight'
    })

    const pageSize = 5
    const jwt = localStorage.getItem('adminToken') // From your login flow
    const userRole = localStorage.getItem('admin_role')

    // Set Supabase auth session
    useEffect(() => {
        if (jwt) {
            supabase.auth.setSession({ access_token: jwt })
        }
    }, [jwt])

    // Debounce search inputs
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prev) => ({ ...prev, destination: searchInput }))
        }, 500)

        return () => clearTimeout(timer)
    }, [searchInput])

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prev) => ({ ...prev, reference: referenceInput }))
        }, 500)

        return () => clearTimeout(timer)
    }, [referenceInput])

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                let query = supabase
                    .from('flight_bookings')
                    .select(`
                        *,
                        assigned_staff:assigned_to (
                            id,
                            first_name,
                            last_name,
                            email
                        )
                    `, { count: 'exact' })
                    .range(page * pageSize, (page + 1) * pageSize - 1)
                    .order('search_criteria->>outboundDeparture', {
                        ascending: true,
                    })

                if (filters.status && filters.status !== 'All') {
                    query = query.eq('status', filters.status)
                }
                if (filters.destination) {
                    query = query.ilike(
                        'search_criteria->>destination',
                        `%${filters.destination}%`
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
                    supabase.rpc('get_flight_stats'),
                ])

                if (bookingsRes.error) {
                    console.error('Flight bookings error:', bookingsRes.error)
                    throw new Error(`Failed to fetch flight bookings: ${bookingsRes.error.message}`)
                }
                
                if (statsRes.error) {
                    console.error('Flight stats error:', statsRes.error)
                    throw new Error(`Failed to fetch flight stats: ${statsRes.error.message}`)
                }

                setFlightBookings(bookingsRes.data)
                setFlightStats(statsRes.data[0] || {})
                setTotal(bookingsRes.count)
                setLoading(false)
            } catch (err) {
                console.error(err)
                setError('Failed to load flights. Please try again.')
                setLoading(false)
            }
        }

        fetchData()
    }, [page, filters, jwt])

    // Sorting logic
    const sortData = (data, sort) => {
        return [...data].sort((a, b) => {
            const valA = sort.key.includes('.')
                ? sort.key.split('.').reduce((o, k) => o?.[k], a) || ''
                : a[sort.key] || ''
            const valB = sort.key.includes('.')
                ? sort.key.split('.').reduce((o, k) => o?.[k], b) || ''
                : b[sort.key] || ''
            return sort.direction === 'asc'
                ? valA > valB
                    ? 1
                    : -1
                : valA < valB
                ? 1
                : -1
        })
    }

    const handleSort = (key) => {
        setSort({
            key,
            direction:
                sort.key === key && sort.direction === 'asc' ? 'desc' : 'asc',
        })
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        if (name === 'destination') {
            setSearchInput(value)
        } else if (name === 'reference') {
            setReferenceInput(value)
        } else {
            setFilters((prev) => ({ ...prev, [name]: value }))
            setPage(0) // Reset to first page on filter change
        }
    }

    const clearFilters = () => {
        setFilters({ status: 'All', destination: '', reference: '' })
        setSearchInput('')
        setReferenceInput('')
        setPage(0)
    }

    const handleAssignBooking = (bookingId, bookingReference) => {
        setAssignmentModal({
            isOpen: true,
            bookingId,
            bookingReference,
            bookingType: 'flight'
        })
    }

    const handleAssignmentSuccess = (updatedBooking) => {
        // Refresh the data to show updated assignment
        setFlightBookings(prev => 
            prev.map(booking => 
                booking.id === updatedBooking.id ? updatedBooking : booking
            )
        )
    }

    const handlePreviewPDF = async (bookingId) => {
        try {
            const token = localStorage.getItem('adminToken')
            const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/flights/${bookingId}/html`
            window.open(`${url}?token=${token}`, '_blank')
        } catch (error) {
            console.error('Error opening PDF preview:', error)
        }
    }

    const handleDownloadPDF = async (bookingId) => {
        try {
            const token = localStorage.getItem('adminToken')
            const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/flights/${bookingId}/pdf`
            window.open(`${url}?token=${token}`, '_blank')
        } catch (error) {
            console.error('Error downloading PDF:', error)
        }
    }

    if (loading) {
        return <div className='flights__loading'>Loading...</div>
    }

    if (error) {
        return (
            <div className='flights__error'>
                <p>{error}</p>
                <button
                    className='flights__retry'
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className='flights'>
            <div className='flights__header'>
                <div className='flights__header-content'>
                    <div className='flights__header-icon'>
                        <BsFillAirplaneFill size={32} />
                    </div>
                    <div className='flights__header-text'>
                        <h1>Flight Sales Management</h1>
                        <p>Manage and monitor all flight bookings and sales</p>
                    </div>
                </div>
                <div className='flights__header-actions'>
                    <button className='flights__action-btn flights__action-btn--refresh'>
                        <FiRefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Summary Card */}
            <div className='flights__summary'>
                <div className='flights__summary-card flights__summary-card--bookings'>
                    <div className='flights__summary-icon'>
                        <FiUsers size={24} />
                    </div>
                    <div className='flights__summary-content'>
                        <h3>Total Bookings</h3>
                        <p>{flightStats.total_bookings || 0}</p>
                        <span className='flights__summary-label'>Active bookings</span>
                    </div>
                </div>
                <div className='flights__summary-card flights__summary-card--revenue'>
                    <div className='flights__summary-icon'>
                        <FiDollarSign size={24} />
                    </div>
                    <div className='flights__summary-content'>
                        <h3>Total Revenue</h3>
                        <p>₱{(flightStats.total_revenue || 0).toLocaleString()}</p>
                        <span className='flights__summary-label'>All time</span>
                    </div>
                </div>
                <div className='flights__summary-card flights__summary-card--average'>
                    <div className='flights__summary-icon'>
                        <FiTrendingUp size={24} />
                    </div>
                    <div className='flights__summary-content'>
                        <h3>Avg. Ticket Price</h3>
                        <p>₱{(flightStats.avg_ticket_price || 0).toLocaleString()}</p>
                        <span className='flights__summary-label'>Per ticket</span>
                    </div>
                </div>
                <div className='flights__summary-card flights__summary-card--popular'>
                    <div className='flights__summary-icon'>
                        <FiMapPin size={24} />
                    </div>
                    <div className='flights__summary-content'>
                        <h3>Top Destination</h3>
                        <p>{flightStats.popular_destination || '-'}</p>
                        <span className='flights__summary-label'>Most popular</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className='flights__filter'>
                <div className='flights__filter-header'>
                    <FiFilter size={20} />
                    <h3>Filters & Search</h3>
                </div>
                <div className='flights__filter-content'>
                    <div className='flights__filter-group'>
                        <label className='flights__filter-label'>
                            <FiNavigation size={16} />
                            Status
                        </label>
                        <select
                            name='status'
                            value={filters.status}
                            onChange={handleFilterChange}
                            className='flights__filter-select'
                        >
                            <option value='All'>All Statuses</option>
                            <option value='TICKETED'>Confirmed</option>
                            <option value='PENDING'>Pending</option>
                            <option value='CANCELLED'>Cancelled</option>
                        </select>
                    </div>
                    <div className='flights__filter-group'>
                        <label className='flights__filter-label'>
                            <FiSearch size={16} />
                            Search Destination
                        </label>
                        <input
                            type='text'
                            name='destination'
                            value={searchInput}
                            onChange={handleFilterChange}
                            placeholder='Search Destination (e.g., CEB)'
                            className='flights__filter-input'
                        />
                    </div>
                    <div className='flights__filter-group'>
                        <label className='flights__filter-label'>
                            <FiSearch size={16} />
                            Search Reference
                        </label>
                        <input
                            type='text'
                            name='reference'
                            value={referenceInput}
                            onChange={handleFilterChange}
                            placeholder='Search Reference (e.g., FL123)'
                            className='flights__filter-input'
                        />
                    </div>
                    <div className='flights__filter-actions'>
                        <button
                            className='flights__filter-clear'
                            onClick={clearFilters}
                        >
                            <FiRefreshCw size={16} />
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Flight Bookings Table */}
            <div className='flights__section'>
                <div className='flights__section-header'>
                    <div className='flights__section-title'>
                        <BsFillAirplaneFill size={24} />
                        <h2>Flight Bookings</h2>
                        <span className='flights__section-count'>({total} bookings)</span>
                    </div>
                    {/* <div className='flights__section-actions'>
                        <button className='flights__action-btn flights__action-btn--export'>
                            <FiTrendingUp size={16} />
                            Export
                        </button>
                    </div> */}
                </div>
                
                <div className='flights__table-container'>
                    <table className='flights__table'>
                        <thead>
                            <tr>
                                <th
                                    onClick={() => handleSort('booking_reference')}
                                    className='flights__table-header flights__table-header--sortable'
                                >
                                    <div className='flights__table-header-content'>
                                        <span>Reference</span>
                                        {sort.key === 'booking_reference' && (
                                            <span className='flights__sort-indicator'>
                                                {sort.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th 
                                    onClick={() => handleSort('status')}
                                    className='flights__table-header flights__table-header--sortable'
                                >
                                    <div className='flights__table-header-content'>
                                        <span>Status</span>
                                        {sort.key === 'status' && (
                                            <span className='flights__sort-indicator'>
                                                {sort.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('search_criteria.destination')}
                                    className='flights__table-header flights__table-header--sortable'
                                >
                                    <div className='flights__table-header-content'>
                                        <span>Destination</span>
                                        {sort.key === 'search_criteria.destination' && (
                                            <span className='flights__sort-indicator'>
                                                {sort.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('search_criteria.outboundDeparture')}
                                    className='flights__table-header flights__table-header--sortable'
                                >
                                    <div className='flights__table-header-content'>
                                        <span>Date</span>
                                        {sort.key === 'search_criteria.outboundDeparture' && (
                                            <span className='flights__sort-indicator'>
                                                {sort.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className='flights__table-header'>Flight Details</th>
                                <th className='flights__table-header'>Passenger</th>
                                <th className='flights__table-header'>Airline</th>
                                <th 
                                    onClick={() => handleSort('total_amount')}
                                    className='flights__table-header flights__table-header--sortable'
                                >
                                    <div className='flights__table-header-content'>
                                        <span>Amount</span>
                                        {sort.key === 'total_amount' && (
                                            <span className='flights__sort-indicator'>
                                                {sort.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className='flights__table-header'>Assignment</th>
                                <th className='flights__table-header'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortData(flightBookings, sort).map((booking) => (
                                <tr key={booking.id} className='flights__table-row'>
                                    <td className='flights__table-cell flights__table-cell--reference'>
                                        <Link 
                                            to={`/admin/flights/${booking.id}`}
                                            className='flights__booking-link'
                                            title={booking.booking_reference}
                                        >
                                            {booking.booking_reference}
                                        </Link>
                                    </td>
                                    <td className='flights__table-cell'>
                                        <span className={`flights__status flights__status--${booking.status === 'TICKETED' ? 'confirmed' : booking.status.toLowerCase()}`}>
                                            {booking.status === 'TICKETED' ? 'Confirmed' : booking.status}
                                        </span>
                                    </td>
                                    <td className='flights__table-cell flights__table-cell--destination'>
                                        <div className='flights__destination-info'>
                                            <span className='flights__destination-code'>
                                                {booking.search_criteria?.destination || '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className='flights__table-cell'>
                                        <div className='flights__date-info'>
                                            <FiCalendar size={16} />
                                            <span>
                                                {booking.search_criteria?.outboundDeparture || '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className='flights__table-cell flights__table-cell--flight'>
                                        <div className='flights__flight-details'>
                                            <div className='flights__departure'>
                                                <FiClock size={14} />
                                                <span>
                                                    {booking.amadeus_flight_offer?.itineraries[0]?.segments[0]?.departure?.at || '-'}
                                                </span>
                                            </div>
                                            <div className='flights__arrival'>
                                                <FiClock size={14} />
                                                <span>
                                                    {booking.amadeus_flight_offer?.itineraries[0]?.segments[0]?.arrival?.at || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='flights__table-cell flights__table-cell--passenger'>
                                        <div className='flights__passenger-info'>
                                            <FiUser size={16} />
                                            <span>
                                                {booking.passenger_details?.travelers[0]?.name?.firstName} {booking.passenger_details?.travelers[0]?.name?.lastName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className='flights__table-cell'>
                                        <div className='flights__airline-info'>
                                            <FiNavigation size={16} />
                                            <span>{booking.amadeus_flight_offer?.validatingAirlineCodes[0] || '-'}</span>
                                        </div>
                                    </td>
                                    <td className='flights__table-cell flights__table-cell--amount'>
                                        <div className='flights__amount'>
                                            <span className='flights__amount-value'>
                                                ₱{(booking.total_amount || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className='flights__table-cell flights__table-cell--assignment'>
                                        <div className='flights__assignment'>
                                            {booking.assigned_to ? (
                                                <div className='flights__assignment-assigned'>
                                                    <div className='flights__assignment-staff'>
                                                        <span className='flights__assignment-staff-name'>
                                                            {booking.assigned_staff?.first_name} {booking.assigned_staff?.last_name}
                                                        </span>
                                                        <span className='flights__assignment-staff-email'>
                                                            {booking.assigned_staff?.email}
                                                        </span>
                                                    </div>
                                                    <span className={`flights__assignment-status flights__assignment-status--${booking.assignment_status}`}>
                                                        {booking.assignment_status?.replace('_', ' ') || 'pending'}
                                                    </span>
                                                    <span className='flights__assignment-date'>
                                                        {booking.assigned_at ? new Date(booking.assigned_at).toLocaleDateString() : '-'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className='flights__assignment-unassigned'>Unassigned</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className='flights__table-cell flights__table-cell--actions'>
                                        <div className='flights__actions'>
                                            <Link 
                                                to={`/admin/flights/${booking.id}`}
                                                className='flights__action-btn flights__action-btn--view'
                                                title='View Details'
                                            >
                                                <FiEye size={16} />
                                            </Link>
                                            {userRole === 'admin' && (
                                                <button 
                                                    className='flights__action-btn flights__action-btn--assign'
                                                    title='Assign to Accounting'
                                                    onClick={() => handleAssignBooking(booking.id, booking.booking_reference)}
                                                >
                                                    <FiUserPlus size={16} />
                                                </button>
                                            )}
                                            {/* <button 
                                                className='flights__action-btn flights__action-btn--edit'
                                                title='Edit Booking'
                                            >
                                                <FiEdit size={16} />
                                            </button> */}
                                            {/* <button 
                                                className='flights__action-btn flights__action-btn--pdf-preview'
                                                title='Preview PDF'
                                                onClick={() => handlePreviewPDF(booking.id)}
                                            >
                                                <FiFileText size={16} />
                                            </button> */}
                                            {/* <button 
                                                className='flights__action-btn flights__action-btn--pdf-download'
                                                title='Download PDF'
                                                onClick={() => handleDownloadPDF(booking.id)}
                                            >
                                                <FiDownload size={16} />
                                            </button> */}
                                            <button 
                                                className='flights__action-btn flights__action-btn--delete'
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
                
                <div className='flights__pagination-container'>
                    <ReactPaginate
                        previousLabel={'← Previous'}
                        nextLabel={'Next →'}
                        pageCount={Math.ceil(total / pageSize)}
                        onPageChange={({ selected }) => setPage(selected)}
                        containerClassName={'flights__pagination'}
                        activeClassName={'flights__pagination--active'}
                        breakLabel={'...'}
                        pageRangeDisplayed={3}
                        marginPagesDisplayed={1}
                    />
                </div>
            </div>

            {/* Assignment Modal */}
            <AssignmentModal
                isOpen={assignmentModal.isOpen}
                onClose={() => setAssignmentModal({ isOpen: false, bookingId: null, bookingReference: '', bookingType: 'flight' })}
                bookingId={assignmentModal.bookingId}
                bookingReference={assignmentModal.bookingReference}
                bookingType={assignmentModal.bookingType}
                onSuccess={handleAssignmentSuccess}
            />
        </div>
    )
}

export default AdminFlights
