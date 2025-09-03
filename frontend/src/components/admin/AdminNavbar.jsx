import { Link, NavLink, useLocation } from 'react-router-dom'
import { RxHamburgerMenu } from 'react-icons/rx'
import adminLogo from '../../assets/admin/admin-logo.png'
import { useState, useEffect } from 'react'
import clsx from 'clsx'
import './AdminNavbar.css'
import profileIcon from '../../assets/admin/admin-profile-placeholder.jpg'
import AdminPrimaryButton from '../admin/AdminPrimaryButton'
import ThemeToggle from './ThemeToggle'
import adminClient from '../../api/adminClient.js'
import { CgProfile } from 'react-icons/cg'

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
