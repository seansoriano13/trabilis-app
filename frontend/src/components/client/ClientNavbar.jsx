import { Link, useNavigate } from 'react-router-dom'
import './ClientNavbar.css'
import { RxHamburgerMenu } from 'react-icons/rx'
import logoShake from '../../assets/logo-shake.png'
import { useState, useEffect } from 'react'
import clsx from 'clsx'
import PrimaryButton from './PrimaryButton'

function ClientNavbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMenuClicked, setMenuClicked] = useState(false)

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
        setIsScrolled(true) // Toggle isScrolled when menu is clicked
    }

    function handleLinkClick() {
        setMenuClicked(false)
        setIsScrolled(false)
    }

    const navigate = useNavigate()
    const handleBookNowClick = () => {
        navigate('/track-booking')
    }

    return (
        <nav
            className={clsx(
                'nav__bar fixed inset-x-0 top-0 w-full z-50', // full-width outer layer
                isScrolled && 'scrolled'
            )}
        >
            <div className='w-full max-w-[1166px] lg:py-1 py-6 px-4 lg:px-0 mx-auto flex items-center justify-between gap-4'>
                {/* Logo + menu */}
                <div className='nav__logo-container'>
                    <RxHamburgerMenu
                        className='rxHamburgerMenu'
                        onClick={handleClick}
                    />
                    <Link
                        to='/'
                        className='nav__logo'
                    >
                        <img
                            className='logoShake'
                            src={logoShake}
                            alt='logoShake'
                        />
                    </Link>
                </div>

                {/* Nav links */}
                <div className='nav__links'>
                    <ul
                        className={clsx(
                            'nav__links-ul backdrop-blur-sm md:backdrop-blur-none lg:backdrop-blur-none py-8',
                            isMenuClicked && 'clicked'
                        )}
                    >
                        <li>
                            <Link
                                onClick={handleLinkClick}
                                to='/'
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                onClick={handleLinkClick}
                                to='/destinations'
                            >
                                Destinations
                            </Link>
                        </li>
                        <li>
                            <Link
                                onClick={handleLinkClick}
                                to='/immigration-visa-consultancy'
                            >
                                Immigration Visa Consultancy
                            </Link>
                        </li>
                        <li>
                            <Link
                                onClick={handleLinkClick}
                                to='/flights'
                            >
                                Flights
                            </Link>
                        </li>
                        <li>
                            <Link
                                onClick={handleLinkClick}
                                to='/about-us'
                            >
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link
                                onClick={handleLinkClick}
                                to='/contact-us'
                            >
                                Contact Us
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Book button */}
                <div>
                    <PrimaryButton
                        buttonText='Track Me'
                        isBold={true}
                        onClick={() => handleBookNowClick()}
                    />
                </div>
            </div>
        </nav>
    )
}

export default ClientNavbar
