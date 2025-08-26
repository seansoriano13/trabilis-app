import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

export default function TestimonialsSection() {
    const images = [
        'lindela-ticket-client-1.jpg',
        'lindela-ticket-client-2.jpg',
        'lindela-ticket-client-3.jpg',
        'lindela-ticket-client-4.jpg',
        'lindela-ticket-client-5.jpg',
        'lindela-ticket-client-6.jpg',
        'lindela-ticket-client-7.jpg',
        'lindela-ticket-client-8.jpg',
        'lindela-ticket-client-9.jpg',
    ]

    return (
        <section className='rounded-lg w-full lg:pt-16 bg-[#EEF6FF]'>
            <div
                data-aos='fade-up'
                data-aos-offset='200'
                className='w-full max-w-[72.75rem] mx-auto px-4 lg:px-16 xl:px-0'
            >
                <div>
                    <h3 className='font-sans font-bold text-2xl lg:text-4xl'>
                        Connecting travelers to the world with ease
                    </h3>
                    <p className='mt-2 text-sm lg:text-lg'>
                        From local trips to international round-trip flights,
                        we’ve flown thousands of travelers across the globe,
                        delivering peace of mind and memorable experiences along
                        the way.
                    </p>
                </div>
            </div>

            {/* Swiper Carousel */}
            <div
                data-aos='fade-up'
                data-aos-offset='200'
                className='w-full max-w-[72.75rem] mx-auto mt-12'
            >
                <Swiper
                    modules={[Navigation]}
                    navigation
                    spaceBetween={20}
                    slidesPerView={2}
                    breakpoints={{
                        768: { slidesPerView: 3 },
                        1024: { slidesPerView: 4 },
                    }}
                    className='!pb-8'
                >
                    {images.map((file, i) => (
                        <SwiperSlide
                            key={i}
                            className='flex justify-center'
                        >
                            <img
                                src={`https://lindelatravel.com/images/testimonials/ticket/${file}`}
                                alt=''
                                loading='lazy'
                                className='w-full h-full max-h-64 object-center object-contain rounded-lg shadow-sm'
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            <section className='w-full max-w-[72.75rem] mx-auto px-4 lg:px-16 xl:px-0 pt-8 pb-12 lg:py-16'>
                <div className='w-full'>
                    <h2
                        data-aos='fade-up'
                        className='font-poppins font-bold text-2xl lg:text-[2rem] text-center'
                    >
                        Airline Partners
                    </h2>
                    <ul
                        data-aos='fade-up'
                        className='mt-4 flex flex-wrap gap-2 lg:gap-x-0 lg:gap-y-4 items-center justify-center'
                    >
                        {[
                            'qatar-airways',
                            'singapore-airlines',
                            'all-nippon-airways',
                            'cathay-pacific-airways',
                            'emirates',
                            'eva-airways',
                            'lufthansa',
                            'turkish-airlines',
                            'korean-air',
                            'saudi-arabian-airlines',
                            'gulf-air',
                            'china-airlines',
                            'royal-brunei-airlines',
                            'oman-air',
                            'air-canada-portrait',
                            'klm',
                            'air-france',
                            'etihad-airways',
                            'swiss-international-air-lines',
                            'thai-airways',
                            'cebu-pacific',
                            'air-asia',
                            'philippine-airlines',
                            'aeromexico',
                            'austrian-airlines',
                            'china-southern-airlines',
                            'asiana-airlines',
                            'kuwait-airways',
                        ].map((airline, idx) => (
                            <li
                                key={idx}
                                className='w-[calc(calc(100%/4)-0.5rem)] lg:w-[calc(calc(100%/6)-2rem)] xl:w-[calc(calc(100%/8)-1rem)] py-2 px-2 lg:px-4 flex items-center justify-center'
                            >
                                <img
                                    loading='lazy'
                                    src={`https://lindelatravel.com/images/partners/airlines/${airline}.png`}
                                    alt={airline}
                                    className='h-8 lg:h-16 object-center object-contain'
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
            <section className='w-full px-4 lg:px-16 xl:px-0 pt-8 pb-16 lg:pt-8 lg:pb-16 bg-[rgba(255,251,232,0.3)] border border-[#b3b3b3]'>
                <div className='w-full max-w-[72.75rem] mx-auto flex flex-col gap-4 lg:grid lg:gap-6 xl:grid-cols-12 xl:gap-8'>
                    <div className='flex-1 xl:col-span-7 flex flex-col gap-4 lg:grid lg:grid-cols-12 xl:flex xl:flex-col'>
                        <div
                            data-aos='fade-up'
                            className='flex-1 lg:col-span-12 xl:flex-1 aos-init aos-animate'
                        >
                            <h3 className='font-poppins font-bold text-xl lg:text-3xl'>
                                Talk to our Airline Ticketing Agents
                            </h3>
                            <p className='text-sm'>
                                We truly appreciate you reaching out and look
                                forward to connecting with you!
                            </p>
                        </div>
                        <div
                            data-aos='fade-up'
                            data-delay='200'
                            className='flex-1 lg:col-span-8 xl:flex-1 flex flex-col gap-4 lg:flex-row lg:flex-wrap aos-init aos-animate'
                        >
                            <div className='w-10/12 lg:w-[calc(calc(100%/2)-1rem)] text-sm'>
                                <p className='text-secondary-400'>
                                    For standard domestic and international
                                    flights
                                </p>
                                <a
                                    href='tel:+639171406623'
                                    className='block w-fit mt-2 hover:text-blue-600'
                                >
                                    <i className='bi-telephone-fill mr-1'></i>
                                    <span>+639171406623</span>
                                </a>
                                <a
                                    href='tel:+639177133498'
                                    className='block w-fit hover:text-blue-600'
                                >
                                    <i className='bi-telephone-fill mr-1'></i>
                                    <span>+639177133498</span>
                                </a>
                            </div>
                            <div className='w-10/12 lg:w-[calc(calc(100%/2)-1rem)] text-sm'>
                                <p className='text-secondary-400'>
                                    For land arrangements and special requests
                                </p>
                                <a
                                    href='tel:+639177131236'
                                    className='block w-fit mt-2 hover:text-blue-600'
                                >
                                    <i className='bi-telephone-fill mr-1'></i>
                                    <span>+639177131236</span>
                                </a>
                            </div>
                            <div className='w-10/12 lg:w-[calc(calc(100%/2)-1rem)] text-sm'>
                                <p className='text-secondary-400'>
                                    Write on your own time and send us an email.
                                </p>
                                <a
                                    href='mailto:flights@lindelatravel.com'
                                    className='block w-fit mt-2 hover:text-blue-600'
                                >
                                    <i className='bi-envelope-fill mr-1'></i>
                                    <span>flights@lindelatravel.com</span>
                                </a>
                            </div>
                            <div className='w-11/12 lg:w-[calc(calc(100%/2)-1rem)] text-sm'>
                                <p className='text-secondary-400'>
                                    Connect directly through our Lindela Travel
                                    and Tours Facebook page.
                                </p>
                                <a
                                    href='https://m.me/298594160256476'
                                    target='_blank'
                                    className='block w-fit mt-2 py-2 px-4 text-tertiary-500 bg-blue-600 hover:bg-blue-500 rounded-lg'
                                >
                                    <i className='bi-messenger mr-1'></i>
                                    <span classNameName='text-white'>
                                        Chat with us
                                    </span>
                                </a>
                            </div>
                        </div>
                        <div
                            data-aos='fade-up'
                            data-delay='400'
                            className='flex-1 lg:col-span-4 xl:flex-1 flex flex-col xl:flex-row gap-4 px-4 py-4 border border-[#b3b3b3] rounded-lg aos-init aos-animate text-sm'
                        >
                            <div className='flex-1'>
                                <b className='block'>Ticketing Office</b>
                                <p className='mt-1'>
                                    3rd floor Valero One Center
                                    <span className='text-secondary-400'>
                                        (Former ACCM Building)
                                    </span>
                                    102 Valero St., Salcedo Village Makati City,
                                    Philippines
                                </p>
                            </div>
                            <div className='flex-1'>
                                <b className='block'>Working Hours</b>
                                <p className='mt-1'>
                                    Monday to Friday — 9AM to 6PM Saturday — 9AM
                                    to 4PM
                                </p>
                            </div>
                        </div>
                    </div>
                    <div
                        data-aos='fade-up'
                        data-aos-delay='500'
                        className='flex-1 xl:col-span-5 aos-init aos-animate'
                    >
                        <iframe
                            className='w-full h-96 xl:h-full border border-[#b3b3b3] rounded-lg shadow'
                            src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.675897416213!2d121.01551607510552!3d14.560517385921164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c85160189c9f%3A0xaeb71056263ce223!2sLindela%20Travel%20and%20Tours!5e0!3m2!1sen!2sph!4v1732183568819!5m2!1sen!2sph'
                            allowfullscreen=''
                            loading='lazy'
                            referrerpolicy='no-referrer-when-downgrade'
                        ></iframe>
                    </div>
                </div>
            </section>
        </section>
    )
}
