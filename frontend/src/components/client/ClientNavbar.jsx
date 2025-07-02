import { Link } from 'react-router-dom'
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
		setIsScrolled(!isScrolled) // Toggle isScrolled when menu is clicked
	}

	function handleLinkClick() {
		setMenuClicked(false)
		setIsScrolled(false)
	}

	return (
		<nav className={clsx('nav__bar', isScrolled && 'scrolled')}>
			<div className="nav__logo-container">
				<RxHamburgerMenu
					className="rxHamburgerMenu"
					onClick={handleClick}
				/>
				<Link to="/" className="nav__logo">
					<img
						className="logoShake"
						src={logoShake}
						alt="logoShake"
					/>
				</Link>
			</div>
			<div className="nav__links">
				<ul
					className={clsx(
						'nav__links-ul',
						isMenuClicked && 'clicked'
					)}
				>
					<li>
						<Link onClick={handleLinkClick} to="/">
							Home
						</Link>
					</li>
					<li>
						<Link onClick={handleLinkClick} to="/destinations">
							Destinations
						</Link>
					</li>
					<li>
						<Link
							onClick={handleLinkClick}
							to="/immigration-visa-consultancy"
						>
							Immigration Visa Consultancy
						</Link>
					</li>
					<li>
						<Link onClick={handleLinkClick} to="/flights">
							Flights
						</Link>
					</li>
					<li>
						<Link onClick={handleLinkClick} to="/about-us">
							About Us
						</Link>
					</li>
					<li>
						<Link onClick={handleLinkClick} to="/contact-us">
							Contact Us
						</Link>
					</li>
				</ul>
			</div>
			<div>
				<PrimaryButton buttonText="Book Now" isBold={true} />
			</div>
		</nav>
	)
}

export default ClientNavbar
