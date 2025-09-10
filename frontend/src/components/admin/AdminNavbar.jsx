import { Link, NavLink, useLocation } from 'react-router-dom'
import { RxHamburgerMenu } from 'react-icons/rx'
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
                <div className='admin-nav__logo-container'>
                    <RxHamburgerMenu
                        className='admin-nav__hamburger'
                        onClick={toggleMenu}
                        aria-label='Toggle navigation menu'
                    />
                    <NavLink
                        to='/admin'
                        className='admin-nav__logo'
                        onClick={() => setMenuOpen(false)}
                    >
                        <img
                            className='admin-nav__logo-image'
                            src={adminLogo}
                            alt='Admin Dashboard Logo'
                        />
                    </NavLink>
                </div>

                <div
                    className={clsx(
                        'admin-nav__links',
                        isMenuOpen && 'admin-nav__links--open'
                    )}
                >
                    <ul className='admin-nav__links-list'>
                        <li>
                            <NavLink
                                to='/admin/dashboard'
                                className={({ isActive }) =>
                                    clsx(
                                        'admin-nav__link',
                                        isActive && 'admin-nav__link--active'
                                    )
                                }
                                onClick={() => setMenuOpen(false)}
                            >
                                Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to='tours'
                                className={({ isActive }) =>
                                    clsx(
                                        'admin-nav__link',
                                        isActive && 'admin-nav__link--active'
                                    )
                                }
                                onClick={() => setMenuOpen(false)}
                            >
                                Tour Packages
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to='tour-sales'
                                className={({ isActive }) =>
                                    clsx(
                                        'admin-nav__link',
                                        isActive && 'admin-nav__link--active'
                                    )
                                }
                                onClick={() => setMenuOpen(false)}
                            >
                                Tour Sales
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to='flights'
                                className={({ isActive }) =>
                                    clsx(
                                        'admin-nav__link',
                                        isActive && 'admin-nav__link--active'
                                    )
                                }
                                onClick={() => setMenuOpen(false)}
                            >
                                Flight Sales
                            </NavLink>
                        </li>
                        {userRole === 'admin' && (
                            <li>
                                <NavLink
                                    to='users'
                                    className={({ isActive }) =>
                                        clsx(
                                            'admin-nav__link',
                                            isActive &&
                                                'admin-nav__link--active'
                                        )
                                    }
                                    onClick={() => setMenuOpen(false)}
                                >
                                    User Access
                                </NavLink>
                            </li>
                        )}
                    </ul>
                </div>

                <div className='admin-nav__details'>
                    <div className='relative'>
                        <RiNotification4Line
                            className='admin-nav__notification'
                            onClick={() =>
                                setIsNotificationsOpen((prev) => !prev)
                            }
                        />
                        {notifications.length !== 0 && (
                            <FaCircle className='text-red-500 h-3 absolute top-0 right-0' />
                        )}
                    </div>
                    <CgProfile
                        onClick={toggleProfile}
                        className='admin-nav__profile'
                        aria-label='Toggle profile menu'
                    />
                    {/* <ThemeToggle /> */}
                </div>
            </nav>

            <div
                className={clsx(
                    'admin-nav__notifications',
                    isNotificationsOpen && 'admin-nav__notifications--open'
                )}
            >
                {notifications.length === 0 ? (
                    <p className='admin-nav__notifications-empty'>
                        No new notifications
                    </p>
                ) : (
                    <ul className='admin-nav__notifications-list'>
                        {notifications.map((notif, index) => (
                            <li
                                key={index}
                                className='admin-nav__notification-item'
                            >
                                <Link
                                    to={`/admin/bookings/${notif.booking_reference}`}
                                >
                                    New booking for {notif.booking_reference}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div
                className={clsx(
                    'admin-nav__profile-details',
                    isProfileOpen && 'admin-nav__profile-details--open'
                )}
            >
                <p className='admin-nav__email'>{adminEmail}</p>
                <AdminPrimaryButton
                    className='admin-nav__btn'
                    onClick={handleLogout}
                    buttonText='Logout'
                />
            </div>
        </>
    )
}

export default AdminNavbar
