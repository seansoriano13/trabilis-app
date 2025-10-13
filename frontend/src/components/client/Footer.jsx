import { Link } from 'react-router-dom'
import './Footer.css'
import {
    FaFacebookF,
    FaYoutube,
    FaTiktok,
    FaInstagram,
    FaLinkedinIn,
} from 'react-icons/fa'

import { FaXTwitter } from 'react-icons/fa6'

const NAV_ITEMS = [
    ['Home', '/'],
    ['About Us', '/about-us'],
    ['Contact Us', '/contact-us'],
]

const SERVICES = [
    ['Destinations', '/destinations'],
    ['Immigration Visa Consultancy', '/immigration-visa-consultancy'],
    ['Airline Tickets', '/flights'],
]

const CONTACT_SECTIONS = [
    {
        title: 'Tour Packages Promos',
        email: 'info@lindelatravel.com',
        phones: ['+639177082001', '+639177020734'],
    },
    {
        title: 'Visa Services',
        email: 'visa@lindelatravel.com',
        phones: ['+639177041916'],
    },
    {
        title: 'Affordable Airline Tickets',
        email: 'merlie@lindelatravel.com',
        phones: ['+639177131236'],
    },
]

const SOCIALS = [
    {
        link: 'https://www.facebook.com/lindelatravelandtour/',
        icon: FaFacebookF,
        color: '#3b5998',
    },
    {
        link: 'https://www.youtube.com/@lindelatravel',
        icon: FaYoutube,
        color: '#ff0000',
    },
    {
        link: 'https://www.tiktok.com/@lindelatravel',
        icon: FaTiktok,
    },
    {
        link: 'https://www.instagram.com/lindelatravel/',
        icon: FaInstagram,
    },
    { link: 'https://x.com/lindelatravel', icon: FaXTwitter, color: '#1da1f2' },
    {
        link: 'https://www.linkedin.com/company/lindela-travel-tours',
        icon: FaLinkedinIn,
        color: '#0077b5',
    },
]

export default function Footer() {
    return (
        <footer className='relative w-full bg-[#18181A] border-t border-[#464648] text-[#b3b3b3]'>
            <div className='w-full max-w-[1166px] mx-auto py-8 px-8 grid grid-cols-1 sm:grid-cols-8 xl:grid-cols-12 gap-8'>
                {/* Logo & Description */}
                <div className='col-span-1 sm:col-span-3 xl:col-span-3'>
                    <img
                        src='https://lindelatravel.com/images/logo/logo-shake.png'
                        alt='Lindela Logo'
                        className='h-16 object-contain mb-4'
                    />
                    <p className='leading-tight text-[#e0e0e0] lg:pr-4'>
                        Seeing the world can be a transformative experience.
                        We'd love to explore the world with you.
                    </p>
                </div>

                {/* Navigation & Services */}
                <div className='col-span-1 sm:col-span-2 xl:col-span-3 flex flex-col gap-8'>
                    <div>
                        <div className='mb-2 font-bold text-white'>
                            NAVIGATE
                        </div>
                        <ul className='flex flex-col gap-1'>
                            {NAV_ITEMS.map(([name, path], idx) => (
                                <li key={idx}>
                                    <Link
                                        to={path}
                                        className='text-[#e0e0e0] transition-all hover:text-[#f7d100]'
                                    >
                                        {name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className='mb-2 font-bold text-white'>
                            SERVICES
                        </div>
                        <ul className='flex flex-col gap-1'>
                            {SERVICES.map(([name, path], idx) => (
                                <li key={idx}>
                                    <Link
                                        to={path}
                                        className='text-[#e0e0e0] transition-all hover:text-[#f7d100]'
                                    >
                                        {name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Contact Info */}
                <div className='col-span-1 sm:col-span-3 xl:col-span-3 flex flex-col gap-6'>
                    {CONTACT_SECTIONS.map((section, idx) => (
                        <div
                            key={idx}
                            className='flex flex-col gap-1'
                        >
                            <div className='mb-2 font-bold text-white uppercase text-sm lg:text-base'>
                                {section.title}
                            </div>
                            <a
                                href={`mailto:${section.email}`}
                                className='flex items-center gap-2 text-[#e0e0e0] hover:text-[#1e90ff]'
                            >
                                <i className='bi-envelope'></i>
                                <span className='text-sm lg:text-base'>
                                    {section.email}
                                </span>
                            </a>
                            {section.phones.map((phone, i) => (
                                <a
                                    key={i}
                                    href={`tel:${phone}`}
                                    className='flex items-center gap-2 text-[#e0e0e0] hover:text-[#1e90ff]'
                                >
                                    <i className='bi-telephone'></i>
                                    <span className='text-sm lg:text-base'>
                                        {phone}
                                    </span>
                                </a>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Address, Office Hours, Socials */}
                <div className='col-span-1 sm:col-span-8 xl:col-span-3 grid grid-cols-8 gap-8 xl:gap-3'>
                    <div className='col-span-8 sm:col-span-2 xl:col-span-8'>
                        <div className='mb-2 font-bold text-white'>ADDRESS</div>
                        <div className='text-xs lg:text-sm text-[#e0e0e0]'>
                            3rd floor Valero One Center, 102 Valero St., Salcedo
                            Village, Makati City, Philippines
                        </div>
                    </div>

                    <div className='col-span-8 sm:col-span-2 xl:col-span-8'>
                        <div className='mb-2 font-bold text-white'>
                            OFFICE HOURS
                        </div>
                        <div className='text-xs lg:text-sm text-[#e0e0e0]'>
                            Monday to Friday — 9AM to 6PM
                        </div>
                        <div className='text-xs lg:text-sm text-[#e0e0e0]'>
                            Saturday — 9AM to 4PM
                        </div>
                    </div>

                    <div className='col-span-8 sm:col-span-2 xl:col-span-8'>
                        <div className='mb-1 font-bold text-white'>
                            LINDELA TRAVEL
                        </div>
                        <ul className='flex text-xl gap-2'>
                            {/* eslint-disable-next-line no-unused-vars */}
                            {SOCIALS.map(({ link, icon: Icon, color }, idx) => (
                                <li key={idx}>
                                    <a
                                        href={link}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className={`py-1 px-2 ${
                                            color === 'text-gradient'
                                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500'
                                                : ''
                                        }`}
                                        style={
                                            color !== 'text-gradient'
                                                ? { color }
                                                : {}
                                        }
                                    >
                                        <Icon />
                                        <span className='sr-only'>{link}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className='w-full py-4 px-4 flex items-center justify-center gap-2 text-xs lg:text-sm text-[#999999] border-t border-[#999999]'>
                <div>Trabilis - ©Lindela Travel 2025</div>
            </div>
        </footer>
    )
}
