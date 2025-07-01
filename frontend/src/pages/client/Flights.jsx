import 'flatpickr/dist/themes/airbnb.css'
import flightsHeroMobile from '../../assets/flights-hero-mobile.jpeg'
import { BsFillAirplaneFill } from 'react-icons/bs'
import { AiOutlineSwap } from 'react-icons/ai'
import Select from 'react-select'
import './Flights.css'
import { useState, useRef } from 'react'
import Flatpickr from 'react-flatpickr'

export default function Flights() {
    // Constants
    const datepickerRef = useRef()

    const primary = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-yellow')
        .trim()

    const tripTypeOptions = [
        { value: 'round-trip', label: 'Round-trip' },
        { value: 'one-way', label: 'One-way' },
    ]

    const airportOptions = [
        { value: 'MNL', label: 'Manila - MNL' },
        { value: 'CEB', label: 'Cebu - CEB' },
        { value: 'DVO', label: 'Davao - DVO' },
        { value: 'HKG', label: 'Hong Kong - HKG' },
        { value: 'SIN', label: 'Singapore - SIN' },
        { value: 'KUL', label: 'Kuala Lumpur - KUL' },
    ]

    const flatPickrStyles = () => ({
        control: (base) => ({
            ...base,
            border: 'none',
            boxShadow: 'none',
            background: 'none',
        }),
        placeholder: (base) => ({
            ...base,
            color: 'white',
        }),
        singleValue: (base) => ({
            ...base,
            color: 'white',
            opacity: '.9',
        }),
        menu: (base) => ({
            ...base,
            position: 'absolute',
            top: '30px',
            borderRadius: '10px',
            background: 'rgba(190, 190, 190, 0.1)',
            border: 'none',
            opacity: 0,
            transform: 'translateY(-5px)',
            animation: 'fadeSlideIn 0.2s ease forwards',
        }),
        option: (base, state) => ({
            ...base,
            borderRadius: '10px',
            backgroundColor: state.isSelected
                ? primary
                : state.isFocused
                ? '#2a2a2a40'
                : 'transparent',
            color: state.isSelected ? '#000' : '#fff',
            cursor: 'pointer',
            ':active': {
                backgroundColor: state.isSelected ? primary : '#2a2a2a',
            },
        }),
        menuList: (base) => ({
            ...base,
            padding: '0',
        }),
        indicatorSeparator: () => ({
            opacity: '1',
        }),
    })

    // States
    const [date, setDate] = useState([])
    const [origin, setOrigin] = useState(null)
    const [destination, setDestination] = useState(null)
    const [tripType, setTripType] = useState(tripTypeOptions[0])

    return (
        <section className='flights'>
            <img
                className='flights__hero-mobile'
                src={flightsHeroMobile}
                alt='flightsHeroMobile'
            />

            <form className='flights__form'>
                <div className='flights__form-header'>
                    <p>
                        <b>Get started</b> by searching for flights.
                    </p>
                </div>

                <div className='flights__form-row'>
                    <Select
                        defaultValue={tripType}
                        isSearchable={false}
                        options={tripTypeOptions}
                        onChange={(tripType) => setTripType(tripType)}
                        styles={flatPickrStyles()}
                    />
                </div>

                <Flatpickr
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
                        dateFormat: 'M j, Y',
                        disableMobile: true,
                        closeOnSelect: false,
                        minDate: 'today',
                    }}
                />

                <div className='flights__form-row flights__form-row--swap'>
                    <button className='flights__swap-btn'>
                        <AiOutlineSwap />
                    </button>
                    <div className='flights__route'>
                        <Select
                            value={origin}
                            onChange={setOrigin}
                            options={airportOptions}
                            placeholder='Select Origin'
                        />
                        <Select
                            value={destination}
                            onChange={setDestination}
                            options={airportOptions}
                            placeholder='Select Destination'
                        />
                    </div>
                </div>

                <button className='flights__submit-btn'>Search flights</button>
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
