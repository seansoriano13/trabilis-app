import { Link } from 'react-router-dom'
import './ClientNavbar.css'
import { RxHamburgerMenu } from 'react-icons/rx'
import logoShake from '../../assets/logo-shake.png'
import { useState, useEffect } from 'react'
import clsx from 'clsx'

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

    function handleClick () {
        setMenuClicked(!isMenuClicked)
        setIsScrolled(true)
    }

	return (
		<nav className={clsx('nav__bar', isScrolled && 'scrolled')}>
			<div>
				<Link to="/" className="nav__logo">
					<RxHamburgerMenu className="rxHamburgerMenu" onClick={handleClick}/>
					<img
						className="logoShake"
						src={logoShake}
						alt="logoShake"
					/>
				</Link>
			</div>
			<div className="nav__links">
				<ul className={clsx('nav__links-ul', isMenuClicked && 'clicked')}>
					<li>
						<Link to="/">Home</Link>
					</li>
					<li>
						<Link to="/destinations">Destinations</Link>
					</li>
					<li>
						<Link to="/immigration-visa-consultancy">
							Immigration Visa Consultancy
						</Link>
					</li>
					<li>
						<Link to="/flights">Flights</Link>
					</li>
					<li>
						<Link to="/about-us">About Us</Link>
					</li>
					<li>
						<Link to="/contact-us">Contact Us</Link>
					</li>
				</ul>
			</div>
			<div>
				<button className="nav__cta-btn">
					<b>Book Now</b>
				</button>
			</div>
		</nav>
	)
}

export default ClientNavbar
