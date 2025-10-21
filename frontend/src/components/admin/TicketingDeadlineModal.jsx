import React, { useState, useEffect } from 'react'
import { BsX } from 'react-icons/bs'
import {
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiUser,
  FiFilter,
} from 'react-icons/fi'
import { supabase } from '../../api/supabaseClient'
import { Link } from 'react-router-dom'
import './TicketingDeadlineModal.css'

const TicketingDeadlineModal = ({ isOpen, onClose }) => {
  const [deadlineBookings, setDeadlineBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [staffFilter, setStaffFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all') // all, critical, urgent, safe
  const [adminList, setAdminList] = useState([])

  useEffect(() => {
    if (isOpen) {
      fetchDeadlineBookings()
      fetchAdminList()
    }
  }, [isOpen])

  const fetchAdminList = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, first_name, last_name')
        .order('first_name')

      if (error) throw error
      setAdminList(data || [])
    } catch (error) {
      console.error('Error fetching admin list:', error)
    }
  }

  const fetchDeadlineBookings = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      // Fetch all BOOKED flight bookings with ticketing deadlines
      const { data, error } = await supabase
        .from('flight_bookings')
        .select(
          `
          *,
          admin_users!flight_bookings_assigned_to_fkey(
            id,
            first_name,
            last_name
          )
        `
        )
        .eq('status', 'BOOKED')
        .is('ticketed_at', null)
        .not('ticketing_deadline', 'is', null)
        .lte('ticketing_deadline', sevenDaysFromNow.toISOString())
        .order('ticketing_deadline', { ascending: true })

      if (error) throw error

      // Calculate hours remaining and urgency for each booking
      const bookingsWithUrgency = (data || []).map((booking) => {
        const deadline = new Date(booking.ticketing_deadline)
        const hoursRemaining = Math.max(
          0,
          Math.round((deadline - now) / (1000 * 60 * 60))
        )

        let urgency
        if (hoursRemaining <= 24)
          urgency = 'critical' // Red
        else if (hoursRemaining <= 48)
          urgency = 'urgent' // Orange
        else if (hoursRemaining <= 96)
          urgency = 'warning' // Yellow
        else urgency = 'safe' // Green

        return {
          ...booking,
          hoursRemaining,
          urgency,
        }
      })

      setDeadlineBookings(bookingsWithUrgency)
    } catch (error) {
      console.error('Error fetching deadline bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyLabel = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'Critical (<24h)'
      case 'urgent':
        return 'Urgent (<48h)'
      case 'warning':
        return 'Warning (<4d)'
      case 'safe':
        return 'On Track'
      default:
        return 'Unknown'
    }
  }

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'critical':
      case 'urgent':
        return <FiAlertTriangle />
      case 'warning':
        return <FiClock />
      case 'safe':
        return <FiCheckCircle />
      default:
        return <FiClock />
    }
  }

  // Apply filters
  const filteredBookings = deadlineBookings.filter((booking) => {
    // Staff filter
    if (staffFilter !== 'all') {
      const assignedId = booking.assigned_to?.toString()
      if (staffFilter === 'unassigned') {
        if (assignedId) return false
      } else {
        if (assignedId !== staffFilter) return false
      }
    }

    // Urgency filter
    if (urgencyFilter !== 'all' && booking.urgency !== urgencyFilter) {
      return false
    }

    return true
  })

  const stats = {
    critical: filteredBookings.filter((b) => b.urgency === 'critical').length,
    urgent: filteredBookings.filter((b) => b.urgency === 'urgent').length,
    warning: filteredBookings.filter((b) => b.urgency === 'warning').length,
    safe: filteredBookings.filter((b) => b.urgency === 'safe').length,
  }

  if (!isOpen) return null

  return (
    <div
      className='ticketing-modal-overlay'
      onClick={onClose}
    >
      <div
        className='ticketing-modal-content'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='ticketing-modal-header'>
          <div>
            <h2>
              <FiClock /> Ticketing Deadline Monitor
            </h2>
            <p>Track all flight bookings requiring ticketing</p>
          </div>
          <button
            className='ticketing-modal-close'
            onClick={onClose}
          >
            <BsX />
          </button>
        </div>

        {/* Stats Bar */}
        <div className='ticketing-stats-bar'>
          <div className='ticketing-stat ticketing-stat--critical'>
            <FiAlertTriangle />
            <span className='ticketing-stat-count'>{stats.critical}</span>
            <span className='ticketing-stat-label'>Critical</span>
          </div>
          <div className='ticketing-stat ticketing-stat--urgent'>
            <FiAlertTriangle />
            <span className='ticketing-stat-count'>{stats.urgent}</span>
            <span className='ticketing-stat-label'>Urgent</span>
          </div>
          <div className='ticketing-stat ticketing-stat--warning'>
            <FiClock />
            <span className='ticketing-stat-count'>{stats.warning}</span>
            <span className='ticketing-stat-label'>Warning</span>
          </div>
          <div className='ticketing-stat ticketing-stat--safe'>
            <FiCheckCircle />
            <span className='ticketing-stat-count'>{stats.safe}</span>
            <span className='ticketing-stat-label'>On Track</span>
          </div>
        </div>

        {/* Filters */}
        <div className='ticketing-filters'>
          <div className='ticketing-filter-group'>
            <label>
              <FiUser /> Assigned To
            </label>
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
            >
              <option value='all'>All Staff</option>
              <option value='unassigned'>Unassigned</option>
              {adminList.map((admin) => (
                <option
                  key={admin.id}
                  value={admin.id.toString()}
                >
                  {admin.first_name} {admin.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className='ticketing-filter-group'>
            <label>
              <FiFilter /> Urgency Level
            </label>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
            >
              <option value='all'>All Levels</option>
              <option value='critical'>Critical (&lt;24h)</option>
              <option value='urgent'>Urgent (&lt;48h)</option>
              <option value='warning'>Warning (&lt;4d)</option>
              <option value='safe'>On Track</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        <div className='ticketing-modal-body'>
          {loading ? (
            <div className='ticketing-loading'>
              <div className='loading-spinner'></div>
              <p>Loading deadline bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className='ticketing-empty'>
              <FiCheckCircle size={48} />
              <p>No bookings found matching filters</p>
            </div>
          ) : (
            <div className='ticketing-bookings-list'>
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`ticketing-booking-card ticketing-booking-card--${booking.urgency}`}
                >
                  <div className='ticketing-booking-header'>
                    <div className='ticketing-booking-reference'>
                      <strong>{booking.booking_reference}</strong>
                      <span
                        className={`ticketing-urgency-badge ticketing-urgency-badge--${booking.urgency}`}
                      >
                        {getUrgencyIcon(booking.urgency)}
                        {getUrgencyLabel(booking.urgency)}
                      </span>
                    </div>
                    <div className='ticketing-booking-deadline'>
                      <FiClock />
                      <span className='ticketing-hours-remaining'>
                        {booking.hoursRemaining}h remaining
                      </span>
                    </div>
                  </div>

                  <div className='ticketing-booking-details'>
                    <div className='ticketing-detail-item'>
                      <span className='ticketing-detail-label'>Deadline:</span>
                      <span className='ticketing-detail-value'>
                        {new Date(booking.ticketing_deadline).toLocaleString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </span>
                    </div>

                    <div className='ticketing-detail-item'>
                      <span className='ticketing-detail-label'>PNR:</span>
                      <span className='ticketing-detail-value'>
                        {booking.pnr || 'N/A'}
                      </span>
                    </div>

                    <div className='ticketing-detail-item'>
                      <span className='ticketing-detail-label'>
                        Assigned To:
                      </span>
                      <span className='ticketing-detail-value'>
                        {booking.admin_users
                          ? `${booking.admin_users.first_name} ${booking.admin_users.last_name}`
                          : 'Unassigned'}
                      </span>
                    </div>

                    <div className='ticketing-detail-item'>
                      <span className='ticketing-detail-label'>Amount:</span>
                      <span className='ticketing-detail-value'>
                        {booking.currency}{' '}
                        {booking.total_amount?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className='ticketing-booking-actions'>
                    <Link
                      to={`/admin/flights/${booking.id}`}
                      className='ticketing-action-btn ticketing-action-btn--view'
                      onClick={onClose}
                    >
                      View Booking
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='ticketing-modal-footer'>
          <p className='ticketing-footer-note'>
            <FiAlertTriangle />
            Bookings must be ticketed before the deadline to avoid automatic
            cancellation
          </p>
          <button
            className='btn btn-secondary'
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketingDeadlineModal
