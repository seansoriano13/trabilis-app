// Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
    FiCloud, 
    FiUsers, 
    FiDollarSign, 
    FiTrendingUp, 
    FiMapPin,
    FiRefreshCw,
    FiEye,
    FiEdit,
    FiTrash2,
    FiCalendar,
    FiClock,
    FiUser,
    FiNavigation,
    FiBarChart2,
    FiActivity,
    FiSun,
    FiWind,
    FiSunrise,
    FiBell,
    FiPackage
} from 'react-icons/fi'
import { Bar, Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import ReactPaginate from 'react-paginate'
import axios from 'axios'
import './Dashboard.css'
import { supabase } from '../../api/supabaseClient.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
)

const Dashboard = () => {
    const [flightBookings, setFlightBookings] = useState([])
    const [tourBookings, setTourBookings] = useState([])
    const [notifications, setNotifications] = useState([])
    const [revenueData, setRevenueData] = useState([])
    const [flightPage, setFlightPage] = useState(0)
    const [tourPage, setTourPage] = useState(0)
    const [notifPage, setNotifPage] = useState(0)
    const [flightTotal, setFlightTotal] = useState(0)
    const [tourTotal, setTourTotal] = useState(0)
    const [notifTotal, setNotifTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [sortFlight, setSortFlight] = useState({
        key: 'booking_reference',
        direction: 'asc',
    })
    const [sortTour, setSortTour] = useState({
        key: 'booking_reference',
        direction: 'asc',
    })
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedNotification, setSelectedNotification] = useState(null)
    const [weather, setWeather] = useState(null)

    const pageSize = 5
    const jwt = localStorage.getItem('adminToken')

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                const flightPromise = supabase
                    .from('flight_bookings')
                    .select('*', { count: 'exact' })
                    .range(
                        flightPage * pageSize,
                        (flightPage + 1) * pageSize - 1
                    )
                    .order(sortFlight.key, {
                        ascending: sortFlight.direction === 'asc',
                    })

                const notifPromise = supabase
                    .from('admin_notifications')
                    .select('*', { count: 'exact' })
                    .range(notifPage * pageSize, (notifPage + 1) * pageSize - 1)
                    .order('created_at', { ascending: false })

                const revenuePromise = supabase.rpc('get_monthly_revenue', {
                    p_start_date: '2025-01-01',
                    p_end_date: '2025-06-30',
                })

                const weatherPromise = axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?q=Manila,PH&appid=${
                        import.meta.env.VITE_OPEN_WEATHER_API_KEY
                    }&units=metric`
                )

                const tourCountPromise = supabase
                    .from('tour_bookings')
                    .select('id', { count: 'exact', head: true })

                const tourDataPromise = supabase
                    .from('tour_bookings')
                    .select(
                        `
          *,
          package_dates (
            tour_package_id,
            tour_packages!inner(title)
          )
        `
                    )
                    .range(tourPage * pageSize, (tourPage + 1) * pageSize - 1)
                    .order(sortTour.key, {
                        ascending: sortTour.direction === 'asc',
                    })

                const [
                    flightRes,
                    notifRes,
                    revenueRes,
                    weatherRes,
                    tourCountRes,
                    tourDataRes,
                ] = await Promise.all([
                    flightPromise,
                    notifPromise,
                    revenuePromise,
                    weatherPromise,
                    tourCountPromise,
                    tourDataPromise,
                ])

                if (
                    flightRes.error ||
                    notifRes.error ||
                    revenueRes.error ||
                    weatherRes.error ||
                    tourCountRes.error ||
                    tourDataRes.error
                ) {
                    throw new Error('Failed to fetch data')
                }

                setFlightBookings(flightRes.data)
                setTourBookings(tourDataRes.data)
                setNotifications(notifRes.data)
                setRevenueData(revenueRes.data || [])
                setFlightTotal(flightRes.count || 0)
                setTourTotal(tourCountRes.count || 0)
                setNotifTotal(notifRes.count || 0)
                setWeather(weatherRes.data)
                setLoading(false)
            } catch (err) {
                console.error(err)
                setError('Failed to load data. Please try again.')
                setLoading(false)
            }
        }

        fetchData()
    }, [flightPage, tourPage, notifPage, sortFlight, sortTour, jwt])

    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((o, k) => o?.[k], obj) || ''
    }

    const sortData = (data, sort) => {
        return [...data].sort((a, b) => {
            const valA = getNestedValue(a, sort.key)
            const valB = getNestedValue(b, sort.key)
            if (valA === valB) return 0
            if (sort.direction === 'asc') {
                return valA > valB ? 1 : -1
            } else {
                return valA < valB ? 1 : -1
            }
        })
    }

    const handleSortFlight = (key) => {
        setSortFlight((prev) => ({
            key,
            direction:
                prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }))
        setFlightPage(0) // Reset to first page on sort
    }

    const handleSortTour = (key) => {
        setSortTour((prev) => ({
            key,
            direction:
                prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }))
        setTourPage(0) // Reset to first page on sort
    }

    const openNotificationModal = (notification) => {
        setSelectedNotification(notification)
        setModalOpen(true)
    }

    const bookingStatsData = {
        labels: ['Flights', 'Tours'],
        datasets: [
            {
                label: 'Bookings by Type',
                data: [flightTotal, tourTotal],
                backgroundColor: '#f7d100',
                borderColor: '#f7d100',
                borderWidth: 1,
            },
        ],
    }

    const profitData = {
        labels: revenueData.map((r) => r.month) || [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
        ],
        datasets: [
            {
                label: 'Revenue (₱)',
                data: revenueData.map((r) => r.total) || [0, 0, 0, 0, 0, 0],
                borderColor: '#f7d100',
                backgroundColor: 'rgba(247, 209, 0, 0.2)',
                fill: true,
                tension: 0.4,
            },
        ],
    }

    const weatherData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Temperature (°C)',
                data: weather
                    ? new Array(7).fill(weather.main.temp)
                    : [0, 0, 0, 0, 0, 0, 0],
                borderColor: '#f7d100',
                backgroundColor: 'rgba(247, 209, 0, 0.2)',
                fill: true,
                tension: 0.4,
            },
        ],
    }

    if (loading) {
        return <div className='dashboard__loading'>Loading...</div>
    }

    if (error) {
        return (
            <div className='dashboard__error'>
                <p>{error}</p>
                <button
                    className='dashboard__retry'
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        )
    }

    const sortedFlightBookings = sortData(flightBookings, sortFlight)
    const sortedTourBookings = sortData(tourBookings, sortTour)

    return (
        <div className='dashboard'>
            <div className='dashboard__header'>
                <div className='dashboard__header-content'>
                    <div className='dashboard__header-icon'>
                        <FiBarChart2 size={32} />
                    </div>
                    <div className='dashboard__header-text'>
                        <h1>Admin Dashboard</h1>
                        <p>Overview of your travel business performance</p>
                    </div>
                </div>
                <div className='dashboard__header-actions'>
                    <button className='dashboard__action-btn dashboard__action-btn--refresh'>
                        <FiRefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className='dashboard__summary'>
                <div className='dashboard__summary-card dashboard__summary-card--flights'>
                    <div className='dashboard__summary-icon'>
                        <FiNavigation size={24} />
                    </div>
                    <div className='dashboard__summary-content'>
                    <h3>Flight Bookings</h3>
                    <p>{flightTotal}</p>
                        <span className='dashboard__summary-label'>Active bookings</span>
                    </div>
                </div>
                <div className='dashboard__summary-card dashboard__summary-card--tours'>
                    <div className='dashboard__summary-icon'>
                        <FiPackage size={24} />
                    </div>
                    <div className='dashboard__summary-content'>
                    <h3>Tour Bookings</h3>
                    <p>{tourTotal}</p>
                        <span className='dashboard__summary-label'>Active bookings</span>
                    </div>
                </div>
                <div className='dashboard__summary-card dashboard__summary-card--notifications'>
                    <div className='dashboard__summary-icon'>
                        <FiBell size={24} />
                    </div>
                    <div className='dashboard__summary-content'>
                    <h3>Notifications</h3>
                    <p>{notifTotal}</p>
                        <span className='dashboard__summary-label'>Unread alerts</span>
                    </div>
                </div>
                <div className='dashboard__summary-card dashboard__summary-card--revenue'>
                    <div className='dashboard__summary-icon'>
                        <FiDollarSign size={24} />
                    </div>
                    <div className='dashboard__summary-content'>
                    <h3>Total Revenue</h3>
                    <p>
                        ₱
                        {(
                            flightBookings.reduce(
                                (sum, b) => sum + (b.total_amount || 0),
                                0
                            ) +
                            tourBookings.reduce(
                                (sum, b) => sum + (b.total_amount || 0),
                                0
                            )
                        ).toLocaleString()}
                    </p>
                        <span className='dashboard__summary-label'>All time</span>
                    </div>
                </div>
            </div>

            <div className='dashboard__section'>
                <div className='dashboard__section-header'>
                    <div className='dashboard__section-title'>
                        <FiNavigation size={24} />
                        <h2>Recent Flight Bookings</h2>
                        <span className='dashboard__section-count'>({flightTotal} total)</span>
                    </div>
                    <div className='dashboard__section-actions'>
                        <Link to="/admin/flights" className='dashboard__action-btn dashboard__action-btn--view-all'>
                            <FiEye size={16} />
                            View All
                        </Link>
                    </div>
                </div>
                
                <div className='dashboard__table-container'>
                    <table className='dashboard__table'>
                        <thead>
                            <tr>
                                <th
                                    onClick={() => handleSortFlight('booking_reference')}
                                    className='dashboard__table-header dashboard__table-header--sortable'
                                >
                                    <div className='dashboard__table-header-content'>
                                        <span>Reference</span>
                                        {sortFlight.key === 'booking_reference' && (
                                            <span className='dashboard__sort-indicator'>
                                                {sortFlight.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th 
                                    onClick={() => handleSortFlight('status')}
                                    className='dashboard__table-header dashboard__table-header--sortable'
                                >
                                    <div className='dashboard__table-header-content'>
                                        <span>Status</span>
                                        {sortFlight.key === 'status' && (
                                            <span className='dashboard__sort-indicator'>
                                                {sortFlight.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSortFlight('search_criteria.destination')}
                                    className='dashboard__table-header dashboard__table-header--sortable'
                                >
                                    <div className='dashboard__table-header-content'>
                                        <span>Destination</span>
                                        {sortFlight.key === 'search_criteria.destination' && (
                                            <span className='dashboard__sort-indicator'>
                                                {sortFlight.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSortFlight('search_criteria.outboundDeparture')}
                                    className='dashboard__table-header dashboard__table-header--sortable'
                                >
                                    <div className='dashboard__table-header-content'>
                                        <span>Date</span>
                                        {sortFlight.key === 'search_criteria.outboundDeparture' && (
                                            <span className='dashboard__sort-indicator'>
                                                {sortFlight.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSortFlight('total_amount')}
                                    className='dashboard__table-header dashboard__table-header--sortable'
                                >
                                    <div className='dashboard__table-header-content'>
                                        <span>Amount</span>
                                        {sortFlight.key === 'total_amount' && (
                                            <span className='dashboard__sort-indicator'>
                                                {sortFlight.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className='dashboard__table-header'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedFlightBookings.map((booking) => (
                                <tr key={booking.id} className='dashboard__table-row'>
                                    <td className='dashboard__table-cell dashboard__table-cell--reference'>
                                        <Link
                                            to={`/admin/flights/${booking.id}`}
                                            className='dashboard__booking-link'
                                        >
                                            {booking.booking_reference}
                                        </Link>
                                    </td>
                                    <td className='dashboard__table-cell'>
                                        <span className={`dashboard__status dashboard__status--${booking.status === 'TICKETED' ? 'confirmed' : booking.status.toLowerCase()}`}>
                                        {booking.status === 'TICKETED' ? 'Confirmed' : booking.status}
                                        </span>
                                    </td>
                                    <td className='dashboard__table-cell'>
                                        <div className='dashboard__destination-info'>
                                            <FiMapPin size={16} />
                                            <span>{getNestedValue(booking, 'search_criteria.destination') || '-'}</span>
                                        </div>
                                    </td>
                                    <td className='dashboard__table-cell'>
                                        <div className='dashboard__date-info'>
                                            <FiCalendar size={16} />
                                            <span>{getNestedValue(booking, 'search_criteria.outboundDeparture') || '-'}</span>
                                        </div>
                                    </td>
                                    <td className='dashboard__table-cell dashboard__table-cell--amount'>
                                        <div className='dashboard__amount'>
                                            <span className='dashboard__amount-value'>
                                                ₱{(booking.total_amount || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className='dashboard__table-cell dashboard__table-cell--actions'>
                                        <div className='dashboard__actions'>
                                            <Link 
                                                to={`/admin/flights/${booking.id}`}
                                                className='dashboard__action-btn dashboard__action-btn--view'
                                                title='View Details'
                                            >
                                                <FiEye size={16} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className='dashboard__pagination-container'>
                <ReactPaginate
                        previousLabel={'← Previous'}
                        nextLabel={'Next →'}
                    pageCount={Math.ceil(flightTotal / pageSize)}
                    onPageChange={({ selected }) => setFlightPage(selected)}
                    containerClassName={'dashboard__pagination'}
                    activeClassName={'dashboard__pagination--active'}
                    forcePage={flightPage}
                        breakLabel={'...'}
                        pageRangeDisplayed={3}
                        marginPagesDisplayed={1}
                />
                </div>
            </div>

            <div className='dashboard__section'>
                <div className='dashboard__section-header'>
                    <div className='dashboard__section-title'>
                        <FiPackage size={24} />
                        <h2>Recent Tour Bookings</h2>
                        <span className='dashboard__section-count'>({tourTotal} total)</span>
                    </div>
                    <div className='dashboard__section-actions'>
                        <Link to="/admin/tours" className='dashboard__action-btn dashboard__action-btn--view-all'>
                            <FiEye size={16} />
                            View All
                        </Link>
                    </div>
                </div>
                
                <div className='dashboard__table-container'>
                    <table className='dashboard__table'>
                        <thead>
                            <tr>
                                <th
                                    onClick={() => handleSortTour('booking_reference')}
                                    className='dashboard__table-header dashboard__table-header--sortable'
                                >
                                    <div className='dashboard__table-header-content'>
                                        <span>Reference</span>
                                        {sortTour.key === 'booking_reference' && (
                                            <span className='dashboard__sort-indicator'>
                                                {sortTour.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th 
                                    onClick={() => handleSortTour('status')}
                                    className='dashboard__table-header dashboard__table-header--sortable'
                                >
                                    <div className='dashboard__table-header-content'>
                                        <span>Status</span>
                                        {sortTour.key === 'status' && (
                                            <span className='dashboard__sort-indicator'>
                                                {sortTour.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className='dashboard__table-header'>Package</th>
                                <th
                                    onClick={() => handleSortTour('passenger_count')}
                                    className='dashboard__table-header dashboard__table-header--sortable'
                                >
                                    <div className='dashboard__table-header-content'>
                                        <span>Passengers</span>
                                        {sortTour.key === 'passenger_count' && (
                                            <span className='dashboard__sort-indicator'>
                                                {sortTour.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className='dashboard__table-header'>Lead</th>
                                <th 
                                    onClick={() => handleSortTour('total_amount')}
                                    className='dashboard__table-header dashboard__table-header--sortable'
                                >
                                    <div className='dashboard__table-header-content'>
                                        <span>Amount</span>
                                        {sortTour.key === 'total_amount' && (
                                            <span className='dashboard__sort-indicator'>
                                                {sortTour.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className='dashboard__table-header'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTourBookings.map((booking) => (
                                <tr key={booking.id} className='dashboard__table-row'>
                                    <td className='dashboard__table-cell dashboard__table-cell--reference'>
                                        <Link 
                                            to={`/admin/tours/${booking.id}`}
                                            className='dashboard__booking-link'
                                        >
                                            {booking.booking_reference}
                                        </Link>
                                    </td>
                                    <td className='dashboard__table-cell'>
                                        <span className={`dashboard__status dashboard__status--${booking.status === 'TICKETED' ? 'confirmed' : booking.status.toLowerCase()}`}>
                                        {booking.status === 'TICKETED' ? 'Confirmed' : booking.status}
                                        </span>
                                    </td>
                                    <td className='dashboard__table-cell'>
                                        <div className='dashboard__package-info'>
                                            <span className='dashboard__package-name'>
                                                {getNestedValue(booking, 'package_dates.tour_packages.title') || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className='dashboard__table-cell'>
                                        <div className='dashboard__passenger-count'>
                                            <FiUsers size={16} />
                                            <span>{booking.passenger_count}</span>
                                        </div>
                                    </td>
                                    <td className='dashboard__table-cell'>
                                        <div className='dashboard__lead-info'>
                                            <FiUser size={16} />
                                            <span>{`${booking.lead_first_name} ${booking.lead_last_name}`}</span>
                                        </div>
                                    </td>
                                    <td className='dashboard__table-cell dashboard__table-cell--amount'>
                                        <div className='dashboard__amount'>
                                            <span className='dashboard__amount-value'>
                                                ₱{(booking.total_amount || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className='dashboard__table-cell dashboard__table-cell--actions'>
                                        <div className='dashboard__actions'>
                                            <Link 
                                                to={`/admin/tours/${booking.id}`}
                                                className='dashboard__action-btn dashboard__action-btn--view'
                                                title='View Details'
                                            >
                                                <FiEye size={16} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className='dashboard__pagination-container'>
                <ReactPaginate
                        previousLabel={'← Previous'}
                        nextLabel={'Next →'}
                    pageCount={Math.ceil(tourTotal / pageSize)}
                    onPageChange={({ selected }) => setTourPage(selected)}
                    containerClassName={'dashboard__pagination'}
                    activeClassName={'dashboard__pagination--active'}
                    forcePage={tourPage}
                        breakLabel={'...'}
                        pageRangeDisplayed={3}
                        marginPagesDisplayed={1}
                />
                </div>
            </div>

            <div className='dashboard__charts'>
                <div className='dashboard__section dashboard__section--chart'>
                    <div className='dashboard__section-header'>
                        <div className='dashboard__section-title'>
                            <FiSun size={24} />
                    <h2>Weather (Manila)</h2>
                        </div>
                    </div>
                    <div className='dashboard__weather'>
                        <div className='dashboard__weather-icon'>
                            <FiCloud size={32} />
                        </div>
                        <div className='dashboard__weather-info'>
                            <div className='dashboard__weather-main'>
                                <span className='dashboard__weather-temp'>
                                    {weather ? `${weather.main.temp}°C` : '0°C'}
                                </span>
                                <span className='dashboard__weather-desc'>
                                    {weather ? weather.weather[0]?.description : 'Partly Cloudy'}
                                </span>
                            </div>
                            <div className='dashboard__weather-details'>
                                <div className='dashboard__weather-detail'>
                                    <FiWind size={16} />
                                    <span>{weather ? `${weather.wind.speed} m/s` : '0 m/s'}</span>
                                </div>
                                <div className='dashboard__weather-detail'>
                                    <FiSunrise size={16} />
                                    <span>
                                {weather
                                            ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString()
                                            : '05:00 AM'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='dashboard__chart-container'>
                    <Line
                        data={weatherData}
                        options={{
                            responsive: true,
                                maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                                scales: { 
                                    y: { beginAtZero: true },
                                    x: { display: false }
                                },
                        }}
                    />
                    </div>
                </div>

                <div className='dashboard__section dashboard__section--chart'>
                    <div className='dashboard__section-header'>
                    <div className='dashboard__section-title'>
                        <FiBarChart2 size={24} />
                        <h2>Bookings by Type</h2>
                        </div>
                    </div>
                    <div className='dashboard__chart-container'>
                    <Bar
                        data={bookingStatsData}
                        options={{
                            responsive: true,
                                maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                                scales: { 
                                    y: { beginAtZero: true },
                                    x: { display: true }
                                },
                        }}
                    />
                    </div>
                </div>

                <div className='dashboard__section dashboard__section--chart'>
                    <div className='dashboard__section-header'>
                        <div className='dashboard__section-title'>
                            <FiActivity size={24} />
                    <h2>Revenue Trend</h2>
                        </div>
                    </div>
                    <div className='dashboard__chart-container'>
                    <Line
                        data={profitData}
                        options={{
                            responsive: true,
                                maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                                scales: { 
                                    y: { beginAtZero: true },
                                    x: { display: true }
                                },
                        }}
                    />
                    </div>
                </div>
            </div>

            {/* <div className='dashboard__section'>
                <h2>Notifications</h2>
                <ul className='dashboard__notifications'>
                    {notifications.map((notification) => (
                        <li
                            key={notification.id}
                            onClick={() => openNotificationModal(notification)}
                            className='dashboard__notification'
                        >
                            {notification.message}
                            <span>
                                {new Date(
                                    notification.created_at
                                ).toLocaleString()}
                            </span>
                        </li>
                    ))}
                </ul>
                <ReactPaginate
                    previousLabel={'←'}
                    nextLabel={'→'}
                    pageCount={Math.ceil(notifTotal / pageSize)}
                    onPageChange={({ selected }) => setNotifPage(selected)}
                    containerClassName={'dashboard__pagination'}
                    activeClassName={'dashboard__pagination--active'}
                    forcePage={notifPage}
                />
            </div> */}

            {modalOpen && (
                <div className='dashboard__modal'>
                    <div className='dashboard__modal-content'>
                        <h3>Notification Details</h3>
                        <p>{selectedNotification?.message}</p>
                        <p>
                            <small>
                                {new Date(
                                    selectedNotification?.created_at
                                ).toLocaleString()}
                            </small>
                        </p>
                        <button
                            className='dashboard__modal-close'
                            onClick={() => setModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard
