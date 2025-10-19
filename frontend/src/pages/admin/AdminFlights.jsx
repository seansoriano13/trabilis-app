import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSnackbar } from '../../context/SnackbarContext'
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
    FiDownload,
    FiActivity
} from 'react-icons/fi'
import ReactPaginate from 'react-paginate'
import './AdminFlights.css'
import { supabase } from '../../api/supabaseClient'
import adminClient from '../../api/adminClient'
import AssignmentModal from '../../components/admin/AssignmentModal'
import FlightBookingEditModal from '../../components/admin/FlightBookingEditModal'

const AdminFlights = () => {
    const { showSuccess, showError } = useSnackbar()
    const [flightBookings, setFlightBookings] = useState([])
    const [flightStats, setFlightStats] = useState({})
    const [page, setPage] = useState(0)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [searchLoading, setSearchLoading] = useState(false)
    const [error, setError] = useState(null)
    const [sort, setSort] = useState({
        key: 'booking_reference',
        direction: 'desc',
    })
    const [filters, setFilters] = useState({ 
        status: 'All', 
        destination: '', 
        reference: '',
        lead_name: '',
        lead_email: '',
        assignment_status: 'All',
        date_range: 'All'
    })
    const [searchInput, setSearchInput] = useState('')
    const [referenceInput, setReferenceInput] = useState('')
    const [leadNameInput, setLeadNameInput] = useState('')
    const [leadEmailInput, setLeadEmailInput] = useState('')
    const [assignmentModal, setAssignmentModal] = useState({
        isOpen: false,
        bookingId: null,
        bookingReference: '',
        bookingType: 'flight'
    })
    
    // Edit modal states
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)

    const pageSize = 20
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
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prev) => ({ ...prev, lead_name: leadNameInput }))
        }, 500)

        return () => clearTimeout(timer)
    }, [leadNameInput])
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prev) => ({ ...prev, lead_email: leadEmailInput }))
        }, 500)

        return () => clearTimeout(timer)
    }, [leadEmailInput])

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            if (loading) {
                setLoading(true)
            } else {
                setSearchLoading(true)
            }
            setError(null)
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

                // Apply server-side ordering when sorting by updated_at
                if (sort.key === 'updated_at') {
                    query = query.order('updated_at', { ascending: sort.direction === 'asc' })
                } else {
                    // Default list order (by outboundDeparture asc) to keep pagination stable
                    query = query.order('search_criteria->>outboundDeparture', { ascending: true })
                }

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
                if (filters.lead_name) {
                    query = query.or(`passenger_details->>firstName.ilike.%${filters.lead_name}%,passenger_details->>lastName.ilike.%${filters.lead_name}%`)
                }
                if (filters.lead_email) {
                    query = query.ilike('passenger_details->>email', `%${filters.lead_email}%`)
                }
                if (filters.assignment_status && filters.assignment_status !== 'All') {
                    query = query.eq('assignment_status', filters.assignment_status)
                }
                
                // Date range filtering
                if (filters.date_range && filters.date_range !== 'All') {
                    const now = new Date()
                    let startDate, endDate
                    
                    switch (filters.date_range) {
                        case 'today':
                            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
                            break
                        case 'week':
                            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
                            endDate = new Date()
                            break
                        case 'month':
                            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
                            break
                        case 'quarter': {
                            const quarter = Math.floor(now.getMonth() / 3)
                            startDate = new Date(now.getFullYear(), quarter * 3, 1)
                            endDate = new Date(now.getFullYear(), quarter * 3 + 3, 1)
                            break
                        }
                        case 'year':
                            startDate = new Date(now.getFullYear(), 0, 1)
                            endDate = new Date(now.getFullYear() + 1, 0, 1)
                            break
                    }
                    
                    if (startDate && endDate) {
                        query = query.gte('created_at', startDate.toISOString()).lt('created_at', endDate.toISOString())
                    }
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
                setSearchLoading(false)
            } catch (err) {
                console.error(err)
                setError('Failed to load flights. Please try again.')
                setLoading(false)
                setSearchLoading(false)
            }
        }

        fetchData()
    }, [page, filters, sort, jwt, loading])

    // Sorting logic
    const sortData = (data, sort) => {
        const isDateKey = sort.key === 'updated_at'
        const getComparable = (val) => {
            if (val == null) return ''
            if (isDateKey) return new Date(val).getTime() || 0
            return val
        }
        return [...data].sort((a, b) => {
            const rawA = sort.key.includes('.')
                ? sort.key.split('.').reduce((o, k) => o?.[k], a)
                : a[sort.key]
            const rawB = sort.key.includes('.')
                ? sort.key.split('.').reduce((o, k) => o?.[k], b)
                : b[sort.key]
            const valA = getComparable(rawA)
            const valB = getComparable(rawB)
            if (valA === valB) return 0
            return sort.direction === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1)
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
        } else if (name === 'lead_name') {
            setLeadNameInput(value)
        } else if (name === 'lead_email') {
            setLeadEmailInput(value)
        } else {
            setFilters((prev) => ({ ...prev, [name]: value }))
            setPage(0) // Reset to first page on filter change
        }
    }

    const clearFilters = () => {
        setFilters({ 
            status: 'All', 
            destination: '', 
            reference: '',
            lead_name: '',
            lead_email: '',
            assignment_status: 'All',
            date_range: 'All'
        })
        setSearchInput('')
        setReferenceInput('')
        setLeadNameInput('')
        setLeadEmailInput('')
        setPage(0)
    }

    // Handle edit modal
    const handleEdit = (booking) => {
        setSelectedBooking(booking)
        setShowEditModal(true)
    }
    
    // Close modal
    const handleCloseModal = () => {
        setShowEditModal(false)
        setSelectedBooking(null)
    }

    // Handle edit submit
    const handleEditSubmit = async (submitData) => {
        try {
            const response = await adminClient.put(`/flights/${selectedBooking.id}/edit`, submitData)
            if (response.data.success) {
                setFlightBookings(prev =>
                    prev.map((booking) =>
                        booking.id === selectedBooking.id
                            ? {
                                ...booking,
                                ...submitData,
                                updated_at: new Date().toISOString(),
                            }
                            : booking
                    )
                )
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

    const handleAssignBooking = (bookingId, bookingReference, currentAssignedStaffId) => {
        setAssignmentModal({
            isOpen: true,
            bookingId,
            bookingReference,
            bookingType: 'flight',
            currentAssignedStaffId: currentAssignedStaffId
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

            <div className='flights__filter'>
                <div className='flights__filter-header'>
                    <div className='flights__filter-title'>
                        <FiFilter size={18} />
                        <span>Filters & Search</span>
                    </div>
                    <button
                        className='flights__filter-clear'
                        onClick={clearFilters}
                    >
                        <FiRefreshCw size={14} />
                        Clear All
                    </button>
                </div>
                
                <div className='flights__filter-grid'>
                    {/* Quick Filters */}
                    <div className='flights__filter-section'>
                        <div className='flights__filter-section-title'>Quick Filters</div>
                        <div className='flights__filter-row'>
                            <div className='flights__filter-group'>
                                <select
                                    name='status'
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className='flights__filter-select'
                                >
                                    <option value='All'>All Statuses</option>
                                    <option value='PENDING_TICKETING'>Confirmed</option>
                                    <option value='PENDING'>Pending</option>
                                    <option value='CANCELLED'>Cancelled</option>
                                </select>
                            </div>
                            <div className='flights__filter-group'>
                                <select
                                    name='assignment_status'
                                    value={filters.assignment_status}
                                    onChange={handleFilterChange}
                                    className='flights__filter-select'
                                >
                                    <option value='All'>All Assignments</option>
                                    <option value='pending'>Pending</option>
                                    <option value='in_progress'>In Progress</option>
                                    <option value='completed'>Approved</option>
                                </select>
                            </div>
                            <div className='flights__filter-group'>
                                <select
                                    name='date_range'
                                    value={filters.date_range}
                                    onChange={handleFilterChange}
                                    className='flights__filter-select'
                                >
                                    <option value='All'>All Time</option>
                                    <option value='today'>Today</option>
                                    <option value='week'>This Week</option>
                                    <option value='month'>This Month</option>
                                    <option value='quarter'>This Quarter</option>
                                    <option value='year'>This Year</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Search Fields */}
                    <div className='flights__filter-section'>
                        <div className='flights__filter-section-title'>Search</div>
                        <div className='flights__filter-row'>
                            <div className='flights__filter-group'>
                                <input
                                    type='text'
                                    name='destination'
                                    value={searchInput}
                                    onChange={handleFilterChange}
                                    placeholder='Destination...'
                                    className='flights__filter-input'
                                />
                            </div>
                            <div className='flights__filter-group'>
                                <input
                                    type='text'
                                    name='reference'
                                    value={referenceInput}
                                    onChange={handleFilterChange}
                                    placeholder='Booking reference...'
                                    className='flights__filter-input'
                                />
                            </div>
                            <div className='flights__filter-group'>
                                <input
                                    type='text'
                                    name='lead_name'
                                    value={leadNameInput}
                                    onChange={handleFilterChange}
                                    placeholder='Passenger name...'
                                    className='flights__filter-input'
                                />
                            </div>
                            <div className='flights__filter-group'>
                                <input
                                    type='text'
                                    name='lead_email'
                                    value={leadEmailInput}
                                    onChange={handleFilterChange}
                                    placeholder='Passenger email...'
                                    className='flights__filter-input'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sort */}
                    <div className='flights__filter-section'>
                        <div className='flights__filter-section-title'>Sort</div>
                        <div className='flights__filter-row'>
                            <div className='flights__filter-group'>
                                <select
                                    name='order'
                                    value={sort.key === 'updated_at' ? sort.direction : 'desc'}
                                    onChange={(e) => {
                                        setSort({ key: 'updated_at', direction: e.target.value })
                                        setPage(0)
                                    }}
                                    className='flights__filter-select'
                                >
                                    <option value='desc'>Newest first</option>
                                    <option value='asc'>Oldest first</option>
                                </select>
                            </div>
                        </div>
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
                        {searchLoading && (
                            <div className='flights__search-loading'>
                                <div className='flights__search-spinner'></div>
                                <span>Searching...</span>
                            </div>
                        )}
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
                                    onClick={() => handleSort('updated_at')}
                                    className='flights__table-header flights__table-header--sortable'
                                >
                                    <div className='flights__table-header-content'>
                                        <span>Booked</span>
                                        {sort.key === 'updated_at' && (
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
                                        {booking.updated_at ? new Date(booking.updated_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td className='flights__table-cell'>
                                        <span className={`flights__status flights__status--${booking.status === 'PENDING_TICKETING' ? 'confirmed' : booking.status.toLowerCase()}`}>
                                            {booking.status === 'PENDING_TICKETING' ? 'Confirmed' : booking.status}
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
                                                        {!booking.assigned_by && (
                                                            <span className='flights__assignment-auto'>
                                                                <FiActivity size={12} />
                                                                Auto-assigned
                                                            </span>
                                                        )}
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
                                            {userRole === 'admin' && (
                                                <button 
                                                    className='action-btn assign-btn'
                                                    title='Assign to Accounting'
                                                    onClick={() => handleAssignBooking(booking.id, booking.booking_reference, booking.assigned_to)}
                                                >
                                                    <FiUserPlus size={16} />
                                                </button>
                                            )}
                                            <button 
                                                className='action-btn view-btn'
                                                title='Edit Booking'
                                                onClick={() => handleEdit(booking)}
                                            >
                                                <FiEye size={16} />
                                            </button>
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
                                            {/* <button 
                                                className='flights__action-btn flights__action-btn--delete'
                                                title='Cancel Booking'
                                            >
                                                <FiTrash2 size={16} />
                                            </button> */}
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
                onClose={() => setAssignmentModal({ isOpen: false, bookingId: null, bookingReference: '', bookingType: 'flight', currentAssignedStaffId: null })}
                bookingId={assignmentModal.bookingId}
                bookingReference={assignmentModal.bookingReference}
                bookingType={assignmentModal.bookingType}
                currentAssignedStaffId={assignmentModal.currentAssignedStaffId}
                onSuccess={handleAssignmentSuccess}
            />
            
            {/* Edit Modal */}
            <FlightBookingEditModal
                isOpen={showEditModal}
                booking={selectedBooking}
                onClose={handleCloseModal}
                onSubmit={handleEditSubmit}
                context="admin"
            />
        </div>
    )
}

export default AdminFlights
