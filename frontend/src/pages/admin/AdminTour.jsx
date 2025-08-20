import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiMap } from 'react-icons/fi'
import ReactPaginate from 'react-paginate'
import './AdminTour.css'
import { supabase } from '../../api/supabaseClient'

const AdminTours = () => {
    const [tourBookings, setTourBookings] = useState([])
    const [tourStats, setTourStats] = useState({})
    const [page, setPage] = useState(0)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [sort, setSort] = useState({
        key: 'booking_reference',
        direction: 'asc',
    })
    const [filters, setFilters] = useState({ status: 'All', package_name: '' })

    const pageSize = 5
    const jwt = localStorage.getItem('adminToken')

    useEffect(() => {
        if (jwt) {
            supabase.auth.setSession({ access_token: jwt })
        }
    }, [jwt])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
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
            )
          `,
                        { count: 'exact' }
                    )
                    .range(page * pageSize, (page + 1) * pageSize - 1)
                    .order('created_at', { ascending: true })

                if (filters.status && filters.status !== 'All') {
                    query = query.eq('status', filters.status)
                }
                if (filters.package_name) {
                    query = query.ilike(
                        'package_dates.tour_packages.title',
                        `%${filters.package_name}%`
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
                setTotal(bookingsRes.count)
                setLoading(false)
            } catch (err) {
                setError('Failed to load tours. Please try again.')
                setLoading(false)
            }
        }

        fetchData()
    }, [page, filters, jwt])

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
        setPage(0)
    }

    const clearFilters = () => {
        setFilters({ status: 'All', package_name: '' })
        setPage(0)
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
                <FiMap
                    size={32}
                    color='#f7d100'
                />
                <h1>Tours Management</h1>
            </div>

            <div className='tours__summary'>
                <div className='tours__summary-card'>
                    <h3>Total Bookings</h3>
                    <p>{tourStats.total_bookings || 0}</p>
                </div>
                <div className='tours__summary-card'>
                    <h3>Total Revenue</h3>
                    <p>₱{(tourStats.total_revenue || 0).toLocaleString()}</p>
                </div>
                <div className='tours__summary-card'>
                    <h3>Avg. Booking Cost</h3>
                    <p>₱{(tourStats.avg_booking_cost || 0).toLocaleString()}</p>
                </div>
                <div className='tours__summary-card'>
                    <h3>Top Package</h3>
                    <p>{tourStats.popular_package || '-'}</p>
                </div>
            </div>

            <div className='tours__filter'>
                <select
                    name='status'
                    value={filters.status}
                    onChange={handleFilterChange}
                >
                    <option value='All'>All Statuses</option>
                    <option value='CONFIRMED'>Confirmed</option>
                    <option value='PENDING_PAYMENT'>Pending Payment</option>
                    <option value='CANCELLED'>Cancelled</option>
                </select>
                <input
                    type='text'
                    name='package_name'
                    value={filters.package_name}
                    onChange={handleFilterChange}
                    placeholder='Search Package (e.g., Boracay Tour)'
                />
                <button
                    className='tours__filter-clear'
                    onClick={clearFilters}
                >
                    Clear Filters
                </button>
            </div>

            <div className='tours__section'>
                <h2>Tour Bookings</h2>
                <div className='tours__table-container'>
                    <table className='tours__table'>
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
                                <th>Package</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Slots</th>
                                <th
                                    onClick={() =>
                                        handleSort('passenger_count')
                                    }
                                >
                                    Passengers
                                </th>
                                <th>Lead</th>
                                <th onClick={() => handleSort('total_amount')}>
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortData(tourBookings, sort).map((booking) => (
                                <tr key={booking.id}>
                                    <td>
                                        <Link to={`/admin/tours/${booking.id}`}>
                                            {booking.booking_reference}
                                        </Link>
                                    </td>
                                    <td
                                        className={`tours__status tours__status--${booking.status.toLowerCase()}`}
                                    >
                                        {booking.status}
                                    </td>
                                    <td>
                                        {booking.package_dates?.tour_packages
                                            ?.title || 'Unknown'}
                                    </td>
                                    <td>
                                        {booking.package_dates?.start_date ||
                                            '-'}
                                    </td>
                                    <td>
                                        {booking.package_dates?.end_date || '-'}
                                    </td>
                                    <td>
                                        {booking.package_dates?.total_slots ||
                                            '-'}
                                    </td>
                                    <td>{booking.passenger_count}</td>
                                    <td>{`${booking.lead_first_name} ${booking.lead_last_name}`}</td>
                                    <td>
                                        ₱
                                        {(
                                            booking.total_amount || 0
                                        ).toLocaleString()}
                                    </td>
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
                    containerClassName={'tours__pagination'}
                    activeClassName={'tours__pagination--active'}
                />
            </div>
        </div>
    )
}

export default AdminTours
