import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { RxHamburgerMenu, RxCross2 } from 'react-icons/rx'
import {
  FiHome,
  FiPackage,
  FiTrendingUp,
  FiNavigation,
  FiUsers,
  FiShield,
  FiBell,
  FiUser,
  FiLogOut,
  FiSettings,
  FiChevronDown,
  FiMenu,
  FiX,
  FiActivity,
  FiBarChart2,
  FiStar,
} from 'react-icons/fi'
import adminLogo from '../../assets/admin/admin-logo.png'
import { useState, useEffect } from 'react'
import clsx from 'clsx'
import './AdminNavbar.css'
import AdminPrimaryButton from '../admin/AdminPrimaryButton'
import ThemeToggle from './ThemeToggle'
import adminClient from '../../api/adminClient.js'
import { CgProfile } from 'react-icons/cg'
import { RiNotification4Line } from 'react-icons/ri'
import { FaCircle } from 'react-icons/fa'
import Pusher from 'pusher-js'
import NotificationItem from './NotificationItem'
import NotificationFilters from './NotificationFilters'
import { getFilterOptions } from '../../utils/notificationHelpers'

function AdminNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [isProfileOpen, setProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [userRole, setUserRole] = useState(
    localStorage.getItem('admin_role') || null
  )
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)

  // Enhanced notification state
  const [activeFilter, setActiveFilter] = useState('all')
  const [unreadOnly, setUnreadOnly] = useState(true)
  const [assignedToMe, setAssignedToMe] = useState(false)
  const [bookingType, setBookingType] = useState('all')
  const [unreadCount, setUnreadCount] = useState(0)
  const [filterCounts, setFilterCounts] = useState({})

  const location = useLocation()
  const navigate = useNavigate()
  const jwt = localStorage.getItem('adminToken')
  const adminEmail = localStorage.getItem('admin_email')
  const currentUserId = localStorage.getItem('admin_id')

  const PROD = true

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchRole = async () => {
      if (!jwt) {
        setLoading(false)
        window.location.href = '/admin/login'
        return
      }

      try {
        const cachedRole = localStorage.getItem('admin_role')
        if (cachedRole) {
          setUserRole(cachedRole)
          setLoading(false)
          return
        }

        const { data } = await adminClient.get('/me')
        setUserRole(data.role)
        localStorage.setItem('admin_role', data.role)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }

    fetchRole()
  }, [jwt, location.pathname])

  // Fetch notifications with filters
  const fetchNotifications = async () => {
    if (!jwt) return

    setNotificationsLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '100',
        category: activeFilter,
        unread_only: unreadOnly.toString(),
        assigned_to_me: assignedToMe.toString(),
        booking_type: bookingType,
      })

      const response = await adminClient.get(
        `/dashboard/admin_notifications?${params}`
      )
      if (response.data.data) {
        setNotifications(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setNotificationsLoading(false)
    }
  }

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!jwt) return

    try {
      const response = await adminClient.get(
        '/dashboard/admin_notifications/unread-count'
      )
      if (response.data.success) {
        setUnreadCount(response.data.count)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  // Fetch filter counts
  const fetchFilterCounts = async () => {
    if (!jwt) return

    try {
      const filterOptions = getFilterOptions()
      const counts = {}

      for (const filter of filterOptions) {
        if (filter.value === 'error' && userRole !== 'admin') continue

        const params = new URLSearchParams({
          category: filter.value,
          unread_only: 'true',
        })

        const response = await adminClient.get(
          `/dashboard/admin_notifications/unread-count?${params}`
        )
        if (response.data.success) {
          counts[filter.value] = response.data.count
        }
      }

      setFilterCounts(counts)
    } catch (error) {
      console.error('Error fetching filter counts:', error)
    }
  }

  // Fetch notifications when filters change
  useEffect(() => {
    fetchNotifications()
  }, [jwt, activeFilter, unreadOnly, assignedToMe, bookingType])

  // Fetch unread count and filter counts on mount
  useEffect(() => {
    fetchUnreadCount()
    fetchFilterCounts()
  }, [jwt, userRole])

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await adminClient.post('/dashboard/admin_notifications/mark-read', {
        notificationIds: [notificationId],
      })

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, read_by: [...(notif.read_by || []), currentUserId] }
            : notif
        )
      )

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1))

      // Update filter counts
      fetchFilterCounts()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await adminClient.post('/dashboard/admin_notifications/mark-all-read')

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          read_by: [...(notif.read_by || []), currentUserId],
        }))
      )

      setUnreadCount(0)
      fetchFilterCounts()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (notification.isRead === false) {
      markNotificationAsRead(notification.id)
    }

    // Close notification dropdown
    setIsNotificationsOpen(false)
  }

  // Pusher integration for real-time notifications
  useEffect(() => {
    if (!jwt) return

    const pusher = new Pusher('371c6201af1a663a4f58', {
      cluster: 'ap1',
      encrypted: true,
    })

    const channel = pusher.subscribe('admin-notifications')

    // Listen for all notification events
    const eventTypes = [
      'new-booking',
      'booking-assigned',
      'booking-reassigned',
      'assignment-status-updated',
      'booking-status-changed',
      'error-alert',
    ]

    eventTypes.forEach((eventType) => {
      channel.bind(eventType, (data) => {
        console.log(`${eventType} notification:`, data)
        // Refresh notifications and counts
        fetchNotifications()
        fetchUnreadCount()
        fetchFilterCounts()
      })
    })

    return () => {
      pusher.unsubscribe('admin-notifications')
    }
  }, [jwt])

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev)
    setProfileOpen(false)
    setIsNotificationsOpen(false)
  }

  const toggleProfile = () => {
    setProfileOpen((prev) => !prev)
    setMenuOpen(false) // Close mobile menu when profile toggles
    setIsNotificationsOpen(false)
  }

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev)
    setMenuOpen(false)
    setProfileOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('admin_email')
    localStorage.removeItem('admin_role')
    window.location.href = '/admin/login'
  }

  if (loading) {
    return null
  }

  return (
    <>
      <nav
        className={clsx(
          'admin-nav__bar',
          isScrolled && 'admin-nav__bar--scrolled'
        )}
      >
        <div className='admin-nav__container'>
          <div className='admin-nav__brand'>
            <button
              className='admin-nav__mobile-toggle'
              onClick={toggleMenu}
              aria-label='Toggle navigation menu'
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <NavLink
              to='/admin'
              className='admin-nav__logo'
              onClick={() => setMenuOpen(false)}
            >
              <div className='admin-nav__logo-container'>
                <img
                  className='admin-nav__logo-image'
                  src={adminLogo}
                  alt='Admin Dashboard Logo'
                />
                {/* <div className='admin-nav__logo-text'>
                                    <span className='admin-nav__logo-title'>Trabilis</span>
                                    <span className='admin-nav__logo-subtitle'>Admin Panel</span>
                                </div> */}
              </div>
            </NavLink>
          </div>

          <div
            className={clsx(
              'admin-nav__navigation',
              isMenuOpen && 'admin-nav__navigation--open'
            )}
          >
            <ul className='admin-nav__nav-list'>
              <li className='admin-nav__nav-item'>
                <NavLink
                  to='/admin/dashboard'
                  className={({ isActive }) =>
                    clsx(
                      'admin-nav__nav-link',
                      isActive && 'admin-nav__nav-link--active'
                    )
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  <FiHome size={18} />
                  <span>Dashboard</span>
                </NavLink>
              </li>
              {(userRole === 'admin' || userRole === 'travel_consultant') && (
                <li className='admin-nav__nav-item'>
                  <NavLink
                    to='tours'
                    className={({ isActive }) =>
                      clsx(
                        'admin-nav__nav-link',
                        isActive && 'admin-nav__nav-link--active'
                      )
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    <FiPackage size={18} />
                    <span>Tour Packages</span>
                  </NavLink>
                </li>
              )}
              {userRole !== 'travel_consultant' && (
                <li className='admin-nav__nav-item'>
                  <NavLink
                    to='tour-sales'
                    className={({ isActive }) =>
                      clsx(
                        'admin-nav__nav-link',
                        isActive && 'admin-nav__nav-link--active'
                      )
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    <FiTrendingUp size={18} />
                    <span>Tour Sales</span>
                  </NavLink>
                </li>
              )}
              {userRole !== 'travel_consultant' && (
                <li className='admin-nav__nav-item'>
                  <NavLink
                    to='flights'
                    className={({ isActive }) =>
                      clsx(
                        'admin-nav__nav-link',
                        isActive && 'admin-nav__nav-link--active'
                      )
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    <FiNavigation size={18} />
                    <span>Flight Sales</span>
                  </NavLink>
                </li>
              )}
              <li className='admin-nav__nav-item'>
                <NavLink
                  to='visa-inquiries'
                  className={({ isActive }) =>
                    clsx(
                      'admin-nav__nav-link',
                      isActive && 'admin-nav__nav-link--active'
                    )
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  <FiShield size={18} />
                  <span>Visa Processing</span>
                </NavLink>
              </li>
              {userRole === 'admin' && (
                <li className='admin-nav__nav-item'>
                  <NavLink
                    to='sales-report'
                    className={({ isActive }) =>
                      clsx(
                        'admin-nav__nav-link',
                        isActive && 'admin-nav__nav-link--active'
                      )
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    <FiBarChart2 size={18} />
                    <span>Sales Report</span>
                  </NavLink>
                </li>
              )}
              {(userRole === 'admin' || userRole === 'accounting') && (
                <li className='admin-nav__nav-item'>
                  <NavLink
                    to='ratings'
                    className={({ isActive }) =>
                      clsx(
                        'admin-nav__nav-link',
                        isActive && 'admin-nav__nav-link--active'
                      )
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    <FiStar size={18} />
                    <span>Ratings</span>
                  </NavLink>
                </li>
              )}
              {userRole === 'admin' && (
                <li className='admin-nav__nav-item'>
                  <NavLink
                    to='users'
                    className={({ isActive }) =>
                      clsx(
                        'admin-nav__nav-link',
                        isActive && 'admin-nav__nav-link--active'
                      )
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    <FiUsers size={18} />
                    <span>User Access</span>
                  </NavLink>
                </li>
              )}
            </ul>
          </div>

          <div className='admin-nav__actions'>
            {/* Notifications */}
            <div className='admin-nav__notifications-container'>
              <button
                className='admin-nav__notification-btn'
                onClick={toggleNotifications}
                aria-label='Toggle notifications'
              >
                <RiNotification4Line size={20} />
                {unreadCount > 0 && (
                  <span className='admin-nav__notification-badge admin-nav__notification-badge--navbar'>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            <div className='admin-nav__profile-container'>
              <button
                className='admin-nav__profile-btn'
                onClick={toggleProfile}
                aria-label='Toggle profile menu'
              >
                <div className='admin-nav__profile-avatar'>
                  <FiUser size={18} />
                </div>
                <div className='admin-nav__profile-info'>
                  <span className='admin-nav__profile-name'>
                    {adminEmail?.split('@')[0] || 'Admin'}
                  </span>
                  <span className='admin-nav__profile-role'>
                    {userRole === 'admin'
                      ? 'Administrator'
                      : userRole === 'accounting'
                      ? 'Accounting'
                      : 'Travel Consultant'}
                  </span>
                </div>
                <FiChevronDown
                  size={16}
                  className={clsx(
                    'admin-nav__profile-chevron',
                    isProfileOpen && 'admin-nav__profile-chevron--open'
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Notifications Dropdown */}
      <div
        className={clsx(
          'admin-nav__notifications-dropdown',
          isNotificationsOpen && 'admin-nav__notifications-dropdown--open'
        )}
      >
        <div className='admin-nav__notifications-header'>
          <h3 className='admin-nav__notifications-title'>Notifications</h3>
          <div className='admin-nav__notifications-actions'>
            {unreadCount > 0 && (
              <button
                className='admin-nav__notifications-mark-all'
                onClick={markAllAsRead}
                title='Mark all as read'
              >
                Mark all read
              </button>
            )}
            <button
              className='admin-nav__notifications-close'
              onClick={() => setIsNotificationsOpen(false)}
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Notification Filters */}
        <NotificationFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          unreadOnly={unreadOnly}
          onUnreadOnlyChange={setUnreadOnly}
          assignedToMe={assignedToMe}
          onAssignedToMeChange={setAssignedToMe}
          bookingType={bookingType}
          onBookingTypeChange={setBookingType}
          filterCounts={filterCounts}
          userRole={userRole}
        />

        <div className='admin-nav__notifications-content'>
          {notificationsLoading ? (
            <div className='admin-nav__notifications-empty'>
              <div className='loading-spinner-small'></div>
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className='admin-nav__notifications-empty'>
              <RiNotification4Line size={32} />
              <p>No notifications</p>
              <span>You're all caught up!</span>
            </div>
          ) : (
            <div className='admin-nav__notifications-list'>
              {notifications.slice(0, 10).map((notification, index) => (
                <NotificationItem
                  key={notification.id || index}
                  notification={notification}
                  currentUserId={currentUserId}
                  onMarkAsRead={markNotificationAsRead}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Dropdown */}
      <div
        className={clsx(
          'admin-nav__profile-dropdown',
          isProfileOpen && 'admin-nav__profile-dropdown--open'
        )}
      >
        <div className='admin-nav__profile-header'>
          <div className='admin-nav__profile-avatar-large'>
            <FiUser size={24} />
          </div>
          <div className='admin-nav__profile-details'>
            <h3 className='admin-nav__profile-name-large'>
              {adminEmail?.split('@')[0] || 'Admin User'}
            </h3>
            <p className='admin-nav__profile-email'>{adminEmail}</p>
            <span className='admin-nav__profile-role-badge'>
              {userRole === 'admin'
                ? 'Administrator'
                : userRole === 'accounting'
                ? 'Accounting User'
                : 'Travel Consultant'}
            </span>
          </div>
        </div>
        <div className='admin-nav__profile-menu'>
          {userRole === 'admin' && (
            <button
              className='admin-nav__profile-menu-item'
              onClick={() => {
                navigate('/admin/settings')
                setProfileOpen(false)
              }}
            >
              <FiSettings size={18} />
              <span>Settings</span>
            </button>
          )}
          <hr className='admin-nav__profile-divider' />
          <button
            className='admin-nav__profile-menu-item admin-nav__profile-menu-item--logout'
            onClick={handleLogout}
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default AdminNavbar
