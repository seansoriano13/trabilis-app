import 'flatpickr/dist/themes/airbnb.css'
import flightsHeroMobile from '../../assets/flights-hero-mobile.jpeg'
import { BsFillAirplaneFill } from 'react-icons/bs'
import { AiOutlineSwap } from 'react-icons/ai'
import Select from 'react-select'
import './Flights.css'
import { useState, useRef } from 'react'
import Flatpickr from 'react-flatpickr'
import PrimaryButton from '../../components/client/PrimaryButton'
import { reactSelectStyles } from '../../styles/client/reactSelectStyles'
import { useAirports } from '../../context/AirportContext'
import AsyncSelect from 'react-select/async'
import { defaultAirportOptionsData } from '../../utils/defaultAirportOptions'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Flights() {
    // Constants

    const tripTypeOptions = [
        { value: 'round-trip', label: 'Round-trip' },
        { value: 'one-way', label: 'One-way' },
    ]

    // States
    const [tripType, setTripType] = useState(tripTypeOptions[0])
    const [date, setDate] = useState([])
    const [origin, setOrigin] = useState(null)
    const [destination, setDestination] = useState(null)

    const datepickerRef = useRef()
    const navigate = useNavigate()
    const selectStyles = reactSelectStyles

    const handleSwapOrigin = () => {
        setOrigin(destination)
        setDestination(origin)
    }

    const { airports: options, loading } = useAirports()

    const filterOptions = (inputValue) =>
        options.filter((a) =>
            a.label.toLowerCase().includes(inputValue.toLowerCase())
        )

    const loadOptions = (inputValue, callback) => {
        if (inputValue.length < 3) {
            callback([])
            return
        }

        setTimeout(() => {
            callback(filterOptions(inputValue))
        }, 1000)
    }

    // Default Values of AsyncSelect
    const defaultOptions = options.filter((option) =>
        defaultAirportOptionsData.includes(option.value)
    )

    const formatToYMD = (date) => {
        const [start, end] = Array.isArray(date) ? date : [date]
        if (!start || !(start instanceof Date)) return ''

        const toYMD = (d) => {
            const yyyy = d.getFullYear()
            const mm = String(d.getMonth() + 1).padStart(2, '0')
            const dd = String(d.getDate()).padStart(2, '0')
            return `${yyyy}-${mm}-${dd}` // fixed MM-DD order
        }

        return end ? [toYMD(start), toYMD(end)] : toYMD(start)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formattedDate = formatToYMD(date)

        const flights = await searchFlights(
            tripType,
            formattedDate, 
            origin,
            destination
        )

        navigate('search-result', { state: flights })
    }

    const searchFlights = async (tripType, date, origin, destination) => {
        try {
            const res = await axios.post('/api/v1/flights/search', {
                tripType,
                date,
                origin,
                destination,
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
                        options={tripTypeOptions}
                        onChange={(tripType) => {
                            setTripType(tripType)
                            setDate(null)
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
                <div className=''>
                    <div>
                        <div className='flights__route'>
                            <AsyncSelect
                                required
                                name='origin'
                                cacheOptions
                                defaultOptions={defaultOptions}
                                loadOptions={loadOptions}
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
                                loadOptions={loadOptions}
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

                <PrimaryButton
                    buttonText='Search Flights'
                    isBold={false}
                    style={{ padding: '1rem 2rem' }}
                />
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
