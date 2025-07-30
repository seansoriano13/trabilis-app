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

        if (!tripType?.value || !formattedDate) {
            setIsFlightSearchErr(true)
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

            if (flights) {
                navigate('search-result', {
                    state: {
                        flights,
                        origin,
                        destination,
                        date,
                        travelerCount,
                        tripType,
                        cabinClass,
                    },
                })
            }
        } catch (err) {
            console.error('Flight search failed:', err)
            setIsFlightSearchErr(true)
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
            const res = await axios.post('/api/v1/flights/search', {
                tripType,
                date,
                origin,
                destination,
                travelerCount,
                cabinClass,
            })
            console.log(res)
            return res.data
        } catch (err) {
            console.error(err)
            throw err
        }
    }

    return (
        <section className='flights'>
            <img
                className='flights__hero-mobile'
                src={flightsHeroMobile}
                alt='flightsHeroMobile'
            />

            <form
                onSubmit={handleSubmit}
                className='flights__form'
            >
                <div className='flights__form-header'>
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

            <div className='flights__description'>
                <h3 className='flights__tagline'>Flights</h3>
                <h1 className='flights__headline'>Travel smart, save time.</h1>
                <p className='flights__text'>
                    Lindela provides tailored assistance for airline ticketing,
                    helping you secure flights that match your schedule, budget
                    and preferences.
                </p>
                <p className='flights__text flights__text--highlight'>
                    320,170 flights booked and counting
                </p>
                {/* Add plane icon with ::before via CSS */}
            </div>
        </section>
    )
}
