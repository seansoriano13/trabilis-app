import { Link } from 'react-router-dom'
import { RxHamburgerMenu } from 'react-icons/rx'
import adminLogo from '../../assets/admin/admin-logo.png'
import { useState, useEffect } from 'react'
import clsx from 'clsx'
import './AdminNavbar.css'
import profileIcon from '../../assets/admin/admin-profile-placeholder.jpg'
import AdminPrimaryButton from '../admin/AdminPrimaryButton'

function ClientNavbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMenuClicked, setMenuClicked] = useState(false)
    const [isProfileClicked, setIsProfileClicked] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 1)
        }

        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

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

    const adminEmail = localStorage.getItem('admin_email')

    const handleLogout = () => {
        localStorage.removeItem('admin_token')
        window.location.href('/login')
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
                    <Link
                        to='/admin'
                        className='admin-nav__logo'
                    >
                        <img
                            className='admin-nav__logo-image'
                            src={adminLogo}
                            alt='admin-logo'
                        />
                    </Link>
                </div>

                <div className='admin-nav__links'>
                    <ul
                        className={clsx(
                            'admin-nav__links-list',
                            isMenuClicked && 'admin-nav__links-list--clicked'
                        )}
                    >
                        <li>
                            <Link
                                onClick={handleLinkClick}
                                to='/admin'
                            >
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                onClick={handleLinkClick}
                                to='tours'
                            >
                                Tour Packages
                            </Link>
                        </li>
                        <li>
                            <Link
                                onClick={handleLinkClick}
                                to='flights'
                            >
                                Flights
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className='admin-nav__details'>
                    <img
                        onClick={() => {
                            handleProfileClick()
                        }}
                        src={profileIcon}
                        alt='profile-icon'
                        className='admin-nav__profile'
                    />
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
                    onClick={() => handleLogout()}
                    buttonText={'Logout'}
                />
            </div>
        </>
    )
}

export default ClientNavbar
