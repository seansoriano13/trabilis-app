import { useState, useEffect } from 'react'
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
import {
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiBarChart2,
  FiAward,
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
  const [error, setError] = useState(null)
  const [selectedTraveler, setSelectedTraveler] = useState(null)

  // Filters
  const [filters, setFilters] = useState({
    date_range: 'All',
    flightClass: 'All',
  })

  const [customRange, setCustomRange] = useState([null, null])

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

      const [reportRes, travelersRes] = await Promise.all([
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
      ])

      console.log('Report data received:', reportRes.data)
      console.log('Summary:', reportRes.data?.summary)
      console.log('Revenue Trends:', reportRes.data?.revenueTrends)
      console.log('Bookings found:', reportRes.data?.summary?.bookingCount)

      setReportData(reportRes.data)
      setTopTravelers(travelersRes.data.topTravelers || [])
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
                <h3>Total Revenue</h3>
                <p>
                  ₱
                  {reportData.summary.totalRevenue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <span className='sales-report__summary-label'>
                  All bookings
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
                <span className='sales-report__summary-label'>Completed</span>
              </div>
            </div>

            <div className='sales-report__summary-card sales-report__summary-card--average'>
              <div className='sales-report__summary-icon'>
                <FiTrendingUp size={24} />
              </div>
              <div className='sales-report__summary-content'>
                <h3>Average Booking Value</h3>
                <p>
                  ₱
                  {reportData.summary.averageBookingValue.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>
                <span className='sales-report__summary-label'>Per booking</span>
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
                  <table className='sales-report__table'>
                    <thead>
                      <tr>
                        <th className='sales-report__table-header'>Rank</th>
                        <th className='sales-report__table-header'>Name</th>
                        <th className='sales-report__table-header'>Email</th>
                        <th className='sales-report__table-header'>Bookings</th>
                        <th className='sales-report__table-header'>
                          Total Revenue
                        </th>
                        <th className='sales-report__table-header'>
                          Booking References
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topTravelers.length > 0 ? (
                        topTravelers.map((traveler) => (
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
    </div>
  )
}

export default SalesReport
