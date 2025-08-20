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

function ClientNavbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMenuClicked, setMenuClicked] = useState(false)
    const [isProfileClicked, setIsProfileClicked] = useState(false)
    const [userRole, setUserRole] = useState(
        localStorage.getItem('admin_role') || null
    )
    const [loading, setLoading] = useState(true)
    const location = useLocation()
    const jwt = localStorage.getItem('adminToken')
    const adminEmail = localStorage.getItem('admin_email')

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 1)
        }

        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
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
                console.log(err)
                setLoading(false)
            }
        }

        fetchRole()
    }, [jwt, location.pathname]) // Re-run on route change

    function handleClick() {
        setMenuClicked(!isMenuClicked)
        setIsScrolled(true)
    }

    function handleLinkClick() {
        setMenuClicked(false)
        setIsScrolled(false)
    }

    function handleProfileClick() {
        setIsProfileClicked((prev) => !prev)
    }

    const handleLogout = () => {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('admin_email')
        localStorage.removeItem('admin_role')
        window.location.href = '/admin/login'
    }

    if (loading) {
        return null // Avoid rendering until role is fetched
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
                        onClick={handleClick}
                    />
                    <NavLink
                        to='/admin'
                        className='admin-nav__logo'
                    >
                        <img
                            className='admin-nav__logo-image'
                            src={adminLogo}
                            alt='admin-logo'
                        />
                    </NavLink>
                </div>

                <div className='admin-nav__links'>
                    <ul
                        className={clsx(
                            'admin-nav__links-list',
                            isMenuClicked && 'admin-nav__links-list--clicked'
                        )}
                    >
                        <li>
                            <NavLink
                                onClick={handleLinkClick}
                                to='/admin'
                                className={({ isActive }) =>
                                    clsx(isActive && 'admin-nav__link--active')
                                }
                            >
                                Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                onClick={handleLinkClick}
                                to='tours'
                                className={({ isActive }) =>
                                    clsx(isActive && 'admin-nav__link--active')
                                }
                            >
                                Tour Packages Management
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                onClick={handleLinkClick}
                                to='tour-sales'
                                className={({ isActive }) =>
                                    clsx(isActive && 'admin-nav__link--active')
                                }
                            >
                                Tour Package Sales
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                onClick={handleLinkClick}
                                to='flights'
                                className={({ isActive }) =>
                                    clsx(isActive && 'admin-nav__link--active')
                                }
                            >
                                Flights Sales
                            </NavLink>
                        </li>
                        {userRole === 'admin' && (
                            <li>
                                <NavLink
                                    onClick={handleLinkClick}
                                    to='users'
                                    className={({ isActive }) =>
                                        clsx(
                                            isActive &&
                                                'admin-nav__link--active'
                                        )
                                    }
                                >
                                    User Access Control
                                </NavLink>
                            </li>
                        )}
                    </ul>
                </div>

                <div className='admin-nav__details'>
                    <img
                        onClick={handleProfileClick}
                        src={profileIcon}
                        alt='profile-icon'
                        className='admin-nav__profile'
                    />
                    <ThemeToggle />
                </div>
            </nav>
            <div
                className={`admin-nav__profile-details ${
                    isProfileClicked ? 'clicked' : ''
                }`}
            >
                <p>{adminEmail}</p>
                <AdminPrimaryButton
                    className='admin-nav__btn'
                    onClick={handleLogout}
                    buttonText='Logout'
                />
            </div>
        </>
    )
}

export default ClientNavbar
