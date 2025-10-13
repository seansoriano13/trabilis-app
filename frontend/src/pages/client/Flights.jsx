// 🧱 Core & Framework
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

// 📦 External Libraries
import axios from 'axios'
import Flatpickr from 'react-flatpickr'
import Select from 'react-select'
import AsyncSelect from 'react-select/async'
import 'flatpickr/dist/themes/airbnb.css'

// 🎨 Styles & Assets
import './Flights.css'
import flightsHeroMobile from '../../assets/flights-hero-mobile.jpeg'
import { reactSelectStyles } from '../../styles/client/reactSelectStyles'
import flightsHeroDesktop from '/images/flights-hero-desktop.jpg'

// 🧠 Context & Utils
import { useAirports } from '../../context/AirportContext'
import { defaultAirportOptionsData } from '../../utils/defaultAirportOptions'

// 🧩 Components
import PrimaryButton from '../../components/client/PrimaryButton'

// 🎯 Icons
import { AiOutlineSwap } from 'react-icons/ai'
import { BsFillAirplaneFill } from 'react-icons/bs'
import { FaBabyCarriage } from 'react-icons/fa'
import { IoPeopleSharp } from 'react-icons/io5'
import { loadOptions } from '../../utils/airportOptionsLoader'
import { CABIN_CLASSES, TRIP_TYPES } from '../../utils/options'
import { useEffect } from 'react'
import { formatToYMD } from '../../utils/flightUtils'

