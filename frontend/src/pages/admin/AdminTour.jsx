// AdminTour.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSnackbar } from '../../context/SnackbarContext'
import {
  FiMap,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiPackage,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiEdit,
  FiUserPlus,
  FiFileText,
  FiDownload,
  FiCalendar,
  FiX,
  FiUser,
  FiActivity,
  FiEye,
} from 'react-icons/fi'
import Select from 'react-select'
import ReactPaginate from 'react-paginate'
import './AdminTour.css'
import { supabase } from '../../api/supabaseClient'
import AssignmentModal from '../../components/admin/AssignmentModal'
import TourBookingEditModal from '../../components/admin/TourBookingEditModal'
import adminClient from '../../api/adminClient'
import { getCurrentAdmin } from '../../utils/jwtUtils'

const AdminTours = () => {
  const { showSuccess, showError } = useSnackbar()
  const [tourBookings, setTourBookings] = useState([])
  const [tourStats, setTourStats] = useState({})
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState(null)

  const [sort, setSort] = useState({
    key: 'created_at',
    direction: 'desc',
  })
  const [filters, setFilters] = useState({
    status: 'All',
    package_name: '',
    reference: '',
    lead_name: '',
    lead_email: '',
    assignment_status: 'All',
    date_range: 'All',
    show_my_bookings: false,
  })
  const [searchInput, setSearchInput] = useState('')
  const [referenceInput, setReferenceInput] = useState('')
  const [leadNameInput, setLeadNameInput] = useState('')
  const [leadEmailInput, setLeadEmailInput] = useState('')
  const [assignmentModal, setAssignmentModal] = useState({
    isOpen: false,
    bookingId: null,
    bookingReference: '',
    bookingType: 'tour',
  })

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  const pageSize = 20
  const jwt = localStorage.getItem('adminToken')
  const userRole = localStorage.getItem('admin_role')

  // const dateRangeOptions = [
  //     { value: 'All', label: 'All Time' },
  //     { value: 'today', label: 'Today' },
  //     { value: 'week', label: 'This Week' },
  //     { value: 'month', label: 'This Month' },
  //     { value: 'quarter', label: 'This Quarter' },
  //     { value: 'year', label: 'This Year' }
  // ]

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
            ),
            assigned_by_staff:assigned_by (
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
          // We'll filter this client-side since Supabase can't filter on nested relationships
          // The filtering will be done after fetching the data
        }
        if (filters.reference) {
          query = query.ilike('booking_reference', `%${filters.reference}%`)
        }
        if (filters.lead_name) {
          query = query.or(
            `lead_first_name.ilike.%${filters.lead_name}%,lead_last_name.ilike.%${filters.lead_name}%`
          )
        }
        if (filters.lead_email) {
          query = query.ilike('lead_email', `%${filters.lead_email}%`)
        }
        if (filters.assignment_status && filters.assignment_status !== 'All') {
          query = query.eq('assignment_status', filters.assignment_status)
        }

        // My Bookings filter
        if (filters.show_my_bookings) {
          const currentUser = getCurrentAdmin()
          if (currentUser && currentUser.id) {
            query = query.eq('assigned_to', currentUser.id)
          }
        }

        // Date range filtering
        if (filters.date_range && filters.date_range !== 'All') {
          const now = new Date()
          let startDate, endDate

          switch (filters.date_range) {
            case 'today':
              startDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
              )
              endDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + 1
              )
              break
            case 'week':
              startDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() - 7
              )
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
            query = query
              .gte('created_at', startDate.toISOString())
              .lt('created_at', endDate.toISOString())
          }
        }

        const bookingsRes = await query

        if (bookingsRes.error) {
          throw new Error('Failed to fetch data')
        }

        // Calculate stats from the data
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

        // Get all bookings for stats calculation (not just paginated)
        const allBookingsQuery = supabase.from('tour_bookings').select(`
                        *,
                        package_dates (
                            tour_packages (title)
                        )
                    `)

        const allBookingsRes = await allBookingsQuery

        if (allBookingsRes.error) {
          throw new Error('Failed to fetch stats data')
        }

        const allBookings = allBookingsRes.data || []

        // Calculate statistics
        const stats = {
          in_progress_bookings: allBookings.filter(
            (booking) => booking.assignment_status === 'in_progress'
          ).length,
          monthly_revenue: allBookings
            .filter((booking) => {
              const bookingDate = new Date(booking.created_at)
              return bookingDate >= startOfMonth && bookingDate < endOfMonth
            })
            .reduce(
              (sum, booking) => sum + (Number(booking.total_amount) || 0),
              0
            ),
          cancelled_bookings: allBookings.filter((booking) => {
            const bookingDate = new Date(booking.created_at)
            return (
              booking.status === 'CANCELLED' &&
              bookingDate >= startOfMonth &&
              bookingDate < endOfMonth
            )
          }).length,
          popular_package: (() => {
            const packageCounts = {}
            allBookings.forEach((booking) => {
              const packageTitle =
                booking.package_dates?.tour_packages?.title || 'Unknown'
              packageCounts[packageTitle] =
                (packageCounts[packageTitle] || 0) + 1
            })
            const sortedPackages = Object.entries(packageCounts).sort(
              ([, a], [, b]) => b - a
            )
            return sortedPackages.length > 0 ? sortedPackages[0][0] : '-'
          })(),
        }

        // Apply client-side filtering for package name
        let filteredBookings = bookingsRes.data || []
        if (filters.package_name && filters.package_name.trim() !== '') {
          filteredBookings = filteredBookings.filter((booking) => {
            const packageTitle =
              booking.package_dates?.tour_packages?.title || ''
            return packageTitle
              .toLowerCase()
              .includes(filters.package_name.toLowerCase())
          })
        }

        setTourBookings(filteredBookings)
        setTourStats(stats)
        // Use filtered count only if we applied client-side filtering, otherwise use server count
        setTotal(
          filters.package_name && filters.package_name.trim() !== ''
            ? filteredBookings.length
            : bookingsRes.count || 0
        )
        setLoading(false)
        setSearchLoading(false)
      } catch (err) {
        console.error(err)
        setError('Failed to load tours. Please try again.')
        setLoading(false)
        setSearchLoading(false)
      }
    }

    fetchData()
  }, [page, filters, sort, jwt, loading])

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, k) => o?.[k], obj) || ''
  }

  const handleSort = (key) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
    setPage(0)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    if (name === 'package_name') {
      setSearchInput(value)
    } else if (name === 'reference') {
      setReferenceInput(value)
    } else if (name === 'lead_name') {
      setLeadNameInput(value)
    } else if (name === 'lead_email') {
      setLeadEmailInput(value)
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }))
      setPage(0)
    }
  }

  const clearFilters = () => {
    setFilters({
      status: 'All',
      package_name: '',
      reference: '',
      lead_name: '',
      lead_email: '',
      assignment_status: 'All',
      date_range: 'All',
      show_my_bookings: false,
    })
    setSearchInput('')
    setReferenceInput('')
    setLeadNameInput('')
    setLeadEmailInput('')
    setPage(0)
  }

  const handleAssignBooking = (
    bookingId,
    bookingReference,
    currentAssignedStaffId
  ) => {
    setAssignmentModal({
      isOpen: true,
      bookingId,
      bookingReference,
      bookingType: 'tour',
      currentAssignedStaffId: currentAssignedStaffId,
    })
  }

  const handleAssignmentSuccess = (updatedBooking) => {
    // Refresh the data to show updated assignment
    setTourBookings((prev) =>
      prev.map((booking) =>
        booking.id === updatedBooking.id ? updatedBooking : booking
      )
    )
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
      const response = await adminClient.put(
        `/tours/${selectedBooking.id}/edit`,
        submitData
      )
      if (response.data.success) {
        setTourBookings((prev) =>
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
        <div className='tours__summary-card tours__summary-card--in-progress'>
          <div className='tours__summary-icon'>
            <FiActivity size={24} />
          </div>
          <div className='tours__summary-content'>
            <h3>In Progress</h3>
            <p>{tourStats.in_progress_bookings || 0}</p>
            <span className='tours__summary-label'>Active assignments</span>
          </div>
        </div>
        <div className='tours__summary-card tours__summary-card--revenue-month'>
          <div className='tours__summary-icon'>
            <FiDollarSign size={24} />
          </div>
          <div className='tours__summary-content'>
            <h3>Revenue This Month</h3>
            <p>₱{(tourStats.monthly_revenue || 0).toLocaleString()}</p>
            <span className='tours__summary-label'>Current month</span>
          </div>
        </div>
        <div className='tours__summary-card tours__summary-card--cancelled'>
          <div className='tours__summary-icon'>
            <FiTrendingUp size={24} />
          </div>
          <div className='tours__summary-content'>
            <h3>Cancelled Bookings</h3>
            <p>{tourStats.cancelled_bookings || 0}</p>
            <span className='tours__summary-label'>This month</span>
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
          <div className='tours__filter-title'>
            <FiFilter size={18} />
            <span>Filters & Search</span>
          </div>
          <button
            className='tours__filter-clear'
            onClick={clearFilters}
          >
            <FiRefreshCw size={14} />
            Clear All
          </button>
        </div>

        <div className='tours__filter-grid'>
          {/* Quick Filters */}
          <div className='tours__filter-section'>
            <div className='tours__filter-section-title'>Quick Filters</div>
            <div className='tours__filter-row'>
              <div className='tours__filter-group'>
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
                <select
                  name='assignment_status'
                  value={filters.assignment_status}
                  onChange={handleFilterChange}
                  className='tours__filter-select'
                >
                  <option value='All'>All Assignments</option>
                  <option value='pending'>Pending</option>
                  <option value='in_progress'>In Progress</option>
                  <option value='completed'>Approved</option>
                </select>
              </div>
              <div className='tours__filter-group'>
                <select
                  name='date_range'
                  value={filters.date_range}
                  onChange={handleFilterChange}
                  className='tours__filter-select'
                >
                  <option value='All'>All Time</option>
                  <option value='today'>Today</option>
                  <option value='week'>This Week</option>
                  <option value='month'>This Month</option>
                  <option value='quarter'>This Quarter</option>
                  <option value='year'>This Year</option>
                </select>
              </div>
              <div className='tours__filter-group' style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type='checkbox'
                  id='show_my_bookings_tour'
                  checked={filters.show_my_bookings}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      show_my_bookings: e.target.checked,
                    }))
                  }
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
                <label htmlFor='show_my_bookings_tour' style={{ margin: 0, cursor: 'pointer', userSelect: 'none' }}>
                  <FiUser style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  My Bookings Only
                </label>
              </div>
            </div>
          </div>

          {/* Search Fields */}
          <div className='tours__filter-section'>
            <div className='tours__filter-section-title'>Search</div>
            <div className='tours__filter-row'>
              <div className='tours__filter-group'>
                <input
                  type='text'
                  name='package_name'
                  value={searchInput}
                  onChange={handleFilterChange}
                  placeholder='Package name...'
                  className='tours__filter-input'
                />
              </div>
              <div className='tours__filter-group'>
                <input
                  type='text'
                  name='reference'
                  value={referenceInput}
                  onChange={handleFilterChange}
                  placeholder='Booking reference...'
                  className='tours__filter-input'
                />
              </div>
              <div className='tours__filter-group'>
                <input
                  type='text'
                  name='lead_name'
                  value={leadNameInput}
                  onChange={handleFilterChange}
                  placeholder='Lead name...'
                  className='tours__filter-input'
                />
              </div>
              <div className='tours__filter-group'>
                <input
                  type='text'
                  name='lead_email'
                  value={leadEmailInput}
                  onChange={handleFilterChange}
                  placeholder='Lead email...'
                  className='tours__filter-input'
                />
              </div>
            </div>
          </div>

          {/* Sort */}
          <div className='tours__filter-section'>
            <div className='tours__filter-section-title'>Sort</div>
            <div className='tours__filter-row'>
              <div className='tours__filter-group'>
                <select
                  name='order'
                  value={sort.key === 'created_at' ? sort.direction : 'desc'}
                  onChange={(e) => {
                    setSort({ key: 'created_at', direction: e.target.value })
                    setPage(0)
                  }}
                  className='tours__filter-select'
                >
                  <option value='desc'>Newest first</option>
                  <option value='asc'>Oldest first</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='tours__section'>
        <div className='tours__section-header'>
          <div className='tours__section-title'>
            <FiPackage size={24} />
            <h2>Tour Bookings</h2>
            <span className='tours__section-count'>({total} bookings)</span>
            {searchLoading && (
              <div className='tours__search-loading'>
                <div className='tours__search-spinner'></div>
                <span>Searching...</span>
              </div>
            )}
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
                  onClick={() => handleSort('created_at')}
                  className='tours__table-header tours__table-header--sortable'
                >
                  <div className='tours__table-header-content'>
                    <span>Booked</span>
                    {sort.key === 'created_at' && (
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
                  onClick={() =>
                    handleSort('package_dates.tour_packages.title')
                  }
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
                <tr
                  key={booking.id}
                  className='tours__table-row'
                >
                  <td className='tours__table-cell tours__table-cell--reference'>
                    <Link
                      to={`/admin/tour-sales/${booking.id}`}
                      className='tours__booking-link'
                    >
                      {booking.booking_reference}
                    </Link>
                  </td>
                  <td className='tours__table-cell'>
                    {booking.created_at
                      ? new Date(booking.created_at).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className='tours__table-cell'>
                    <span
                      className={`tours__status tours__status--${booking.status.toLowerCase()}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className='tours__table-cell tours__table-cell--package'>
                    <div className='tours__package-info'>
                      <span className='tours__package-name'>
                        {getNestedValue(
                          booking,
                          'package_dates.tour_packages.title'
                        ) || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className='tours__table-cell'>
                    {booking.package_dates?.start_date
                      ? new Date(
                          booking.package_dates.start_date
                        ).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className='tours__table-cell'>
                    {booking.package_dates?.end_date
                      ? new Date(
                          booking.package_dates.end_date
                        ).toLocaleDateString()
                      : '-'}
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
                              {booking.assigned_staff?.first_name}{' '}
                              {booking.assigned_staff?.last_name}
                            </span>
                            <span className='tours__assignment-staff-email'>
                              {booking.assigned_staff?.email}
                            </span>
                            {!booking.assigned_by && (
                              <span className='tours__assignment-auto'>
                                <FiActivity size={12} />
                                Auto-assigned
                              </span>
                            )}
                          </div>
                          <span
                            className={`tours__assignment-status tours__assignment-status--${booking.assignment_status}`}
                          >
                            {booking.assignment_status?.replace('_', ' ') ||
                              'pending'}
                          </span>
                          <span className='tours__assignment-date'>
                            {booking.assigned_at
                              ? new Date(
                                  booking.assigned_at
                                ).toLocaleDateString()
                              : '-'}
                          </span>
                        </div>
                      ) : (
                        <span className='tours__assignment-unassigned'>
                          Unassigned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className='tours__table-cell tours__table-cell--actions'>
                    <div className='tours__actions'>
                      {userRole === 'admin' && (
                        <button
                          className='action-btn assign-btn'
                          title='Assign to Accounting'
                          onClick={() =>
                            handleAssignBooking(
                              booking.id,
                              booking.booking_reference,
                              booking.assigned_to
                            )
                          }
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
        onClose={() =>
          setAssignmentModal({
            isOpen: false,
            bookingId: null,
            bookingReference: '',
            bookingType: 'tour',
            currentAssignedStaffId: null,
          })
        }
        bookingId={assignmentModal.bookingId}
        bookingReference={assignmentModal.bookingReference}
        bookingType={assignmentModal.bookingType}
        currentAssignedStaffId={assignmentModal.currentAssignedStaffId}
        onSuccess={handleAssignmentSuccess}
      />

      {/* Edit Modal */}
      <TourBookingEditModal
        isOpen={showEditModal}
        booking={selectedBooking}
        onClose={handleCloseModal}
        onSubmit={handleEditSubmit}
        context='admin'
      />
    </div>
  )
}

export default AdminTours
