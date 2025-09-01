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
        if (isFlightSearchErr) {
            const timer = setTimeout(() => {
                setIsFlightSearchErr(false)
                setTripType(TRIP_TYPES[0])
                setDate(new Date())
                setOrigin(null)
                setDestination(null)
                setTravelerCount({ adults: 1, children: 0 })
                setIsLoading(false)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [isFlightSearchErr])

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
                setIsFlightSearchErr(true)
            }
        } catch (err) {
            console.error('Flight search failed:', err)
            setIsFlightSearchErr(true)
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
                            <h3 className='font-sans font-semibold lg:text-xl text-yellow-300'>
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
                                className='flights__label'
                            >
                                <IoPeopleSharp />
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
                                className='flights__label'
                            >
                                <FaBabyCarriage />
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
                </form>
            </section>
            <section className='rounded-md w-full max-w-[72.75rem] mx-auto pt-4 lg:pt-16 pb-16 px-4 lg:px-16 xl:px-0 flex flex-col-reverse lg:flex-row items-center justify-between gap-4 lg:gap-8 xl:gap-16 bg-white my-8'>
                <div
                    data-aos='fade-up'
                    data-aos-offset='200'
                    className='w-full flex-1'
                >
                    <img
                        src='https://lindelatravel.com/images/section-content/flights-reception.jpg'
                        alt='Lindela airline ticketing agents'
                        className='w-full h-48 lg:h-80 object-center object-cover rounded-lg'
                    />
                </div>

                <div
                    data-aos='fade-up'
                    data-aos-offset='200'
                    className='flex-1'
                >
                    <h5 className='font-sans font-bold text-2xl lg:text-4xl leading-snug'>
                        We know travel, and we know it best.
                    </h5>
                    <p className='mt-2 text-sm lg:text-base'>
                        We maximize value with expert route planning, airline
                        deals, and seamless coordination for complex trips.
                    </p>
                </div>
            </section>
        </div>
    )
}
