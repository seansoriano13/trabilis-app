import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BsFillAirplaneFill } from 'react-icons/bs'
import ReactPaginate from 'react-paginate'
import './AdminFlights.css'
import { supabase } from '../../api/supabaseClient'

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
    const [filters, setFilters] = useState({ status: 'All', destination: '' })

    const pageSize = 5
    const jwt = localStorage.getItem('adminToken') // From your login flow

    // Set Supabase auth session
    useEffect(() => {
        if (jwt) {
            supabase.auth.setSession({ access_token: jwt })
        }
    }, [jwt])

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                let query = supabase
                    .from('flight_bookings')
                    .select('*', { count: 'exact' }) // Just fetch JSON column
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

                const [bookingsRes, statsRes] = await Promise.all([
                    query,
                    supabase.rpc('get_flight_stats'),
                ])

                if (bookingsRes.error || statsRes.error) {
                    throw new Error('Failed to fetch data')
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
        setFilters((prev) => ({ ...prev, [name]: value }))
        setPage(0) // Reset to first page on filter change
    }

    const clearFilters = () => {
        setFilters({ status: 'All', destination: '' })
        setPage(0)
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
                <BsFillAirplaneFill
                    size={32}
                    color='black'
                />
                <h1>Flights Management</h1>
            </div>

            {/* Summary Card */}
            <div className='flights__summary'>
                <div className='flights__summary-card'>
                    <h3>Total Bookings</h3>
                    <p>{flightStats.total_bookings || 0}</p>
                </div>
                <div className='flights__summary-card'>
                    <h3>Total Revenue</h3>
                    <p>₱{(flightStats.total_revenue || 0).toLocaleString()}</p>
                </div>
                <div className='flights__summary-card'>
                    <h3>Avg. Ticket Price</h3>
                    <p>
                        ₱{(flightStats.avg_ticket_price || 0).toLocaleString()}
                    </p>
                </div>
                <div className='flights__summary-card'>
                    <h3>Top Destination</h3>
                    <p>{flightStats.popular_destination || '-'}</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className='flights__filter'>
                <select
                    name='status'
                    value={filters.status}
                    onChange={handleFilterChange}
                >
                    <option value='All'>All Statuses</option>
                    <option value='TICKETED'>Ticketed</option>
                    <option value='PENDING'>Pending</option>
                    <option value='CANCELLED'>Cancelled</option>
                </select>
                <input
                    type='text'
                    name='destination'
                    value={filters.destination}
                    onChange={handleFilterChange}
                    placeholder='Search Destination (e.g., CEB)'
                />
                <button
                    className='flights__filter-clear'
                    onClick={clearFilters}
                >
                    Clear Filters
                </button>
            </div>

            {/* Flight Bookings Table */}
            <div className='flights__section'>
                <h2>Flight Bookings</h2>
                <div className='flights__table-container'>
                    <table className='flights__table'>
                        <thead>
                            <tr>
                                <th
                                    onClick={() =>
                                        handleSort('booking_reference')
                                    }
                                >
                                    Ref
                                </th>
                                <th onClick={() => handleSort('status')}>
                                    Status
                                </th>
                                <th
                                    onClick={() =>
                                        handleSort(
                                            'search_criteria.destination'
                                        )
                                    }
                                >
                                    Destination
                                </th>
                                <th
                                    onClick={() =>
                                        handleSort(
                                            'search_criteria.outboundDeparture'
                                        )
                                    }
                                >
                                    Date
                                </th>
                                <th>Departure</th>
                                <th>Arrival</th>
                                <th>Passenger</th>
                                <th>Airline</th>
                                <th onClick={() => handleSort('total_amount')}>
                                    Amount
                                </th>
                                <th>PNR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortData(flightBookings, sort).map((booking) => (
                                <tr key={booking.id}>
                                    <td>
                                        <Link
                                            to={`/admin/flights/${booking.id}`}
                                        >
                                            {booking.booking_reference}
                                        </Link>
                                    </td>
                                    <td
                                        className={`flights__status flights__status--${booking.status.toLowerCase()}`}
                                    >
                                        {booking.status}
                                    </td>
                                    <td>
                                        {booking.search_criteria?.destination ||
                                            '-'}
                                    </td>
                                    <td>
                                        {booking.search_criteria
                                            ?.outboundDeparture || '-'}
                                    </td>
                                    <td>
                                        {booking.amadeus_flight_offer
                                            ?.itineraries[0]?.segments[0]
                                            ?.departure?.at || '-'}
                                    </td>
                                    <td>
                                        {booking.amadeus_flight_offer
                                            ?.itineraries[0]?.segments[0]
                                            ?.arrival?.at || '-'}
                                    </td>
                                    <td>
                                        {
                                            booking.passenger_details
                                                ?.travelers[0]?.name?.firstName
                                        }{' '}
                                        {
                                            booking.passenger_details
                                                ?.travelers[0]?.name?.lastName
                                        }
                                    </td>
                                    <td>
                                        {booking.amadeus_flight_offer
                                            ?.validatingAirlineCodes[0] || '-'}
                                    </td>
                                    <td>
                                        ₱
                                        {(
                                            booking.total_amount || 0
                                        ).toLocaleString()}
                                    </td>
                                    <td>{booking.pnr || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ReactPaginate
                    previousLabel={'←'}
                    nextLabel={'→'}
                    pageCount={Math.ceil(total / pageSize)}
                    onPageChange={({ selected }) => setPage(selected)}
                    containerClassName={'flights__pagination'}
                    activeClassName={'flights__pagination--active'}
                />
            </div>
        </div>
    )
}

export default AdminFlights
