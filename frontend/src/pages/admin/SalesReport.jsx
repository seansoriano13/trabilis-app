import { useEffect, useMemo, useRef, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import './SalesReport.css'
import axios from 'axios'
import BookingReferencesModal from '../../components/admin/BookingReferencesModal'
import ReactPaginate from 'react-paginate'
import {
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiBarChart2,
  FiAward,
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from 'react-icons/fi'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/material_blue.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const SalesReport = () => {
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [topTravelers, setTopTravelers] = useState([])
  const [agentStats, setAgentStats] = useState({ flights: [], tours: [] })
  const [statusCounts, setStatusCounts] = useState({
    cancelled: 0,
    pendingPayment: 0,
    confirmed: 0,
  })
  const [activeAgentTab, setActiveAgentTab] = useState('Flights')
  const [agentFilter, setAgentFilter] = useState('All')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [agentPage, setAgentPage] = useState({ Flights: 0, Tours: 0 })
  const agentPageSize = 10
  const [error, setError] = useState(null)
  const [selectedTraveler, setSelectedTraveler] = useState(null)
  const [topTours, setTopTours] = useState([])
  const agentSectionRef = useRef(null)
  const [travelerSearch, setTravelerSearch] = useState('')
  const [tourSearch, setTourSearch] = useState('')

  const [travelerSort, setTravelerSort] = useState({
    key: 'rank',
    direction: 'asc',
  })
  const [tourSort, setTourSort] = useState({ key: 'rank', direction: 'asc' })
  const [agentSort, setAgentSort] = useState({
    key: 'agentName',
    direction: 'asc',
  })

  const normalizeTripType = (tripType) => {
    if (!tripType) return 'N/A'
    const lowerCaseTripType = tripType.toLowerCase()
    if (lowerCaseTripType.includes('round')) {
      return 'Round Trip'
    }
    if (lowerCaseTripType.includes('one')) {
      return 'One Way'
    }
    return tripType // Fallback for any other values
  }

  const handleSort = (key, sortState, setSortState) => {
    setSortState({
      key,
      direction:
        sortState.key === key && sortState.direction === 'asc' ? 'desc' : 'asc',
    })
  }

  const sortData = (data, sort) => {
    if (!data) return []
    return [...data].sort((a, b) => {
      const valA = a[sort.key]
      const valB = b[sort.key]

      if (valA < valB) {
        return sort.direction === 'asc' ? -1 : 1
      }
      if (valA > valB) {
        return sort.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  const agentOptions = useMemo(
    () =>
      (activeAgentTab === 'Flights'
        ? agentStats.flights
        : agentStats.tours
      ).map((a) => (
        <option key={a.agentId} value={a.agentId}>
          {a.agentName}
        </option>
      )),
    [activeAgentTab, agentStats]
  )

  // Filters
  const [filters, setFilters] = useState({
    date_range: 'All',
    flightClass: 'All',
    dataType: 'Both',
  })

  const [customRange, setCustomRange] = useState([null, null])

  useEffect(() => {
    if (filters.dataType === 'Flights') {
      setActiveAgentTab('Flights')
      setAgentPage({ Flights: 0, Tours: 0 })
    } else if (filters.dataType === 'Tours') {
      setActiveAgentTab('Tours')
      setAgentPage({ Flights: 0, Tours: 0 })
    } else {
      setActiveAgentTab('Flights')
      setAgentPage({ Flights: 0, Tours: 0 })
    }
  }, [filters.dataType])

  const scrollToAgentSection = () => {
    if (agentSectionRef.current) {
      agentSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const currentAgentData = activeAgentTab === 'Flights' ? agentStats.flights : agentStats.tours

  const filteredAgentBookings = useMemo(() => {
    const min = minAmount ? parseFloat(minAmount) : null
    const max = maxAmount ? parseFloat(maxAmount) : null
    const bookings = currentAgentData
      .filter((agent) => agentFilter === 'All' || agent.agentId === agentFilter)
      .flatMap((agent) =>
        agent.bookings.map((booking, idx) => ({
          ...booking,
          agentName: agent.agentName,
          agentId: agent.agentId,
          key: `${agent.agentId}-${idx}-${booking.bookingReference}`,
        }))
      )
      .filter((b) => {
        const amount = parseFloat(b.amount || 0)
        if (min !== null && amount < min) return false
        if (max !== null && amount > max) return false
        return true
      })

    const sortedBookings = sortData(bookings, agentSort)

    const start = agentPage[activeAgentTab] * agentPageSize
    return sortedBookings.slice(start, start + agentPageSize)
  }, [
    activeAgentTab,
    agentFilter,
    agentPage,
    agentPageSize,
    currentAgentData,
    maxAmount,
    minAmount,
    agentSort,
  ])

  const filteredTotal = useMemo(() => {
    const min = minAmount ? parseFloat(minAmount) : null
    const max = maxAmount ? parseFloat(maxAmount) : null
    return currentAgentData
      .filter((agent) => agentFilter === 'All' || agent.agentId === agentFilter)
      .flatMap((agent) => agent.bookings)
      .filter((b) => {
        const amount = parseFloat(b.amount || 0)
        if (min !== null && amount < min) return false
        if (max !== null && amount > max) return false
        return true
      }).length
  }, [activeAgentTab, agentFilter, currentAgentData, maxAmount, minAmount])

  const fetchReportData = async () => {
    if (loading) {
      setLoading(true)
    } else {
      setSearchLoading(true)
    }
    setError(null)
    try {
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams()

      // Handle date range filter
      if (filters.date_range === 'custom' && customRange[0] && customRange[1]) {
        params.append('startDate', customRange[0].toISOString())
        params.append('endDate', customRange[1].toISOString())
      } else if (filters.date_range && filters.date_range !== 'All' && filters.date_range !== 'custom') {
        const now = new Date()
        let startDate, endDate

        switch (filters.date_range) {
          case 'today':
            startDate = new Date(now)
            startDate.setHours(0, 0, 0, 0)
            endDate = new Date(now)
            endDate.setHours(23, 59, 59, 999)
            break
          case 'week':
            startDate = new Date(now)
            startDate.setDate(now.getDate() - 7)
            startDate.setHours(0, 0, 0, 0)
            endDate = new Date(now)
            endDate.setHours(23, 59, 59, 999)
            break
          case 'month':
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              1,
              0,
              0,
              0,
              0
            )
            endDate = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            )
            break
          case 'quarter': {
            const quarter = Math.floor(now.getMonth() / 3)
            startDate = new Date(now.getFullYear(), quarter * 3, 1, 0, 0, 0, 0)
            endDate = new Date(
              now.getFullYear(),
              quarter * 3 + 3,
              0,
              23,
              59,
              59,
              999
            )
            break
          }
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
            break
        }

        if (startDate && endDate) {
          params.append('startDate', startDate.toISOString())
          params.append('endDate', endDate.toISOString())
        }
      }

      if (filters.flightClass && filters.flightClass !== 'All')
        params.append('flightClass', filters.flightClass)
      if (filters.dataType) params.append('dataType', filters.dataType)

      const requests = [
        axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/admin/sales-report?${params}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/admin/sales-report/top-travelers?${params}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/admin/sales-report/agent-stats?${params}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]

      // Conditionally fetch top tours when Tours or Both selected
      if (filters.dataType === 'Tours' || filters.dataType === 'Both') {
        requests.push(
          axios.get(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/v1/admin/sales-report/top-tours?${params}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        )
      }

      const responses = await Promise.all(requests)
      const reportRes = responses[0]
      const travelersRes = responses[1]
      const agentStatsRes = responses[2]
      const toursRes = responses[3]

      console.log('Report data received:', reportRes.data)
      console.log('Summary:', reportRes.data?.summary)
      console.log('Revenue Trends:', reportRes.data?.revenueTrends)
      console.log('Bookings found:', reportRes.data?.summary?.bookingCount)

      setReportData(reportRes.data)
      setTopTravelers(travelersRes.data.topTravelers || [])
      setAgentStats(agentStatsRes.data?.agentStats || { flights: [], tours: [] })
      setStatusCounts(
        agentStatsRes.data?.statusCounts || {
          cancelled: 0,
          pendingPayment: 0,
          confirmed: 0,
        }
      )
      setTopTours(toursRes?.data?.topTours || [])
    } catch (error) {
      console.error('Error fetching sales report:', error)
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch sales report. Please try again.'
      console.error('Sales report error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      })
      setError(errorMessage)
      setReportData(null)
      setTopTravelers([])
      setAgentStats({ flights: [], tours: [] })
      setStatusCounts({ cancelled: 0, pendingPayment: 0, confirmed: 0 })
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [filters])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => {
      if (name === 'date_range' && value !== 'custom') {
        setCustomRange([null, null])
      }
      return { ...prev, [name]: value }
    })
  }

  const handleCustomRangeChange = (dates) => {
    setCustomRange(dates)
    // Only update filters if 2 dates are chosen
    if (dates[0] && dates[1]) {
      setFilters((prev) => ({ ...prev, date_range: 'custom' }))
    }
  }

  const clearFilters = () => {
    setFilters({
      date_range: 'All',
      flightClass: 'All',
      dataType: 'Both',
    })
  }

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams()

      // Handle date range for export
      if (filters.date_range === 'custom' && customRange[0] && customRange[1]) {
        params.append('startDate', customRange[0].toISOString())
        params.append('endDate', customRange[1].toISOString())
      } else if (filters.date_range && filters.date_range !== 'All' && filters.date_range !== 'custom') {
        const now = new Date()
        let startDate, endDate

        switch (filters.date_range) {
          case 'today':
            startDate = new Date(now)
            startDate.setHours(0, 0, 0, 0)
            endDate = new Date(now)
            endDate.setHours(23, 59, 59, 999)
            break
          case 'week':
            startDate = new Date(now)
            startDate.setDate(now.getDate() - 7)
            startDate.setHours(0, 0, 0, 0)
            endDate = new Date(now)
            endDate.setHours(23, 59, 59, 999)
            break
          case 'month':
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              1,
              0,
              0,
              0,
              0
            )
            endDate = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            )
            break
          case 'quarter': {
            const quarter = Math.floor(now.getMonth() / 3)
            startDate = new Date(now.getFullYear(), quarter * 3, 1, 0, 0, 0, 0)
            endDate = new Date(
              now.getFullYear(),
              quarter * 3 + 3,
              0,
              23,
              59,
              59,
              999
            )
            break
          }
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
            break
        }

        if (startDate && endDate) {
          params.append('startDate', startDate.toISOString())
          params.append('endDate', endDate.toISOString())
        }
      }

      if (filters.flightClass && filters.flightClass !== 'All')
        params.append('flightClass', filters.flightClass)
      if (filters.dataType) params.append('dataType', filters.dataType)

      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/admin/sales-report/export?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      )

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `sales-report-${Date.now()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting report:', error)
      alert('Failed to export report')
    }
  }

  const chartData = {
    labels: reportData?.revenueTrends?.map((t) => t.date) || [],
    datasets: [
      {
        label: 'Revenue (₱)',
        data: reportData?.revenueTrends?.map((t) => t.revenue) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue Trends Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return '₱' + value.toLocaleString()
          },
        },
      },
    },
  }

  const sortedAndFilteredTravelers = useMemo(() => {
    return sortData(
      topTravelers.filter(
        (t) =>
          t.name.toLowerCase().includes(travelerSearch.toLowerCase()) ||
          t.email?.toLowerCase().includes(travelerSearch.toLowerCase())
      ),
      travelerSort
    )
  }, [topTravelers, travelerSearch, travelerSort])

  const sortedAndFilteredTours = useMemo(() => {
    return sortData(
      topTours.filter((t) =>
        t.title.toLowerCase().includes(tourSearch.toLowerCase())
      ),
      tourSort
    )
  }, [topTours, tourSearch, tourSort])

  return (
    <div className='sales-report'>
      <div className='sales-report__header'>
        <div className='sales-report__header-content'>
          <div className='sales-report__header-icon'>
            <FiBarChart2 size={32} />
          </div>
          <div className='sales-report__header-text'>
            <h1>Sales Report & Analytics</h1>
            <p>Track revenue, bookings, and top travelers</p>
          </div>
        </div>
        <div className='sales-report__header-actions'>
          <button
            className='sales-report__action-btn sales-report__action-btn--refresh'
            onClick={fetchReportData}
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <button
            className='sales-report__action-btn sales-report__action-btn--export'
            onClick={handleExport}
          >
            <FiDownload size={16} />
            Export to Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className='sales-report__loading'>Loading...</div>
      ) : error ? (
        <div className='sales-report__error'>{error}</div>
      ) : reportData?.summary ? (
        <>
          <div className='sales-report__summary'>
            <div className='sales-report__summary-card sales-report__summary-card--revenue'>
              <div className='sales-report__summary-icon'>
                <FiDollarSign size={24} />
              </div>
              <div className='sales-report__summary-content'>
                <h3>Sales Today</h3>
                <p>
                  ₱
                  {(reportData.summary.salesTodayAmount || 0).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>
                <span className='sales-report__summary-label'>
                  Total sales amount today
                </span>
              </div>
            </div>

            <div className='sales-report__summary-card sales-report__summary-card--bookings'>
              <div className='sales-report__summary-icon'>
                <FiShoppingCart size={24} />
              </div>
              <div className='sales-report__summary-content'>
                <h3>Total Bookings</h3>
                <p>{reportData.summary.bookingCount}</p>
                <span className='sales-report__summary-label'>
                  Completed in period
                </span>
              </div>
            </div>

            <div className='sales-report__summary-card sales-report__summary-card--confirmed'>
              <div className='sales-report__summary-icon'>
                <FiCheckCircle size={24} />
              </div>
              <div className='sales-report__summary-content'>
                <h3>Confirmed Bookings</h3>
                <p>{statusCounts.confirmed}</p>
                <span className='sales-report__summary-label'>
                  Across all agents
                </span>
              </div>
            </div>

            <div className='sales-report__summary-card sales-report__summary-card--pending'>
              <div className='sales-report__summary-icon'>
                <FiClock size={24} />
              </div>
              <div className='sales-report__summary-content'>
                <h3>Pending Payment</h3>
                <p>{statusCounts.pendingPayment}</p>
                <span className='sales-report__summary-label'>
                  Across all agents
                </span>
              </div>
            </div>

            <div className='sales-report__summary-card sales-report__summary-card--cancelled'>
              <div className='sales-report__summary-icon'>
                <FiXCircle size={24} />
              </div>
              <div className='sales-report__summary-content'>
                <h3>Cancelled Bookings</h3>
                <p>{statusCounts.cancelled}</p>
                <span className='sales-report__summary-label'>
                  Across all agents
                </span>
              </div>
            </div>
          </div>

          <div className='sales-report__filter'>
            <div className='sales-report__filter-header'>
              <div className='sales-report__filter-title'>
                <FiFilter size={18} />
                <span>Filters</span>
              </div>
              <button
                className='sales-report__filter-clear'
                onClick={clearFilters}
              >
                <FiRefreshCw size={14} />
                Clear All
              </button>
            </div>
            <div className='sales-report__filter-grid'>
              <div className='sales-report__filter-group'>
                <label>Date Range</label>
                <select
                  name='date_range'
                  value={filters.date_range}
                  onChange={handleFilterChange}
                  className='sales-report__filter-select'
                >
                  <option value='All'>All Time</option>
                  <option value='today'>Today</option>
                  <option value='week'>This Week</option>
                  <option value='month'>This Month</option>
                  <option value='quarter'>This Quarter</option>
                  <option value='year'>This Year</option>
                  <option value='custom'>Custom Range</option>
                </select>
              </div>
              {filters.date_range === 'custom' && (
                <Flatpickr
                  options={{ mode: 'range', dateFormat: 'Y-m-d' }}
                  value={customRange}
                  onChange={handleCustomRangeChange}
                  className='sales-report__filter-input' // Reuse existing input style
                  placeholder='Select date range'
                />
              )}

              <div className='sales-report__filter-group'>
                <label>Flight Class</label>
                <select
                  name='flightClass'
                  value={filters.flightClass}
                  onChange={handleFilterChange}
                  className='sales-report__filter-select'
                >
                  <option value='All'>All Classes</option>
                  <option value='ECONOMY'>Economy</option>
                  <option value='PREMIUM_ECONOMY'>Premium Economy</option>
                  <option value='BUSINESS'>Business</option>
                  <option value='FIRST'>First Class</option>
                </select>
              </div>

              <div className='sales-report__filter-group'>
                <label>Data Type</label>
                <select
                  name='dataType'
                  value={filters.dataType}
                  onChange={handleFilterChange}
                  className='sales-report__filter-select'
                >
                  <option value='Flights'>Flights</option>
                  <option value='Tours'>Tours</option>
                  <option value='Both'>Both</option>
                </select>
              </div>
            </div>
          </div>

          {reportData.summary.bookingCount === 0 ? (
            <div className='sales-report__no-data'>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>
                No bookings found
              </p>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Try adjusting the filters above or checking back later.
              </p>
            </div>
          ) : (
            <>
              <div className='sales-report__section'>
                <div className='sales-report__section-header'>
                  <div className='sales-report__section-title'>
                    <FiTrendingUp size={24} />
                    <h2>Revenue Trends Over Time</h2>
                    {searchLoading && (
                      <div className='sales-report__search-loading'>
                        <div className='sales-report__search-spinner'></div>
                        <span>Updating...</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className='sales-report__chart-container'>
                  <Line
                    data={chartData}
                    options={chartOptions}
                  />
                </div>
              </div>

              <div className='sales-report__section'>
                <div className='sales-report__section-header'>
                  <div className='sales-report__section-title'>
                    <FiAward size={24} />
                    <h2>
                      Top 10 Travelers
                      {filters.flightClass !== 'All' &&
                        ` (${filters.flightClass})`}
                    </h2>
                  </div>
                </div>
                <div className='sales-report__table-container'>
                  <div className='sales-report__filter-group'>
                    <input
                      type='text'
                      placeholder='Search travelers...'
                      value={travelerSearch}
                      onChange={(e) => setTravelerSearch(e.target.value)}
                      className='sales-report__filter-input'
                    />
                  </div>
                  <table className='sales-report__table'>
                    <thead>
                      <tr>
                        <th
                          className='sales-report__table-header sales-report__table-header--sortable'
                          onClick={() =>
                            handleSort('rank', travelerSort, setTravelerSort)
                          }
                        >
                          Rank
                          {travelerSort.key === 'rank' && (
                            <span className='sales-report__sort-indicator'>
                              {travelerSort.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th
                          className='sales-report__table-header sales-report__table-header--sortable'
                          onClick={() =>
                            handleSort('name', travelerSort, setTravelerSort)
                          }
                        >
                          Name
                          {travelerSort.key === 'name' && (
                            <span className='sales-report__sort-indicator'>
                              {travelerSort.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th
                          className='sales-report__table-header sales-report__table-header--sortable'
                          onClick={() =>
                            handleSort('email', travelerSort, setTravelerSort)
                          }
                        >
                          Email
                          {travelerSort.key === 'email' && (
                            <span className='sales-report__sort-indicator'>
                              {travelerSort.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th
                          className='sales-report__table-header sales-report__table-header--sortable'
                          onClick={() =>
                            handleSort(
                              'bookingCount',
                              travelerSort,
                              setTravelerSort
                            )
                          }
                        >
                          Bookings
                          {travelerSort.key === 'bookingCount' && (
                            <span className='sales-report__sort-indicator'>
                              {travelerSort.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th
                          className='sales-report__table-header sales-report__table-header--sortable'
                          onClick={() =>
                            handleSort(
                              'totalRevenue',
                              travelerSort,
                              setTravelerSort
                            )
                          }
                        >
                          Total Revenue
                          {travelerSort.key === 'totalRevenue' && (
                            <span className='sales-report__sort-indicator'>
                              {travelerSort.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th className='sales-report__table-header'>
                          Booking References
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedAndFilteredTravelers.length > 0 ? (
                        sortedAndFilteredTravelers.map((traveler) => (
                          <tr
                            key={traveler.rank}
                            className='sales-report__table-row'
                          >
                            <td className='sales-report__table-cell sales-report__table-cell--rank'>
                              {traveler.rank}
                            </td>
                            <td className='sales-report__table-cell'>
                              {traveler.name}
                            </td>
                            <td className='sales-report__table-cell'>
                              {traveler.email || 'N/A'}
                            </td>
                            <td className='sales-report__table-cell'>
                              {traveler.bookingCount}
                            </td>
                            <td className='sales-report__table-cell sales-report__table-cell--amount'>
                              ₱
                              {traveler.totalRevenue.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className='sales-report__table-cell sales-report__table-cell--references'>
                              <button
                                className='sales-report__view-bookings-btn'
                                onClick={() => setSelectedTraveler(traveler)}
                              >
                                View {traveler.bookingReferences.length} booking
                                {traveler.bookingReferences.length > 1
                                  ? 's'
                                  : ''}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan='6'
                            className='sales-report__table-cell sales-report__table-cell--no-data'
                          >
                            No travelers found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <div className='sales-report__no-data'>No data available</div>
      )}

      {/* Booking References Modal */}
      <BookingReferencesModal
        isOpen={!!selectedTraveler}
        onClose={() => setSelectedTraveler(null)}
        references={selectedTraveler?.bookingReferences || []}
        travelerName={selectedTraveler?.name || ''}
      />

      {/* Top Tour Packages Section */}
      {reportData?.summary && (filters.dataType === 'Tours' || filters.dataType === 'Both') && (
        <div className='sales-report__section'>
          <div className='sales-report__section-header'>
            <div className='sales-report__section-title'>
              <FiAward size={24} />
              <h2>Top 10 Tour Packages</h2>
            </div>
          </div>
          <div className='sales-report__table-container'>
            <div className='sales-report__filter-group'>
              <input
                type='text'
                placeholder='Search tours...'
                value={tourSearch}
                onChange={(e) => setTourSearch(e.target.value)}
                className='sales-report__filter-input'
              />
            </div>
            <table className='sales-report__table'>
              <thead>
                <tr>
                  <th
                    className='sales-report__table-header sales-report__table-header--sortable'
                    onClick={() => handleSort('rank', tourSort, setTourSort)}
                  >
                    Rank
                    {tourSort.key === 'rank' && (
                      <span className='sales-report__sort-indicator'>
                        {tourSort.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th
                    className='sales-report__table-header sales-report__table-header--sortable'
                    onClick={() => handleSort('title', tourSort, setTourSort)}
                  >
                    Package
                    {tourSort.key === 'title' && (
                      <span className='sales-report__sort-indicator'>
                        {tourSort.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th
                    className='sales-report__table-header sales-report__table-header--sortable'
                    onClick={() =>
                      handleSort('bookingCount', tourSort, setTourSort)
                    }
                  >
                    Bookings
                    {tourSort.key === 'bookingCount' && (
                      <span className='sales-report__sort-indicator'>
                        {tourSort.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th
                    className='sales-report__table-header sales-report__table-header--sortable'
                    onClick={() =>
                      handleSort('totalRevenue', tourSort, setTourSort)
                    }
                  >
                    Total Revenue
                    {tourSort.key === 'totalRevenue' && (
                      <span className='sales-report__sort-indicator'>
                        {tourSort.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredTours?.length > 0 ? (
                  sortedAndFilteredTours.map((tour) => (
                    <tr key={tour.rank} className='sales-report__table-row'>
                      <td className='sales-report__table-cell sales-report__table-cell--rank'>
                        {tour.rank}
                      </td>
                      <td className='sales-report__table-cell'>{tour.title}</td>
                      <td className='sales-report__table-cell'>
                        {tour.bookingCount}
                      </td>
                      <td className='sales-report__table-cell sales-report__table-cell--amount'>
                        ₱
                        {(tour.totalRevenue || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan='4'
                      className='sales-report__table-cell sales-report__table-cell--no-data'
                    >
                      No tour packages found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sales per Agent Section */}
      {reportData?.summary && (
        <div className='sales-report__section sales-report__agent-section' ref={agentSectionRef}>
          <div className='sales-report__section-header'>
            <div className='sales-report__section-title'>
              <FiUsers size={24} />
              <h2>Sales per Agent</h2>
            </div>
            <div className='sales-report__status-badges'>
              <span className='sales-report__status-badge sales-report__status-badge--confirmed'>
                Confirmed: {statusCounts.confirmed}
              </span>
              <span className='sales-report__status-badge sales-report__status-badge--pending'>
                Pending Payment: {statusCounts.pendingPayment}
              </span>
              <span className='sales-report__status-badge sales-report__status-badge--cancelled'>
                Cancelled: {statusCounts.cancelled}
              </span>
            </div>
          </div>

          <div className='sales-report__agent-filters'>
            <div className='sales-report__filter-group'>
              <label>Agent</label>
              <select
                value={agentFilter}
                onChange={(e) => {
                  setAgentFilter(e.target.value)
                  setAgentPage((prev) => ({ ...prev, [activeAgentTab]: 0 }))
                }}
                className='sales-report__filter-select'
              >
                <option value='All'>All Agents</option>
                {agentOptions}
              </select>
            </div>
            <div className='sales-report__filter-group'>
              <label>Min Amount</label>
              <input
                type='number'
                value={minAmount}
                onChange={(e) => {
                  setMinAmount(e.target.value)
                  setAgentPage((prev) => ({ ...prev, [activeAgentTab]: 0 }))
                }}
                className='sales-report__filter-input'
                placeholder='₱0'
              />
            </div>
            <div className='sales-report__filter-group'>
              <label>Max Amount</label>
              <input
                type='number'
                value={maxAmount}
                onChange={(e) => {
                  setMaxAmount(e.target.value)
                  setAgentPage((prev) => ({ ...prev, [activeAgentTab]: 0 }))
                }}
                className='sales-report__filter-input'
                placeholder='₱100,000'
              />
            </div>
          </div>

          <div className='sales-report__tabs'>
            {(filters.dataType === 'Flights' || filters.dataType === 'Both') && (
              <button
                className={`sales-report__tab ${activeAgentTab === 'Flights' ? 'sales-report__tab--active' : ''}`}
                onClick={() => setActiveAgentTab('Flights')}
              >
                Flights
              </button>
            )}
            {(filters.dataType === 'Tours' || filters.dataType === 'Both') && (
              <button
                className={`sales-report__tab ${activeAgentTab === 'Tours' ? 'sales-report__tab--active' : ''}`}
                onClick={() => setActiveAgentTab('Tours')}
              >
                Tours
              </button>
            )}
          </div>

          <div className='sales-report__table-container'>
            <table className='sales-report__table'>
              <thead>
                <tr>
                  <th
                    className='sales-report__table-header sales-report__table-header--sortable'
                    onClick={() =>
                      handleSort('agentName', agentSort, setAgentSort)
                    }
                  >
                    Agent
                    {agentSort.key === 'agentName' && (
                      <span className='sales-report__sort-indicator'>
                        {agentSort.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th
                    className='sales-report__table-header sales-report__table-header--sortable'
                    onClick={() =>
                      handleSort(
                        'destinationCountry',
                        agentSort,
                        setAgentSort
                      )
                    }
                  >
                    {activeAgentTab === 'Tours' ? 'Country' : 'Destination'}
                    {agentSort.key === 'destinationCountry' && (
                      <span className='sales-report__sort-indicator'>
                        {agentSort.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th
                    className='sales-report__table-header sales-report__table-header--sortable'
                    onClick={() => handleSort('title', agentSort, setAgentSort)}
                  >
                    {activeAgentTab === 'Tours' ? 'Title' : 'Trip Type'}
                    {agentSort.key === 'title' && (
                      <span className='sales-report__sort-indicator'>
                        {agentSort.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th
                    className='sales-report__table-header sales-report__table-header--sortable'
                    onClick={() =>
                      handleSort('bookingReference', agentSort, setAgentSort)
                    }
                  >
                    Booking Ref
                    {agentSort.key === 'bookingReference' && (
                      <span className='sales-report__sort-indicator'>
                        {agentSort.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th
                    className='sales-report__table-header sales-report__table-header--sortable'
                    onClick={() => handleSort('amount', agentSort, setAgentSort)}
                  >
                    Amount
                    {agentSort.key === 'amount' && (
                      <span className='sales-report__sort-indicator'>
                        {agentSort.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th
                    className='sales-report__table-header sales-report__table-header--sortable'
                    onClick={() => handleSort('status', agentSort, setAgentSort)}
                  >
                    Status
                    {agentSort.key === 'status' && (
                      <span className='sales-report__sort-indicator'>
                        {agentSort.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAgentBookings.map((booking) => (
                  <tr className='sales-report__table-row' key={booking.key}>
                    <td className='sales-report__table-cell'>
                      {booking.agentName}
                    </td>
                    <td className='sales-report__table-cell'>
                      {activeAgentTab === 'Tours'
                        ? booking.destinationCountry
                        : booking.destinationCountry}
                    </td>
                                        <td className='sales-report__table-cell'>
                                          {activeAgentTab === 'Tours'
                                            ? booking.title || 'N/A'
                                            : normalizeTripType(booking.tripType)}
                                        </td>
                    <td className='sales-report__table-cell'>
                      {booking.bookingReference}
                    </td>
                    <td className='sales-report__table-cell sales-report__table-cell--amount'>
                      ₱
                      {(booking.amount || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className='sales-report__table-cell'>{booking.status}</td>
                  </tr>
                ))}

                {filteredTotal === 0 && (
                  <tr>
                    <td
                      className='sales-report__table-cell sales-report__table-cell--no-data'
                      colSpan='6'
                    >
                      No data found for {activeAgentTab.toLowerCase()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className='sales-report__pagination'>
            <ReactPaginate
              previousLabel={'← Previous'}
              nextLabel={'Next →'}
              breakLabel={'...'}
              pageCount={Math.ceil(filteredTotal / agentPageSize) || 1}
              forcePage={agentPage[activeAgentTab]}
              onPageChange={({ selected }) =>
                setAgentPage((prev) => ({ ...prev, [activeAgentTab]: selected }))
              }
              containerClassName={'sales-report__pagination-container'}
              activeClassName={'sales-report__pagination--active'}
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesReport
