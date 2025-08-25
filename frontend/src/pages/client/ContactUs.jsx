export default function ContactUs() {
    return (
        <>
            <section
                id='sectionInquiry'
                className='relative w-full h-screen xl:h-screen xl:max-h-screen bg-secondary-500'
            >
                <img
                    src='https://lindelatravel.com/images/header-bgs/contact-headline.png'
                    className='absolute top-0 left-0 w-full h-full object-bottom object-cover brightness-40'
                    alt=''
                />
                <div className='absolute top-0 left-0 w-full h-full bg-secondary-500/60'></div>

                <div className='relative w-full xl:max-w-[1166px] h-screen xl:h-screen mx-auto px-4 lg:px-8 xl:px-0 flex flex-col justify-between gap-4'>
                    <div></div>

                    <div className='w-full xl:grid xl:grid-cols-12 gap-8 lg:gap-12 xl:gap-5'>
                        <div className='max-w-lg xl:max-w-full mx-auto xl:col-span-5 text-center lg:text-left'>
                            <h1 className='mt-4 font-poppins font-bold text-base lg:text-xl text-yellow-300'>
                                Contact Us
                            </h1>
                            <h3 className='font-poppins font-bold text-tertiary-500 text-2xl lg:text-5xl text-white'>
                                Let’s get you there!
                            </h3>
                            <div className='w-full mt-8 text-center xl:text-left text-sm lg:text-xl text-tertiary-500 text-white'>
                                Turn your travel dreams into reality. Tell us
                                what you think and we will make things happen.
                            </div>
                        </div>

                        <div className='w-full max-w-lg xl:max-w-full mt-8 mx-auto xl:col-start-7 xl:col-span-5'>
                            <div className='w-full py-4 px-4 lg:px-8 rounded-lg bg-tertiary-500 border-secondary-200 shadow-lg'>
                                <div
                                    id='categorySelectionMessage'
                                    className='hidden'
                                >
                                    <div className='w-full flex flex-col items-center justify-center'>
                                        <div className='flex flex-col items-center justify-center gap-2 mb-6'>
                                            <div className='text-green-500'>
                                                <i className='bi-check2-circle text-7xl'></i>
                                            </div>
                                            <h3 className='font-bold text-center text-3xl'>
                                                THANK YOU!
                                            </h3>
                                        </div>
                                        <p className='mb-2 px-8 text-center'>
                                            Your message has been sent. We will
                                            be reaching out to you soon. In the
                                            meantime, you can browse our{' '}
                                            <a
                                                href='https://lindelatravel.com/tour-packages'
                                                className='font-bold text-blue-500 hover:text-blue-700 hover:underline hover:underline-offset-4'
                                            >
                                                Destinations
                                            </a>
                                            .
                                        </p>
                                        <p className='mb-6 px-8 text-center'>
                                            Get inspired to explore the world!
                                        </p>
                                        <div className='flex flex-col items-center justify-center gap-2'>
                                            <div className='font-bold text-lg'>
                                                KEEP UP TO DATE
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <a
                                                    href='#'
                                                    className='block text-lg text-slate-500 hover:text-slate-800 transition-all py-2 px-2'
                                                >
                                                    <i className='bi-facebook'></i>
                                                </a>
                                                <a
                                                    href='#'
                                                    className='block text-lg text-slate-500 hover:text-slate-800 transition-all py-2 px-2'
                                                >
                                                    <i className='bi-instagram'></i>
                                                </a>
                                                <a
                                                    href='#'
                                                    className='block text-lg text-slate-500 hover:text-slate-800 transition-all py-2 px-2'
                                                >
                                                    <i className='bi-tiktok'></i>
                                                </a>
                                                <a
                                                    href='#'
                                                    className='block text-lg text-slate-500 hover:text-slate-800 transition-all py-2 px-2'
                                                >
                                                    <i className='bi-youtube'></i>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div></div>
                </div>
            </section>
            <section
                id='sectionContacts'
                className='relative w-full mt-12 mb-12'
            >
                <div className='w-full max-w-[1166px] mx-auto px-4 lg:px-8 xl:px-0'>
                    <h3 className='font-poppins font-bold text-2xl lg:text-4xl'>
                        Where can you find Lindela Travel?
                    </h3>
                    <div className='w-full mt-5 flex flex-col lg:flex-row gap-4 lg:gap-8'>
                        <div className='flex-1'>
                            <div className='font-poppins font-bold text-sm lg:text-base underline'>
                                VISIT OUR OFFICE
                            </div>
                            <p className='mt-2 text-sm lg:text-base'>
                                3rd floor Valero One Center (Former ACCM
                                Building), 102 Valero St., Salcedo Village,
                                Makati City, Philippines
                            </p>
                            <p className='mt-2 text-sm lg:text-base'>
                                <span className='font-bold'>
                                    Nearest Landmarks
                                </span>
                                : Bonchon and McDonald's Valero
                            </p>
                        </div>
                        <div className='flex-1'>
                            <div className='font-poppins font-bold text-sm lg:text-base underline'>
                                HOURS
                            </div>
                            <div className='mt-2 text-sm lg:text-base'>
                                Monday to Friday — 9AM to 6PM
                            </div>
                            <div className='text-sm lg:text-base'>
                                Saturday — 9AM to 4PM
                            </div>
                        </div>
                    </div>
                </div>

                <div className='w-full max-w-[1166px] mx-auto mt-8 lg:px-8 xl:px-0 flex flex-col lg:grid lg:grid-cols-8 xl:grid-cols-12 gap-4 lg:gap-8'>
                    <div className='flex-1 lg:col-span-3 xl:col-span-5'>
                        <iframe
                            className='w-full h-64 lg:h-full max-h-64 lg:max-h-96 mb-2 border border-secondary-200 lg:rounded-lg overflow-hidden'
                            src='https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3861.676017964748!2d121.0155916!3d14.5605105!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c85160189c9f%3A0xaeb71056263ce223!2sLindela%20Travel%20and%20Tours!5e0!3m2!1sen!2sph!4v1714028857066!5m2!1sen!2sph'
                            style={{ border: 0 }}
                            allowFullScreen
                            loading='lazy'
                            referrerPolicy='no-referrer-when-downgrade'
                        ></iframe>
                        <a
                            href='https://maps.app.goo.gl/ANJgCqvec835ZuEW7'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='block text-right text-xs text-secondary-300 px-4 lg:px-0 hover:underline'
                        >
                            OPEN IN GOOGLE MAPS
                        </a>
                    </div>

                    <div className='flex-1 px-8 lg:px-0 lg:col-span-5 xl:col-span-7'>
                        <div className='font-poppins font-bold text-sm lg:text-base underline'>
                            PHONE DIRECTORY
                        </div>
                        <div className='w-full mt-4 flex flex-col lg:flex-row gap-6'>
                            <ul className='flex-1 flex flex-col gap-4'>
                                <li>
                                    <div className='font-bold text-sm lg:text-base'>
                                        Tour Packages
                                    </div>
                                    <a
                                        href='tel:+639177082001'
                                        className='mt-2 flex items-center gap-2 hover:text-blue-700'
                                    >
                                        <i className='bi-telephone'></i>
                                        <span className='text-sm lg:text-base'>
                                            +639177082001
                                        </span>
                                    </a>
                                    <a
                                        href='tel:+639177020734'
                                        className='flex items-center gap-2 hover:text-blue-700'
                                    >
                                        <i className='bi-telephone'></i>
                                        <span className='text-sm lg:text-base'>
                                            +639177020734
                                        </span>
                                    </a>
                                    <a
                                        href='mailto:info@lindelatravel.com'
                                        className='flex items-center gap-2 hover:text-blue-700'
                                    >
                                        <i className='bi-envelope'></i>
                                        <span className='text-sm lg:text-base'>
                                            info@lindelatravel.com
                                        </span>
                                    </a>
                                </li>

                                <li>
                                    <div className='font-bold text-sm lg:text-base'>
                                        Visa
                                    </div>
                                    <a
                                        href='tel:+639177041916'
                                        className='mt-2 flex items-center gap-2 hover:text-blue-700'
                                    >
                                        <i className='bi-telephone'></i>
                                        <span className='text-sm lg:text-base'>
                                            +639177041916
                                        </span>
                                    </a>
                                    <a
                                        href='tel:+639171398213'
                                        className='flex items-center gap-2 hover:text-blue-700'
                                    >
                                        <i className='bi-telephone'></i>
                                        <span className='text-sm lg:text-base'>
                                            +639171398213
                                        </span>
                                    </a>
                                    <a
                                        href='tel:+639171398335'
                                        className='flex items-center gap-2 hover:text-blue-700'
                                    >
                                        <i className='bi-telephone'></i>
                                        <span className='text-sm lg:text-base'>
                                            +639171398335
                                        </span>
                                    </a>
                                    <a
                                        href='tel:+639171378039'
                                        className='flex lg:hidden items-center gap-2 hover:text-blue-700'
                                    >
                                        <i className='bi-telephone'></i>
                                        <span className='text-sm lg:text-base'>
                                            +639171378039
                                        </span>
                                    </a>
                                    <a
                                        href='tel:+639171408312'
                                        className='flex lg:hidden items-center gap-2 hover:text-blue-700'
                                    >
                                        <i className='bi-telephone'></i>
                                        <span className='text-sm lg:text-base'>
                                            +639171408312
                                        </span>
                                    </a>
                                    <a
                                        href='mailto:visa@lindelatravel.com'
                                        className='flex items-center gap-2 hover:text-blue-700'
                                    >
                                        <i className='bi-envelope'></i>
                                        <span className='text-sm lg:text-base'>
                                            visa@lindelatravel.com
                                        </span>
                                    </a>
                                </li>

                                <li>
                                    <div className='font-bold text-sm lg:text-base'>
                                        Airline Tickets, Hotels
                                    </div>
                                    <a
                                        href='tel:+639177131236'
                                        className='mt-2 flex items-center gap-2 hover:text-blue-700'
                                    >
                                        <i className='bi-telephone'></i>
                                        <span className='text-sm lg:text-base'>
                                            +639177131236
                                        </span>
                                    </a>
                                    <div className='flex items-center gap-2 hover:text-blue-700'>
                                        <i className='bi-telephone'></i>
                                        <span className='text-sm lg:text-base'>
                                            +639171406623
                                        </span>
                                    </div>
                                    <a
                                        href='tel:+639177133498'
                                        className='flex items-center gap-2 hover:text-blue-700'
                                    >
                                        <i className='bi-telephone'></i>
                                        <span className='text-sm lg:text-base'>
                                            +639177133498
                                        </span>
                                    </a>
                                    <a
                                        href='mailto:merlie@lindelatravel.com'
                                        className='flex items-center gap-2 hover:text-blue-700'
                                    >
                                        <i className='bi-envelope'></i>
                                        <span className='text-sm lg:text-base'>
                                            merlie@lindelatravel.com
                                        </span>
                                    </a>
                                </li>
                            </ul>

                            <ul className='flex-1 flex flex-col gap-4'>
                                <li className='flex flex-col gap-4'>
                                    <div>
                                        <div className='font-bold text-sm lg:text-base'>
                                            Customer Service
                                        </div>
                                        <a
                                            href='tel:+639176360294'
                                            className='mt-2 flex items-center gap-2'
                                        >
                                            <i className='bi-telephone'></i>
                                            <span className='text-sm lg:text-base'>
                                                +639176360294
                                            </span>
                                        </a>
                                        <a
                                            href='mailto:cs@lindelatravel.com'
                                            className='flex items-center gap-2'
                                        >
                                            <i className='bi-envelope'></i>
                                            <span className='text-sm lg:text-base'>
                                                cs@lindelatravel.com
                                            </span>
                                        </a>
                                    </div>
                                    <div>
                                        <div className='font-bold text-sm lg:text-base'>
                                            Business Inquiries
                                        </div>
                                        <a
                                            href='tel:+639177097402'
                                            className='mt-2 flex items-center gap-2'
                                        >
                                            <i className='bi-telephone'></i>
                                            <span className='text-sm lg:text-base'>
                                                +639177097402
                                            </span>
                                        </a>
                                        <a
                                            href='mailto:reservation@lindelatravel.com'
                                            className='flex items-center gap-2'
                                        >
                                            <i className='bi-envelope'></i>
                                            <span className='text-sm lg:text-base'>
                                                reservation@lindelatravel.com
                                            </span>
                                        </a>
                                    </div>
                                </li>

                                <li className='flex flex-col gap-4'>
                                    <div>
                                        <div className='font-bold text-sm lg:text-base'>
                                            Job Opportunities
                                        </div>
                                        <a
                                            href='mailto:careers@lindelatravel.com'
                                            className='flex items-center gap-2'
                                        >
                                            <i className='bi-envelope'></i>
                                            <span className='text-sm lg:text-base'>
                                                careers@lindelatravel.com
                                            </span>
                                        </a>
                                    </div>
                                    <div>
                                        <div className='font-bold text-sm lg:text-base'>
                                            Marketing &amp; Promotions
                                        </div>
                                        <a
                                            href='tel:+639177105170'
                                            className='mt-2 flex items-center gap-2'
                                        >
                                            <i className='bi-telephone'></i>
                                            <span className='text-sm lg:text-base'>
                                                +639177105170
                                            </span>
                                        </a>
                                        <a
                                            href='mailto:mail@lindelatravel.com'
                                            className='flex items-center gap-2'
                                        >
                                            <i className='bi-envelope'></i>
                                            <span className='text-sm lg:text-base'>
                                                mail@lindelatravel.com
                                            </span>
                                        </a>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
