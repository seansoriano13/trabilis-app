import { useState, useEffect } from 'react'
import axios from 'axios'
import './Ratings.css'
import { useSnackbar } from '../../context/SnackbarContext'
import { FaStar } from 'react-icons/fa'
import { FiStar, FiFilter, FiRefreshCw, FiMessageSquare } from 'react-icons/fi'
import { BACKEND_URL } from '../../config'

const Ratings = () => {
  const { showSuccess, showError } = useSnackbar()
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  // Filters
  const [filters, setFilters] = useState({
    date_range: 'All',
    rating: '',
    assignedStaff: '',
  })

  // Debounced input state
  const [assignedStaffInput, setAssignedStaffInput] = useState('')

  // Debounce assignedStaff input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, assignedStaff: assignedStaffInput }))
    }, 500)

    return () => clearTimeout(timer)
  }, [assignedStaffInput])

  const fetchRatings = async () => {
    if (loading) {
      setLoading(true)
    } else {
      setSearchLoading(true)
    }

    try {
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams()

      // Handle date range filter
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
          params.append('startDate', startDate.toISOString())
          params.append('endDate', endDate.toISOString())
        }
      }

      if (filters.rating) params.append('rating', filters.rating)
      if (filters.assignedStaff)
        params.append('assignedStaff', filters.assignedStaff)

      const response = await axios.get(
        `${BACKEND_URL}/api/v1/ratings?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setRatings(response.data.ratings || [])
    } catch (error) {
      console.error('Error fetching ratings:', error)
      showError('Failed to fetch ratings')
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    fetchRatings()
  }, [filters])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    if (name === 'assignedStaff') {
      setAssignedStaffInput(value)
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }))
    }
  }

  const clearFilters = () => {
    setFilters({
      date_range: 'All',
      rating: '',
      assignedStaff: '',
    })
    setAssignedStaffInput('')
  }

  const renderStars = (rating) => {
    return (
      <div className='star-rating'>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? 'star-filled' : 'star-empty'}
          />
        ))}
      </div>
    )
  }

  return (
    <div className='ratings'>
      <div className='ratings__header'>
        <div className='ratings__header-content'>
          <div className='ratings__header-icon'>
            <FiStar size={32} />
          </div>
          <div className='ratings__header-text'>
            <h1>Tour Ratings & Feedback</h1>
            <p>View and filter customer ratings and feedback</p>
          </div>
        </div>
        <div className='ratings__header-actions'>
          <button
            className='ratings__action-btn ratings__action-btn--refresh'
            onClick={fetchRatings}
            disabled={loading}
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className='ratings__filter'>
        <div className='ratings__filter-header'>
          <div className='ratings__filter-title'>
            <FiFilter size={18} />
            <span>Filters & Search</span>
          </div>
          <button
            className='ratings__filter-clear'
            onClick={clearFilters}
          >
            <FiRefreshCw size={14} />
            Clear All
          </button>
        </div>

        <div className='ratings__filter-grid'>
          {/* Quick Filters */}
          <div className='ratings__filter-section'>
            <div className='ratings__filter-section-title'>Quick Filters</div>
            <div className='ratings__filter-row'>
              <div className='ratings__filter-group'>
                <select
                  name='date_range'
                  value={filters.date_range}
                  onChange={handleFilterChange}
                  className='ratings__filter-select'
                >
                  <option value='All'>All Time</option>
                  <option value='today'>Today</option>
                  <option value='week'>This Week</option>
                  <option value='month'>This Month</option>
                  <option value='quarter'>This Quarter</option>
                  <option value='year'>This Year</option>
                </select>
              </div>

              <div className='ratings__filter-group'>
                <select
                  name='rating'
                  value={filters.rating}
                  onChange={handleFilterChange}
                  className='ratings__filter-select'
                >
                  <option value=''>All Ratings</option>
                  <option value='5'>5 Stars</option>
                  <option value='4'>4 Stars</option>
                  <option value='3'>3 Stars</option>
                  <option value='2'>2 Stars</option>
                  <option value='1'>1 Star</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search Fields */}
          <div className='ratings__filter-section'>
            <div className='ratings__filter-section-title'>Search</div>
            <div className='ratings__filter-row'>
              <div className='ratings__filter-group'>
                <input
                  type='text'
                  name='assignedStaff'
                  placeholder='Staff email...'
                  value={assignedStaffInput}
                  onChange={handleFilterChange}
                  className='ratings__filter-input'
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Table */}
      <div className='ratings__section'>
        <div className='ratings__section-header'>
          <div className='ratings__section-title'>
            <FiMessageSquare size={24} />
            <h2>All Ratings</h2>
            <span className='ratings__section-count'>
              ({ratings.length} ratings)
            </span>
            {searchLoading && (
              <div className='ratings__search-loading'>
                <div className='ratings__search-spinner'></div>
                <span>Searching...</span>
              </div>
            )}
          </div>
        </div>
        {loading ? (
          <div className='ratings__loading'>Loading ratings...</div>
        ) : (
          <div className='ratings__table-container'>
            <table className='ratings__table'>
              <thead>
                <tr>
                  <th className='ratings__table-header'>Tour Name</th>
                  <th className='ratings__table-header'>Passenger</th>
                  <th className='ratings__table-header'>Rating</th>
                  <th className='ratings__table-header'>Date</th>
                  <th className='ratings__table-header'>Assigned Staff</th>
                  <th className='ratings__table-header'>Booking Ref</th>
                </tr>
              </thead>
              <tbody>
                {ratings.length > 0 ? (
                  ratings.map((rating) => (
                    <tr
                      key={rating.id}
                      className='ratings__table-row'
                    >
                      <td className='ratings__table-cell'>{rating.tourName}</td>
                      <td className='ratings__table-cell'>
                        <div className='ratings__passenger-name'>
                          {rating.passengerName}
                        </div>
                        <div className='ratings__passenger-email'>
                          {rating.passengerEmail}
                        </div>
                      </td>
                      <td className='ratings__table-cell'>
                        {renderStars(rating.rating)}
                      </td>
                      <td className='ratings__table-cell'>
                        {new Date(rating.created_at).toLocaleDateString()}
                      </td>
                      <td className='ratings__table-cell'>
                        {rating.assignedStaffEmail}
                      </td>
                      <td className='ratings__table-cell ratings__table-cell--ref'>
                        {rating.bookingReference}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan='6'
                      className='ratings__table-cell ratings__table-cell--no-data'
                    >
                      No ratings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Ratings
