import { Link, NavLink, useLocation } from 'react-router-dom'
import { 
    RxHamburgerMenu,
    RxCross2
} from 'react-icons/rx'
import { 
    FiHome,
    FiPackage,
    FiTrendingUp,
    FiNavigation,
    FiUsers,
    FiBell,
    FiUser,
    FiLogOut,
    FiSettings,
    FiChevronDown,
    FiMenu,
    FiX
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
import { supabase } from '../../api/supabaseClient.js'

function AdminNavbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMenuOpen, setMenuOpen] = useState(false)
    const [isProfileOpen, setProfileOpen] = useState(false)
    const [userRole, setUserRole] = useState(
        localStorage.getItem('admin_role') || null
    )
    const [loading, setLoading] = useState(true)
    const location = useLocation()
    const jwt = localStorage.getItem('adminToken')
    const adminEmail = localStorage.getItem('admin_email')
    const [notifications, setNotifications] = useState([])
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

    const PROD = true

    useEffect(() => {
        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('admin_notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10)
            if (!error && data) setNotifications(data)
        }

        fetchNotifications()

        // Setup Pusher
        const pusher = new Pusher('371c6201af1a663a4f58', {
            cluster: 'ap1',
            forceTLS: true,
        })
        const channel = pusher.subscribe('admin-notifications')

        channel.bind('new-booking', (data) => {
            setNotifications((prev) => [
                {
                    booking_reference: data.bookingReference,
                    created_at: new Date().toISOString(),
                    type: 'new_booking',
                    bookingType: data.bookingType || 'tour',
                },
                ...prev,
            ])
            if (!isNotificationsOpen) setIsNotificationsOpen(true)
        })

        channel.bind('booking-assigned', (data) => {
            setNotifications((prev) => [
                {
                    booking_reference: data.bookingReference,
                    created_at: new Date().toISOString(),
                    type: 'assignment',
                    bookingType: data.bookingType,
                    booking_id: data.bookingId,
                },
                ...prev,
            ])
            if (!isNotificationsOpen) setIsNotificationsOpen(true)
        })

        channel.bind('booking-reassigned', (data) => {
            setNotifications((prev) => [
                {
                    booking_reference: data.bookingReference,
                    created_at: new Date().toISOString(),
                    type: 'reassignment',
                    bookingType: data.bookingType,
                    booking_id: data.bookingId,
                },
                ...prev,
            ])
            if (!isNotificationsOpen) setIsNotificationsOpen(true)
        })

        return () => {
            channel.unbind_all()
            channel.unsubscribe()
        }
    }, [])

    useEffect(() => {
        const saved = localStorage.getItem('admin_notifications')
        if (saved) setNotifications(JSON.parse(saved))
    }, [])

    useEffect(() => {
        localStorage.setItem(
            'admin_notifications',
            JSON.stringify(notifications)
        )
    }, [notifications])

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

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev)
        console.log(isMenuOpen)
        setProfileOpen(false)
    }

    const toggleProfile = () => {
        setProfileOpen((prev) => !prev)
        setMenuOpen(false) // Close mobile menu when profile toggles
    }

    const handleLogout = () => {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('admin_email')
        localStorage.removeItem('admin_role')
        window.location.href = '/admin/login'
    }

    const getNotificationRoute = (notif) => {
        // If it's an assignment or reassignment notification, route to the specific booking detail
        if (notif.type === 'assignment' || notif.type === 'reassignment') {
            if (notif.bookingType === 'tour') {
                return `/admin/tour-sales/${notif.booking_id || notif.booking_reference}`
            } else if (notif.bookingType === 'flight') {
                return `/admin/flights/${notif.booking_id || notif.booking_reference}`
            }
        }
        
        // For new booking notifications, route based on booking type
        if (notif.type === 'new_booking') {
            if (notif.bookingType === 'tour') {
                return `/admin/tour-sales`
            } else if (notif.bookingType === 'flight') {
                return `/admin/flights`
            }
        }
        
        // Default fallback - go to tour sales page
        return `/admin/tour-sales`
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
                            {userRole === 'admin' && (
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
                        <div className='admin-nav__notifications-container'>
                            <button
                                className='admin-nav__notification-btn'
                                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                                aria-label='Toggle notifications'
                            >
                                <FiBell size={20} />
                                {notifications.length > 0 && (
                                    <span className='admin-nav__notification-badge'>
                                        {notifications.length}
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
                                        {userRole === 'admin' ? 'Administrator' : 'Accounting'}
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
                    <h3 className='admin-nav__notifications-title'>
                        <FiBell size={18} />
                        Notifications
                    </h3>
                    <button
                        className='admin-nav__notifications-close'
                        onClick={() => setIsNotificationsOpen(false)}
                    >
                        <FiX size={16} />
                    </button>
                </div>
                <div className='admin-nav__notifications-content'>
                    {notifications.length === 0 ? (
                        <div className='admin-nav__notifications-empty'>
                            <FiBell size={32} />
                            <p>No new notifications</p>
                            <span>You're all caught up!</span>
                        </div>
                    ) : (
                        <ul className='admin-nav__notifications-list'>
                            {notifications.map((notif, index) => (
                                <li
                                    key={index}
                                    className='admin-nav__notification-item'
                                >
                                    <Link
                                        to={getNotificationRoute(notif)}
                                        className='admin-nav__notification-link'
                                        onClick={() => setIsNotificationsOpen(false)}
                                    >
                                        <div className='admin-nav__notification-icon'>
                                            <FiBell size={16} />
                                        </div>
                                        <div className='admin-nav__notification-content'>
                                            <p className='admin-nav__notification-title'>
                                                {notif.type === 'assignment' 
                                                    ? `Booking Assigned - ${notif.bookingType === 'tour' ? 'Tour' : 'Flight'}`
                                                    : notif.type === 'reassignment'
                                                    ? `Booking Reassigned - ${notif.bookingType === 'tour' ? 'Tour' : 'Flight'}`
                                                    : notif.type === 'new_booking'
                                                    ? `New ${notif.bookingType === 'tour' ? 'Tour' : 'Flight'} Booking`
                                                    : 'New Booking Received'
                                                }
                                            </p>
                                            <p className='admin-nav__notification-desc'>
                                                Booking reference: {notif.booking_reference}
                                            </p>
                                            <span className='admin-nav__notification-time'>
                                                {new Date(notif.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
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
                            {userRole === 'admin' ? 'Administrator' : 'Accounting User'}
                        </span>
                    </div>
                </div>
                <div className='admin-nav__profile-menu'>
                    <button className='admin-nav__profile-menu-item'>
                        <FiSettings size={18} />
                        <span>Settings</span>
                    </button>
                    <button className='admin-nav__profile-menu-item'>
                        <FiUser size={18} />
                        <span>Profile</span>
                    </button>
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
