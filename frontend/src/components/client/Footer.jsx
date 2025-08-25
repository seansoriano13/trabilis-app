import './Footer.css'

export default function Footer() {
    return (
        <footer
            style={{
                color: '#b3b3b3', // text-tertiary-500
                backgroundColor: '#18181A', // bg-secondary-500
                border: '1px solid #464648', // border-secondary-400
            }}
            className='relative w-full'
        >
            <div className='w-full max-w-[1166px] mx-auto py-8 px-8 grid grid-cols-1 sm:grid-cols-8 xl:grid-cols-12 gap-8'>
                <div className='col-span-1 sm:col-span-3 xl:col-span-3'>
                    <img
                        src='https://lindelatravel.com/images/logo/logo-shake.png'
                        alt='Lindela Logo'
                        className='h-16 object-center object-contain mb-4'
                    />
                    <p
                        style={{ color: '#e0e0e0' }}
                        className='leading-tight lg:pr-4'
                    >
                        Seeing the world can be a transformative experience.
                        We'd love to explore the world with you.
                    </p>
                </div>

                <div className='col-span-1 sm:col-span-2 xl:col-span-3 flex flex-col gap-4 lg:gap-8'>
                    <div>
                        <div
                            style={{ fontWeight: 'bold', color: '#ffffff' }}
                            className='mb-2'
                        >
                            NAVIGATE
                        </div>
                        <ul className='flex flex-col gap-1'>
                            {[
                                'Home',
                                'About Us',
                                'Contact Us',
                                'Privacy Policy',
                            ].map((item, idx) => (
                                <li key={idx}>
                                    <a
                                        href={`https://lindelatravel.com/${item
                                            .toLowerCase()
                                            .replace(/\s/g, '-')}`}
                                        style={{ color: '#e0e0e0' }}
                                        className='transition-all hover:text-[#f7d100]'
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div
                            style={{ fontWeight: 'bold', color: '#ffffff' }}
                            className='mb-2'
                        >
                            SERVICES
                        </div>
                        <ul className='flex flex-col gap-1'>
                            {[
                                ['Destinations', 'tour-packages'],
                                [
                                    'Immigration Visa Consultancy',
                                    'visa-assistance',
                                ],
                                ['Airline Tickets', 'flights'],
                                ['Passport and Documentation', 'passport'],
                                ['Travel Insurance', 'travel-insurance'],
                            ].map(([name, link], idx) => (
                                <li key={idx}>
                                    <a
                                        href={`https://lindelatravel.com/${link}`}
                                        style={{ color: '#e0e0e0' }}
                                        className='transition-all hover:text-[#f7d100]'
                                    >
                                        {name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className='col-span-1 sm:col-span-3 xl:col-span-3'>
                    <ul className='flex-1 flex flex-col gap-8'>
                        {[
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
                        ].map((section, idx) => (
                            <li
                                key={idx}
                                className='flex flex-col gap-1'
                            >
                                <div
                                    style={{
                                        fontWeight: 'bold',
                                        color: '#ffffff',
                                    }}
                                    className='mb-2 text-sm lg:text-base uppercase'
                                >
                                    {section.title}
                                </div>
                                <a
                                    href={`mailto:${section.email}`}
                                    style={{ color: '#e0e0e0' }}
                                    className='flex items-center gap-2 hover:text-[#1e90ff]'
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
                                        style={{ color: '#e0e0e0' }}
                                        className='flex items-center gap-2 hover:text-[#1e90ff]'
                                    >
                                        <i className='bi-telephone'></i>
                                        <span className='text-sm lg:text-base'>
                                            {phone}
                                        </span>
                                    </a>
                                ))}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className='col-span-1 sm:col-span-8 xl:col-span-3 grid grid-cols-8 gap-8 xl:gap-3'>
                    <div className='col-span-8 sm:col-span-2 xl:col-span-8'>
                        <div
                            style={{ fontWeight: 'bold', color: '#ffffff' }}
                            className='mb-2'
                        >
                            ADDRESS
                        </div>
                        <div
                            style={{ color: '#e0e0e0' }}
                            className='text-xs lg:text-sm'
                        >
                            3rd floor Valero One Center, 102 Valero St., Salcedo
                            Village, Makati City, Philippines
                        </div>
                    </div>

                    <div className='col-span-8 sm:col-span-2 xl:col-span-8'>
                        <div
                            style={{ fontWeight: 'bold', color: '#ffffff' }}
                            className='mb-2'
                        >
                            OFFICE HOURS
                        </div>
                        <div
                            style={{ color: '#e0e0e0' }}
                            className='text-xs lg:text-sm'
                        >
                            Monday to Friday — 9AM to 6PM
                        </div>
                        <div
                            style={{ color: '#e0e0e0' }}
                            className='text-xs lg:text-sm'
                        >
                            Saturday — 9AM to 4PM
                        </div>
                    </div>

                    {/* Socials */}
                    <div className='col-span-8 sm:col-span-2 xl:col-span-8'>
                        <div
                            style={{ fontWeight: 'bold', color: '#ffffff' }}
                            className='mb-1'
                        >
                            LINDELA TRAVEL
                        </div>
                        <ul className='flex text-xl'>
                            {[
                                [
                                    'https://www.facebook.com/lindelatravelandtour/',
                                    'bi-facebook',
                                    '#3b5998',
                                ],
                                [
                                    'https://www.youtube.com/@lindelatravel',
                                    'bi-youtube',
                                    '#ff0000',
                                ],
                                [
                                    'https://www.tiktok.com/@lindelatravel',
                                    'bi-tiktok',
                                    'linear-gradient(to right,#1da1f2,#ff0050)',
                                ],
                                [
                                    'https://www.instagram.com/lindelatravel/',
                                    'bi-instagram',
                                    'linear-gradient(to bottom,#8a2be2,#ff0000,#ffff00)',
                                ],
                                [
                                    'https://x.com/lindelatravel',
                                    'bi-twitter-x',
                                    '#1da1f2',
                                ],
                                [
                                    'https://www.linkedin.com/company/lindela-travel-tours',
                                    'bi-linkedin',
                                    '#0077b5',
                                ],
                            ].map(([link, icon, color], idx) => (
                                <li key={idx}>
                                    <a
                                        href={link}
                                        target='_blank'
                                        style={{
                                            color: color.includes('gradient')
                                                ? undefined
                                                : color,
                                        }}
                                        className={`py-1 px-2 ${
                                            color.includes('gradient')
                                                ? 'text-transparent bg-clip-text'
                                                : ''
                                        }`}
                                    >
                                        <i className={icon}></i>
                                        <span className='sr-only'>{icon}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div
                style={{ color: '#999999', borderTop: '1px solid #999999' }}
                className='w-full py-4 px-4 flex items-center justify-center gap-2 text-xs lg:text-sm'
            >
                <div>© Lindela Travel &amp; Tours 2025</div>
            </div>
        </footer>
    )
}