export default function Flights() {
    // Hooks
    const datepickerRef = useRef()
    const { airports: options, loading } = useAirports()
    const navigate = useNavigate()
    const { state } = useLocation()

    // Constants
    const selectStyles = reactSelectStyles

    const dateFromFlightResult = state?.formattedDate

    // States
    const [isFlightSearchErr, setIsFlightSearchErr] = useState(false)
    const [noFlightsFound, setNoFlightsFound] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [cabinClass] = useState(CABIN_CLASSES[0])
    const [tripType, setTripType] = useState(TRIP_TYPES[0])
    const [date, setDate] = useState(() => {
        if (Array.isArray(dateFromFlightResult)) {
            return dateFromFlightResult.map((d) => new Date(d))
        }
        return dateFromFlightResult
            ? new Date(dateFromFlightResult)
            : new Date()
    })
    const [origin, setOrigin] = useState(state?.origin)
    const [destination, setDestination] = useState(state?.destination)
    const [travelerCount, setTravelerCount] = useState(
        state?.travelerCount
            ? state?.travelerCount
            : {
                  adults: 1,
                  children: 0,
              }
    )

    useEffect(() => {
        if (isFlightSearchErr || noFlightsFound) {
            const timer = setTimeout(() => {
                setIsFlightSearchErr(false)
                setNoFlightsFound(false)
                setTripType(TRIP_TYPES[0])
                setDate(new Date())
                setOrigin(null)
                setDestination(null)
                setTravelerCount({ adults: 1, children: 0 })
                setIsLoading(false)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [isFlightSearchErr, noFlightsFound])

    const updateTravelerCount = (type, value) => {
        setTravelerCount((prev) => {
            const newCount = { ...prev, [type]: Math.max(0, value) }
            const totalSeated = newCount.adults + newCount.children
            if (totalSeated > 9) {
                return prev
            }
            if (type === 'children' && newCount.children > newCount.adults) {
                newCount.children = newCount.adults
            }
            return newCount
        })
    }

    const handleSwapOrigin = () => {
        setOrigin(destination)
        setDestination(origin)
    }

    const { asyncLoader, defaultOptions } = loadOptions(
        options,
        defaultAirportOptionsData
    )

    const getFormattedDate = () => {
        if (tripType.value === 'round-trip' && Array.isArray(date)) {
            return date.map(formatToYMD)
        }
        return formatToYMD(date)
    }

    // Search Flight
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        const formattedDate = getFormattedDate()

        if (!tripType?.value || !formattedDate || !origin || !destination) {
            setIsFlightSearchErr(true)
            setNoFlightsFound(false)
            setIsLoading(false)
            return
        }

        try {
            const flights = await searchFlights(
                tripType,
                formattedDate,
                origin,
                destination,
                travelerCount,
                cabinClass
            )

            setIsLoading(false)

            if (flights?.flights?.outbound?.length > 0) {
                const searchData = {
                    flights,
                    origin,
                    destination,
                    date,
                    travelerCount,
                    tripType,
                    cabinClass,
                }

                sessionStorage.setItem(
                    'searchResults',
                    JSON.stringify(searchData)
                )

                navigate('search-result', { state: searchData })
            } else {
                setNoFlightsFound(true)
                setIsFlightSearchErr(false)
            }
        } catch (err) {
            console.error('Flight search failed:', err)
            setIsFlightSearchErr(true)
            setNoFlightsFound(false)
            setIsLoading(false)
        }
    }

    const searchFlights = async (
        tripType,
        date,
        origin,
        destination,
        travelerCount,
        cabinClass
    ) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/flights/search`,
                {
                    tripType,
                    date,
                    origin,
                    destination,
                    travelerCount,
                    cabinClass,
                }
            )
            console.log(res)
            return res.data
        } catch (err) {
            console.error(err)
            throw err
        }
    }

    return (
        <div className='max-w-[1200px] mx-auto'>
            <section className='flights'>
                <div className='grid gap-8'>
                    <picture>
                        <source
                            srcSet={flightsHeroDesktop}
                            media='(min-width: 1024px)' // Tailwind's lg breakpoint
                        />
                        <img
                            className='flights__hero-mobile'
                            src={flightsHeroMobile}
                            alt='flightsHeroMobile'
                        />
                    </picture>
                    <div
                        data-aos='fade-up'
                        className='flights__description max-w-[1166px] mx-auto col-span-5 flex flex-col items-center lg:items-start gap-6'
                    >
                        <div className='text-center lg:text-left'>
                            <h3 className='font-sans font-semibold lg:text-xl text-[var(--color-yellow)]'>
                                Flights
                            </h3>
                            <h1 className='font-sans font-bold text-[40px] lg:text-[64px] text-white'>
                                Travel smart, save time.
                            </h1>
                        </div>

                        <p className='text-sm lg:text-lg text-center lg:text-left text-white'>
                            Lindela provides tailored assistance for airline
                            ticketing, helping you secure flights that match
                            your schedule, budget and preferences.
                        </p>

                        <div className='text-sm flex items-center gap-2'>
                            <i className='bi-airplane-fill block rotate-90 text-white'></i>
                            <span className='text-[#B3B3B3]'>
                                <span id='flightCount'>320,170</span> flights
                                booked and counting
                            </span>
                        </div>

                        <div
                            data-aos='fade-up'
                            className='flex lg:hidden items-center gap-2'
                        ></div>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className='flights__form max-w-[1166px] mx-auto mt-16'
                >
                    <div className='flights__form-header lg:text-left text-center'>
                        <p>
                            <b>Get started</b> by searching for flights.
                        </p>
                    </div>

                    <div className='flights__form-row'>
                        <Select
                            name='tripType'
                            defaultValue={tripType}
                            isSearchable={false}
                            options={TRIP_TYPES}
                            onChange={(tripType) => {
                                setTripType(tripType)
                                setDate('')
                            }}
                            styles={selectStyles()}
                        />

                        <Flatpickr
                            required
                            name='flightDate'
                            ref={datepickerRef}
                            placeholder='Dates'
                            value={date}
                            onChange={(selectedDate) => {
                                setDate(selectedDate)
                                if (
                                    selectedDate.length === 1 &&
                                    tripType.value === 'round-trip'
                                ) {
                                    setTimeout(() => {
                                        datepickerRef.current.flatpickr.open()
                                    }, 0)
                                }
                            }}
                            options={{
                                mode:
                                    tripType.value === 'round-trip'
                                        ? 'range'
                                        : 'single',
                                dateFormat: 'M-j-Y',
                                disableMobile: true,
                                closeOnSelect: false,
                                minDate: 'today',
                            }}
                        />
                    </div>
                    <div className='flights__form-row'>
                        <div>
                            <div className='flights__route'>
                                <AsyncSelect
                                    required
                                    name='origin'
                                    cacheOptions
                                    defaultOptions={defaultOptions}
                                    loadOptions={asyncLoader}
                                    onChange={setOrigin}
                                    value={origin}
                                    placeholder={
                                        loading ? 'Loading...' : 'Select Origin'
                                    }
                                    styles={selectStyles()}
                                    isSearchable
                                />
                                <button
                                    onClick={handleSwapOrigin}
                                    type='button'
                                    className='flights__swap-btn'
                                >
                                    <AiOutlineSwap />
                                </button>
                                <AsyncSelect
                                    required
                                    name='destination'
                                    cacheOptions
                                    defaultOptions={defaultOptions} // or []
                                    loadOptions={asyncLoader}
                                    onChange={setDestination}
                                    value={destination}
                                    placeholder={
                                        loading
                                            ? 'Loading...'
                                            : 'Select Destination'
                                    }
                                    styles={selectStyles()}
                                    isSearchable
                                />
                            </div>
                        </div>
                    </div>
                    <div className='flights__form-row flights__form-row--flex'>
                        <div className='flights__input-group'>
                            <label
                                htmlFor='adultCount'
                                className='flights__label flex gap-2 text-gray-300 items-center'
                            >
                                <IoPeopleSharp />
                                Adults
                            </label>
                            <input
                                id='adultCount'
                                value={travelerCount.adults}
                                min={1}
                                max={9}
                                className='flights__input'
                                type='number'
                                name='adultCount'
                                onChange={(event) =>
                                    updateTravelerCount(
                                        'adults',
                                        Number(event.target.value)
                                    )
                                }
                            />
                        </div>

                        <div className='flights__input-group'>
                            <label
                                htmlFor='childCount'
                                className='flights__label flex gap-2 text-gray-300'
                            >
                                <FaBabyCarriage /> Child
                            </label>
                            <input
                                id='childCount'
                                value={travelerCount.children}
                                min={0}
                                max={9}
                                className='flights__input'
                                type='number'
                                name='childCount'
                                onChange={(event) =>
                                    updateTravelerCount(
                                        'children',
                                        Number(event.target.value)
                                    )
                                }
                            />
                        </div>
                    </div>

                    <PrimaryButton
                        buttonText='Search Flights'
                        isBold={true}
                        style={{ padding: '1rem 2rem' }}
                        loading={isLoading}
                    />
                    {isFlightSearchErr && (
                        <p className='flights__search-error'>
                            <b>Error Searching Flights.</b>
                        </p>
                    )}
                    {noFlightsFound && (
                        <p className='flights__search-error'>
                            <b>No flights found for your search criteria. Please try different dates or destinations.</b>
                        </p>
                    )}
                </form>
            </section>
            {/* Enhanced Why Choose Us Section */}
            <section className='w-full max-w-[1200px] mx-auto py-16 px-4 lg:px-8'>
                <div className='text-center mb-16'>
                    <h2 className='text-3xl lg:text-5xl font-bold text-gray-900 mb-6'>
                        Why Choose <span className='text-[var(--color-yellow)]'>Lindela</span> for Your Flights?
                    </h2>
                    <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
                        Experience the difference with our expert flight booking service, trusted by thousands of travelers worldwide.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className='grid lg:grid-cols-2 gap-12 items-center mb-20'>
                    {/* Image Section */}
                    <div className='relative group'>
                        <div className='relative overflow-hidden rounded-2xl shadow-2xl'>
                            <img
                                src='https://lindelatravel.com/images/section-content/flights-reception.jpg'
                                alt='Lindela airline ticketing agents providing expert service'
                                className='w-full h-64 lg:h-96 object-cover transition-transform duration-700 group-hover:scale-105'
                            />
                            <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent'></div>
                            <div className='absolute bottom-6 left-6 text-white'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                                    <span className='text-sm font-medium'>Live Support Available</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Floating Stats Card */}
                        <div className='absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300'>
                            <div className='text-center'>
                                <div className='text-3xl font-bold text-[var(--color-yellow)]'>320K+</div>
                                <div className='text-sm text-gray-600'>Flights Booked</div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className='space-y-8'>
                        <div>
                            <h3 className='text-2xl lg:text-4xl font-bold text-gray-900 mb-4'>
                                We know travel, and we know it <span className='text-[var(--color-yellow)]'>best</span>.
                            </h3>
                            <p className='text-lg text-gray-600 leading-relaxed'>
                                Our expert team maximizes value with intelligent route planning, exclusive airline deals, 
                                and seamless coordination for even the most complex travel itineraries.
                            </p>
                        </div>

                        {/* Key Benefits */}
                        <div className='space-y-4'>
                            <div className='flex items-start gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200'>
                                <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                                    <BsFillAirplaneFill className='text-white text-sm' />
                                </div>
                                <div>
                                    <h4 className='font-semibold text-gray-900'>Best Price Guarantee</h4>
                                    <p className='text-sm text-gray-600'>We'll match or beat any competitor's price, ensuring you get the best deal.</p>
                                </div>
                            </div>

                            <div className='flex items-start gap-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200'>
                                <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                                    <svg className='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
                                        <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className='font-semibold text-gray-900'>24/7 Support</h4>
                                    <p className='text-sm text-gray-600'>Round-the-clock assistance for all your travel needs and emergencies.</p>
                                </div>
                            </div>

                            <div className='flex items-start gap-4 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200'>
                                <div className='w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                                    <svg className='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
                                        <path fillRule='evenodd' d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z' clipRule='evenodd' />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className='font-semibold text-gray-900'>Expert Route Planning</h4>
                                    <p className='text-sm text-gray-600'>Optimized itineraries that save time and money while maximizing comfort.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className='grid md:grid-cols-3 gap-8 mb-16'>
                    <div className='text-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200'>
                        <div className='text-4xl font-bold text-[var(--color-yellow)] mb-2'>98%</div>
                        <div className='text-lg font-semibold text-gray-900 mb-2'>Customer Satisfaction</div>
                        <div className='text-sm text-gray-600'>Based on verified reviews from our travelers</div>
                    </div>
                    <div className='text-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200'>
                        <div className='text-4xl font-bold text-[var(--color-yellow)] mb-2'>50+</div>
                        <div className='text-lg font-semibold text-gray-900 mb-2'>Airlines Partnered</div>
                        <div className='text-sm text-gray-600'>Access to exclusive deals and better rates</div>
                    </div>
                    <div className='text-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200'>
                        <div className='text-4xl font-bold text-[var(--color-yellow)] mb-2'>15+</div>
                        <div className='text-lg font-semibold text-gray-900 mb-2'>Years Experience</div>
                        <div className='text-sm text-gray-600'>Trusted expertise in travel planning</div>
                    </div>
                </div>

                {/* Customer Testimonials */}
                <div className='bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 lg:p-12'>
                    <div className='text-center mb-12'>
                        <h3 className='text-2xl lg:text-3xl font-bold text-gray-900 mb-4'>
                            What Our Customers Say
                        </h3>
                        <p className='text-gray-600'>Real experiences from real travelers</p>
                    </div>

                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        <div className='bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300'>
                            <div className='flex items-center gap-1 mb-4'>
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className='w-5 h-5 text-[var(--color-yellow)]' fill='currentColor' viewBox='0 0 20 20'>
                                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                    </svg>
                                ))}
                            </div>
                            <p className='text-gray-700 mb-4 italic'>
                                "Lindela saved me over $500 on my Europe trip! Their team found connections I never would have discovered."
                            </p>
                            <div className='flex items-center gap-3'>
                                <div className='w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold'>
                                    M
                                </div>
                                <div>
                                    <div className='font-semibold text-gray-900'>Maria Santos</div>
                                    <div className='text-sm text-gray-600'>Business Traveler</div>
                                </div>
                            </div>
                        </div>

                        <div className='bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300'>
                            <div className='flex items-center gap-1 mb-4'>
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className='w-5 h-5 text-[var(--color-yellow)]' fill='currentColor' viewBox='0 0 20 20'>
                                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                    </svg>
                                ))}
                            </div>
                            <p className='text-gray-700 mb-4 italic'>
                                "The 24/7 support was incredible. When my flight was delayed, they rebooked me within minutes!"
                            </p>
                            <div className='flex items-center gap-3'>
                                <div className='w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold'>
                                    J
                                </div>
                                <div>
                                    <div className='font-semibold text-gray-900'>John Chen</div>
                                    <div className='text-sm text-gray-600'>Family Traveler</div>
                                </div>
                            </div>
                        </div>

                        <div className='bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-1'>
                            <div className='flex items-center gap-1 mb-4'>
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className='w-5 h-5 text-[var(--color-yellow)]' fill='currentColor' viewBox='0 0 20 20'>
                                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                    </svg>
                                ))}
                            </div>
                            <p className='text-gray-700 mb-4 italic'>
                                "Professional service from start to finish. They handled my complex multi-city itinerary perfectly."
                            </p>
                            <div className='flex items-center gap-3'>
                                <div className='w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold'>
                                    A
                                </div>
                                <div>
                                    <div className='font-semibold text-gray-900'>Anna Rodriguez</div>
                                    <div className='text-sm text-gray-600'>Frequent Flyer</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className='text-center mt-16'>
                    <div className='bg-[var(--color-yellow)] rounded-2xl p-8 lg:p-12 '>
                        <h3 className='text-2xl lg:text-4xl font-bold mb-4'>
                            Ready to Book Your Perfect Flight?
                        </h3>
                        <p className='text-lg mb-8 opacity-90'>
                            Join thousands of satisfied travelers who trust Lindela for their flight bookings.
                        </p>
                        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                            <button 
                                onClick={() => document.querySelector('.flights__form').scrollIntoView({ behavior: 'smooth' })}
                                className='bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200'
                            >
                                Search Flights Now
                            </button>
                            <button className='border-2 border-black text-black px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors duration-200'>
                                Contact Our Experts
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
