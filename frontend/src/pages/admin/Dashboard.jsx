import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiCloud } from 'react-icons/fi'
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
    const jwt = localStorage.getItem('adminToken') // From your login flow

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Flight bookings, notifications, revenue, weather
                const flightPromise = supabase
                    .from('flight_bookings')
                    .select('*', { count: 'exact' })
                    .range(
                        flightPage * pageSize,
                        (flightPage + 1) * pageSize - 1
                    )
                    .order('search_criteria->>outboundDeparture', {
                        ascending: true,
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
                    }&units=imperial`
                )

                // Tour bookings: separate count and paginated data
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
                    .order('created_at', { ascending: true })

                // Await all promises
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

                // Error handling
                if (
                    flightRes.error ||
                    notifRes.error ||
                    revenueRes.error ||
                    tourDataRes.error ||
                    tourCountRes.error
                ) {
                    throw new Error('Failed to fetch data')
                }

                // Set state
                setFlightBookings(flightRes.data)
                setTourBookings(tourDataRes.data)
                setNotifications(notifRes.data)
                setRevenueData(revenueRes.data)
                setFlightTotal(flightRes.count)
                setTourTotal(tourCountRes.count) // ✅ fixed
                setNotifTotal(notifRes.count)
                setWeather(weatherRes.data)
                setLoading(false)
            } catch (err) {
                console.log(err)
                setError('Failed to load data. Please try again.')
                setLoading(false)
            }
        }

        fetchData()
    }, [flightPage, tourPage, notifPage, jwt])

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

    const handleSortFlight = (key) => {
        setSortFlight({
            key,
            direction:
                sortFlight.key === key && sortFlight.direction === 'asc'
                    ? 'desc'
                    : 'asc',
        })
    }

    const handleSortTour = (key) => {
        setSortTour({
            key,
            direction:
                sortTour.key === key && sortTour.direction === 'asc'
                    ? 'desc'
                    : 'asc',
        })
    }

    const openNotificationModal = (notification) => {
        setSelectedNotification(notification)
        setModalOpen(true)
    }

    // Chart data
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
            },
        ],
    }

    const weatherData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Temperature (°F)',
                data: weather
                    ? new Array(7).fill(weather.main.temp)
                    : [32, 30, 28, 32, 24, 28, 32],
                borderColor: '#f7d100',
                backgroundColor: 'rgba(247, 209, 0, 0.2)',
                fill: true,
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

    return (
        <div className='dashboard'>
            <h1 className='dashboard__title'>Dashboard</h1>

            {/* Metrics Cards */}
            <div className='dashboard__cards'>
                <div className='dashboard__card'>
                    <h3>Flight Bookings</h3>
                    <p>{flightTotal}</p>
                </div>
                <div className='dashboard__card'>
                    <h3>Tour Bookingss</h3>
                    <p>{tourTotal}</p>
                </div>
                <div className='dashboard__card'>
                    <h3>Recent Booking</h3>
                    <p>{notifTotal}</p>
                </div>
                <div className='dashboard__card'>
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
                </div>
            </div>

            {/* Booking Stats */}
            <div className='dashboard__section'>
                <h2>Bookings by Type</h2>
                <Bar
                    data={bookingStatsData}
                    options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } },
                    }}
                />
            </div>

            {/* Flight Bookings Table */}
            <div className='dashboard__section'>
                <h2>Flight Bookings</h2>
                <div className='dashboard__table-container'>
                    <table className='dashboard__table'>
                        <thead>
                            <tr>
                                <th
                                    onClick={() =>
                                        handleSortFlight('booking_reference')
                                    }
                                >
                                    Ref
                                </th>
                                <th onClick={() => handleSortFlight('status')}>
                                    Status
                                </th>
                                <th
                                    onClick={() =>
                                        handleSortFlight(
                                            'search_criteria.destination'
                                        )
                                    }
                                >
                                    Destination
                                </th>
                                <th
                                    onClick={() =>
                                        handleSortFlight(
                                            'search_criteria.outboundDeparture'
                                        )
                                    }
                                >
                                    Date
                                </th>
                                <th
                                    onClick={() =>
                                        handleSortFlight('total_amount')
                                    }
                                >
                                    Amount
                                </th>
                                <th>PNR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortData(flightBookings, sortFlight).map(
                                (booking) => (
                                    <tr key={booking.id}>
                                        <td>
                                            <Link
                                                to={`/admin/flights/${booking.id}`}
                                            >
                                                {booking.booking_reference}
                                            </Link>
                                        </td>
                                        <td
                                            className={`dashboard__status dashboard__status--${booking.status.toLowerCase()}`}
                                        >
                                            {booking.status}
                                        </td>
                                        <td>
                                            {booking.search_criteria
                                                ?.destination || '-'}
                                        </td>
                                        <td>
                                            {booking.search_criteria
                                                ?.outboundDeparture || '-'}
                                        </td>
                                        <td>
                                            ₱
                                            {(
                                                booking.total_amount || 0
                                            ).toLocaleString()}
                                        </td>
                                        <td>{booking.pnr || '-'}</td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
                <ReactPaginate
                    previousLabel={'←'}
                    nextLabel={'→'}
                    pageCount={Math.ceil(flightTotal / pageSize)}
                    onPageChange={({ selected }) => setFlightPage(selected)}
                    containerClassName={'dashboard__pagination'}
                    activeClassName={'dashboard__pagination--active'}
                />
            </div>

            {/* Tour Bookings Table */}
            <div className='dashboard__section'>
                <h2>Tour Bookings</h2>
                <div className='dashboard__table-container'>
                    <table className='dashboard__table'>
                        <thead>
                            <tr>
                                <th
                                    onClick={() =>
                                        handleSortTour('booking_reference')
                                    }
                                >
                                    Ref
                                </th>
                                <th onClick={() => handleSortTour('status')}>
                                    Status
                                </th>
                                <th>Package</th>
                                <th
                                    onClick={() =>
                                        handleSortTour('passenger_count')
                                    }
                                >
                                    Passengers
                                </th>
                                <th>Lead</th>
                                <th
                                    onClick={() =>
                                        handleSortTour('total_amount')
                                    }
                                >
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortData(tourBookings, sortTour).map((booking) => (
                                <tr key={booking.id}>
                                    <td>
                                        <Link to={`/admin/tours/${booking.id}`}>
                                            {booking.booking_reference}
                                        </Link>
                                    </td>
                                    <td
                                        className={`dashboard__status dashboard__status--${booking.status.toLowerCase()}`}
                                    >
                                        {booking.status}
                                    </td>
                                    <td>
                                        {booking.package_dates?.tour_packages
                                            ?.title || 'Unknown'}
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
                    pageCount={Math.ceil(tourTotal / pageSize)}
                    onPageChange={({ selected }) => setTourPage(selected)}
                    containerClassName={'dashboard__pagination'}
                    activeClassName={'dashboard__pagination--active'}
                />
            </div>

            {/* Profit Chart */}
            <div className='dashboard__section'>
                <h2>Revenue Trend</h2>
                <Line
                    data={profitData}
                    options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } },
                    }}
                />
            </div>

            {/* Weather Widget */}
            <div className='dashboard__section'>
                <h2>Weather (Manila)</h2>
                <div className='dashboard__weather'>
                    <FiCloud
                        size={24}
                        color='#f7d100'
                    />
                    <div>
                        <p>
                            {weather
                                ? `${weather.main.temp}°F, ${weather.weather[0]?.description}`
                                : '32°F, Partly Cloudy'}
                        </p>
                        <p>
                            {weather
                                ? `Wind: ${
                                      weather.wind.speed
                                  }km/h | Sunrise: ${new Date(
                                      weather.sys.sunrise * 1000
                                  ).toLocaleTimeString()}`
                                : 'Wind: 10km/h | Sunrise: 05:00 AM'}
                        </p>
                    </div>
                </div>
                <Line
                    data={weatherData}
                    options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } },
                    }}
                />
            </div>

            {/* Notifications */}
            <div className='dashboard__section'>
                <h2>Notifications</h2>
                <ul className='dashboard__notifications'>
                    {notifications.map((notification) => (
                        <li
                            key={notification.id}
                            onClick={() => openNotificationModal(notification)}
                            className='dashboard__notification'
                        >
                            {notification.message}{' '}
                            <span>({notification.created_at})</span>
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
                />
            </div>

            {/* Notification Modal */}
            {modalOpen && (
                <div className='dashboard__modal'>
                    <div className='dashboard__modal-content'>
                        <h3>Notification Details</h3>
                        <p>{selectedNotification?.message}</p>
                        <p>
                            <small>{selectedNotification?.created_at}</small>
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
