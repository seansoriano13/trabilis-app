import { useEffect, useState } from 'react'
import PrimaryButton from '../../components/client/PrimaryButton'
import axios from 'axios'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import './Home.css'
import { FaLongArrowAltRight } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'

export default function Home() {
    const destinationRef = useRef(null)
    const [tours, setTours] = useState([])

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const res = await axios.get(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/api/v1/destinations/tours`
                )
                setTours(res.data)
            } catch (err) {
                console.error('Failed to fetch tours', err)
            }
        }
        fetchTours()
    }, [])

    const scrollToDestinations = () => {
        destinationRef.current.scrollIntoView({ behavior: 'smooth' })
    }

    const navigate = useNavigate()

    return (
        <>
            <div className='home__header'>
                <video
                    className='home__header-video'
                    preload='metadata'
                    src='/client/lindela-header-destinations.mp4'
                    autoPlay
                    loop
                ></video>
                <div className='home__header-text lg:text-lg text-lg lg:px-32 px-0'>
                    <b>Lindela</b> makes travel easy. We craft unforgettable
                    tours and handle all the essentials, from visas and flights
                    to ensure a seamless journey on your dream vacation.
                </div>
                <PrimaryButton
                    onClick={scrollToDestinations}
                    className='home__header-btn'
                    buttonText='Explore Destinations'
                />
            </div>

            <section className='grid gap-4 p-8 lg:max-w-[1166px] mx-auto'>
                <h2 className='text-3xl font-extrabold'>
                    <u className='[text-decoration-color:#f7d100] [text-decoration-thickness:4px]'>
                        Lindela
                    </u>{' '}
                    Travel and Tours
                </h2>

                <div className='lg:flex gap-8 grid'>
                    <img
                        className='rounded-lg'
                        src='/client/lindela-reception.jpg'
                        alt=''
                    />

                    <div className='grid justify-center'>
                        <div>
                            <p className='text-sm lg:text-lg'>
                                The most trusted travel agency in the
                                Philippines. Since its founding in 2012,{' '}
                                <b>Lindela Travel and Tours</b> has organized
                                countless trips, helping travelers reach their
                                destinations and create lasting memories.
                            </p>

                            <p className='text-sm lg:text-lg'>
                                For us, travel is more than reaching a
                                destination. Through our tours, we inspire
                                people to chase their dreams, explore the
                                world’s beauty, and leave a positive, lasting
                                impact on communities.
                            </p>
                        </div>

                        <div className='grid grid-cols-2 grid-rows-2 gap-4'>
                            <div>
                                <h2 className='font-extrabold text-2xl'>12</h2>
                                <p className='text-xs'>Years of Experience</p>
                            </div>
                            <div>
                                <h2 className='font-extrabold text-2xl'>84</h2>
                                <p className='text-xs'>Trips Organized</p>
                            </div>
                            <div>
                                <h2 className='font-extrabold text-2xl'>
                                    100k+
                                </h2>
                                <p className='text-xs'>Countries Visited</p>
                            </div>
                            <div>
                                <h2 className='font-extrabold text-2xl'>
                                    500k
                                </h2>
                                <p className='text-xs'>Satisfied Clients</p>
                            </div>
                        </div>

                        <div>
                            <a
                                ref={destinationRef}
                                href='/about-us'
                                className='w-full lg:w-fit mt-4 lg:mt-0 py-3 lg:py-4 px-8 flex items-center justify-center gap-2 text-secondary-500 hover:text-tertiary-500 hover:bg-secondary-500 border border-secondary-500 rounded-lg shadow transition-all'
                            >
                                <i className='bi-arrow-up-right'></i>
                                <span>KNOW MORE</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-8 py-8 bg-[url('/client/landing-destinations-bg.jpg')] bg-center bg-cover shadow-[inset_0_0_0_1000px_rgba(24,24,26,0.8)]">
                <div className='lg:max-w-[1166px] mx-auto p-8'>
                    <h2 className='text-white font-bold text-2xl'>
                        Destinations
                    </h2>
                    <p className='text-white opacity-60 text-sm'>
                        Explore new horizons and cultures around the world.
                    </p>

                    <a
                        href='https://lindelatravel.com/tour-packages'
                        className='text-[#f7d100] mr-2 hover:mr-0 flex items-center gap-2 hover:gap-4 font-bold transition-all'
                    >
                        <span>Explore Destinations</span>
                        <FaLongArrowAltRight />
                    </a>

                    <Swiper
                        modules={[Navigation, Pagination]}
                        navigation
                        spaceBetween={20}
                        slidesPerView={1}
                        className='mt-4'
                    >
                        {tours.map((tour) => (
                            <SwiperSlide key={tour.id}>
                                <div className='relative'>
                                    <img
                                        className='rounded-lg w-full h-[352px] object-cover'
                                        src={tour.main_image_url}
                                        alt={tour.title}
                                    />
                                    <div
                                        className='cursor-pointer absolute bottom-0 text-white w-full text-center bg-[#18181ab3] p-2'
                                        onClick={() =>
                                            navigate(
                                                `/destinations/tour/${tour.id}`,
                                                {
                                                    state: tour,
                                                }
                                            )
                                        }
                                    >
                                        <h4 className='text-sm'>
                                            {tour.title.toUpperCase()}
                                        </h4>
                                        <p className='text-2xl font-bold'>
                                            {tour.dates?.[0]?.rate_per_pax
                                                ? `PHP ${tour.dates[0].rate_per_pax.toLocaleString()}`
                                                : 'Price N/A'}
                                        </p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>

            <section className='home__benefits lg:max-w-[1166px] mx-auto'>
                <div className='flex flex-col items-center justify-center'>
                    <h3 className='font-poppins font-bold text-2xl lg:text-f40 text-center'>
                        <span className='home__benefit-text block'>
                            WHY GO WITH
                        </span>
                        <span className='text-secondary-500'>
                            LINDELA TRAVEL &amp; TOURS
                        </span>
                    </h3>
                    <p className='mt-2 text-base lg:text-lg sm:text text-center'>
                        We provide the best experience possible within your
                        spending plan and schedule.
                    </p>
                </div>
                <div className='home__benefits-list mt-8 flex flex-wrap gap-8'>
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className='home__benefit w-full lg:w-[calc(calc(100%/2)-2rem)] lg:pt-6 lg:px-8 lg:pb-4 flex flex-row lg:flex-col gap-4 bg-white lg:border-[0.5px] lg:border-gray-400 rounded-lg lg:shadow group'
                        >
                            <img
                                className='home__benefit-icon w-12 lg:w-16 h-12 lg:h-16 block object-center object-contain group-hover:-rotate-6 transition-all'
                                src={`/client/benefits-${i}.png`}
                                alt={`benefits-${i}`}
                            />
                            <div className='home__benefit-text flex-1'>
                                <div className='font-bold text-base lg:text-xl underline underline-offset-4 decoration-transparent group-hover:decoration-primary-500 decoration-4 transition-all'>
                                    Satisfaction Guaranteed
                                </div>
                                <p className='lg:mt-4 text-sm lg:text-base text-secondary-300'>
                                    Our goal is your happiness. We want you to
                                    be completely satisfied with our services
                                    and we will do what it takes to make sure
                                    that happens.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    )
}
