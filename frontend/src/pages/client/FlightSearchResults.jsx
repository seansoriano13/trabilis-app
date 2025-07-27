// 🔗 React & Router
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

// 🎨 Styles
import './FlightSearchResults.css'

// 🧠 Utils
import { formatIso } from '../../utils/flightTimeUtils'
import { Duration } from 'luxon'
import { useAirports } from '../../context/AirportContext'
import { defaultAirportOptionsData } from '../../utils/defaultAirportOptions'

// 🧩 Components
import PrimaryButton from '../../components/client/PrimaryButton'
import FlightResultCard from '../../components/client/FlightResultCard'

// 🎯 Icons
import {
    FaBell,
    FaHotel,
    FaPlane,
    FaCarSide,
    FaAngleDown,
    FaArrowRight,
} from 'react-icons/fa'
import { IoAirplane, IoChevronBack } from 'react-icons/io5'
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md'

// 🧰 Utils
import clsx from 'clsx'

function FlightSearchResults() {
    const { state } = useLocation()
    const {
        flights: allFlights,
        origin,
        destination,
        formattedDate,
        adultCount,
        childCount,
    } = state || {}
    const flights = allFlights?.outbound ?? []

    // States
    const [sortBy, setSortBy] = useState('best')
    const [activeTab, setActiveTab] = useState('Flights')
    const [flightIsFavorite, setflightIsFavorite] = useState({})
    const [isDisabled, setIsDisabled] = useState(false)
    const [selectedOrigin, setSelectedOrigin] = useState(
        origin.label.split(' - ')[0] || null
    )
    const [selectedDestination, setSelectedDestination] = useState(
        destination || null
    )
    const [selectedDate, setSelectedDate] = useState(formattedDate || null)
    const [selectedAdultCount, setSelectedAdultCount] = useState(
        adultCount || 1
    )
    const [selectedChildCount, setselectedChildCount] = useState(
        childCount || 1
    )
    const [selectedCabinClass, setSelectedCabinClass] = useState('ECONOMY')

    // Utils
    const formatPrice = (price) =>
        parseFloat(price).toLocaleString('en-US', {
            maximumFractionDigits: 2,
        })

    const getTotalMinutes = (flight) =>
        flight.itineraries
            .flatMap((itinerary) => itinerary.segments)
            .reduce(
                (sum, segment) =>
                    sum + Duration.fromISO(segment.duration).as('minutes'),
                0
            )

    const getScore = (flight) => {
        const price = parseFloat(flight.price.total)
        const duration = getTotalMinutes(flight)
        return price * 0.7 + duration * 0.3
    }

    const formatMinutes = (min) =>
        Duration.fromObject({ minutes: min }).toFormat("h'h' mm'm'")

    // Cheapest
    const cheapestFlightObj = flights.reduce((min, flight) =>
        parseFloat(flight.price.total) < parseFloat(min.price.total)
            ? flight
            : min
    )
    const cheapestFlightPrice = formatPrice(cheapestFlightObj.price.total)
    const cheapestFlightDuration = formatMinutes(
        getTotalMinutes(cheapestFlightObj)
    )

    // Fastest
    const fastestFlightObj = flights.reduce((fastest, flight) =>
        getTotalMinutes(flight) < getTotalMinutes(fastest) ? flight : fastest
    )
    const fastestFlightPrice = formatPrice(fastestFlightObj.price.total)
    const fastestFlightDuration = formatMinutes(
        getTotalMinutes(fastestFlightObj)
    )

    // Best (lowest price + shortest duration combined score)
    const bestFlightObj = flights.reduce((best, flight) => {
        const price = parseFloat(flight.price.total)
        const duration = getTotalMinutes(flight)

        const bestPrice = parseFloat(best.price.total)
        const bestDuration = getTotalMinutes(best)

        const currentScore = price * 0.7 + duration * 0.3
        const bestScore = bestPrice * 0.7 + bestDuration * 0.3

        return currentScore < bestScore ? flight : best
    })
    const bestFlightPrice = formatPrice(bestFlightObj.price.total)
    const bestFlightDuration = formatMinutes(getTotalMinutes(bestFlightObj))

    // Sort Flight Cards
    const sortedFlights = [...flights].sort((a, b) => {
        if (sortBy === 'cheapest') {
            return parseFloat(a.price.total) - parseFloat(b.price.total)
        }
        if (sortBy === 'fastest') {
            return getTotalMinutes(a) - getTotalMinutes(b)
        }
        if (sortBy === 'best') {
            return getScore(a) - getScore(b)
        }
        return 0
    })

    // Context
    const { airports: options } = useAirports()

    // Select Logics
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

    // Flight Card Component
    const flightsResult = sortedFlights.map((flight, index) => {
        const segments = flight.itineraries[0].segments
        const departureTime = formatIso(segments[0].departure.at)
        const arrivalTime = formatIso(segments.at(-1).arrival.at)
        const departureIata = segments[0].departure.iataCode
        const arrivalIata = segments.at(-1).arrival.iataCode
        const price = flight.price.total
        const durationStr = Duration.fromISO(segments[0].duration).toFormat(
            "h'h' mm'm'"
        )
        const availableSeats = flight.numberOfBookableSeats

        const handleFavoriteClick = (id) => {
            if (isDisabled) return

            setIsDisabled(true)
            setflightIsFavorite((prev) => ({
                ...prev,
                [id]: !prev[id],
            }))

            setTimeout(() => {
                setIsDisabled(false)
            }, 500)
        }

        return (
            <FlightResultCard
                key={flight.id}
                index={index}
                flight={flight}
                availableSeats={availableSeats}
                handleFavoriteClick={() => handleFavoriteClick(flight.id)}
                flightIsFavorite={flightIsFavorite}
                departureTime={departureTime}
                departureIata={departureIata}
                durationStr={durationStr}
                arrivalTime={arrivalTime}
                arrivalIata={arrivalIata}
                price={price}
            />
        )
    })

    const handleClick = (tab) => {
        setActiveTab(tab)
    }

    const handleSelectFlightCard = (selectedCard) => {
        setSortBy(selectedCard)
    }

    return (
        <div className='flight-results'>
            <div className='flight-nav'>
                <div className='flight-nav__tabs'>
                    {/* Flights Button */}
                    <PrimaryButton
                        className={`flight-nav__tab ${
                            activeTab === 'Flights'
                                ? ''
                                : 'flight-nav__tab--disabled'
                        }`}
                        isBold={true}
                        icon={<FaPlane />}
                        buttonText={'Flights'}
                        onClick={() => handleClick('Flights')}
                    />
                    {/* Hotels Button */}
                    <PrimaryButton
                        className={`flight-nav__tab ${
                            activeTab === 'Hotels'
                                ? ''
                                : 'flight-nav__tab--disabled'
                        }`}
                        isBold={true}
                        icon={<FaHotel />}
                        buttonText={'Hotels'}
                        onClick={() => handleClick('Hotels')}
                    />
                    {/* Car Hire Button */}
                    <PrimaryButton
                        className={`flight-nav__tab ${
                            activeTab === 'Car Hire'
                                ? ''
                                : 'flight-nav__tab--disabled'
                        }`}
                        isBold={true}
                        icon={<FaCarSide />}
                        buttonText={'Car Hire'}
                        onClick={() => handleClick('Car Hire')}
                    />
                </div>

                <div className='flight-nav__location'>
                    <IoChevronBack className='flight-nav__back-icon' />
                    <button className='flight-nav__input'>
                        {/* Destination */}
                        {selectedDestination.label}
                    </button>
                </div>

                <div className='flight-nav__filters'>
                    <button className='flight-nav__filter'>
                        {/* Origin */}
                        From {selectedOrigin} <FaAngleDown />
                    </button>
                    <button className='flight-nav__filter'>
                        {/* Adult Count */}
                        {selectedAdultCount}{' '}
                        {selectedAdultCount > 1 ? 'Adults' : 'Adult'}
                        <FaAngleDown />
                    </button>
                    <button className='flight-nav__filter'>
                        {/* Child Count */}
                        {selectedChildCount}{' '}
                        {selectedChildCount > 1 ? 'Children' : 'Child'}
                        <FaAngleDown />
                    </button>
                    <button className='flight-nav__filter'>
                        {/* Date */}
                        {selectedDate}
                        <FaAngleDown />
                    </button>
                    <button className='flight-nav__filter'>
                        {selectedCabinClass.toLowerCase()} <FaAngleDown />
                    </button>
                </div>
            </div>

            <div className='flight-results__main'>
                <div className='flight-results__panel'>
                    <div className='flight-results__header'>
                        <div className='flight-results__title'>
                            <h2>Flights</h2>
                            <p>Results: {flights.length}</p>
                        </div>
                        <div className='flight-results__actions'>
                            <button className='flight-results__btn'>
                                Filter
                            </button>
                            <button className='flight-results__btn'>
                                Sort
                            </button>
                            <button className='flight-results__btn'>
                                <FaBell />
                            </button>
                        </div>
                    </div>
                    <div className='flight-results__summary'>
                        <div
                            className={clsx(
                                'flight-results__card',
                                sortBy === 'best' &&
                                    'flight-results__card--selected'
                            )}
                            onClick={() => {
                                handleSelectFlightCard('best')
                            }}
                        >
                            <p className='flight-results__label'>Best</p>
                            <p className='flight-results__price'>
                                <b>P {bestFlightPrice}</b>
                            </p>
                            <p className='flight-results__duration'>
                                {bestFlightDuration}
                            </p>
                        </div>
                        <div
                            className={clsx(
                                'flight-results__card',
                                sortBy === 'cheapest' &&
                                    'flight-results__card--selected'
                            )}
                            onClick={() => {
                                handleSelectFlightCard('cheapest')
                            }}
                        >
                            <p className='flight-results__label'>Cheapest</p>
                            <p className='flight-results__price'>
                                <b>P {cheapestFlightPrice}</b>
                            </p>
                            <p className='flight-results__duration'>
                                {cheapestFlightDuration}
                            </p>
                        </div>
                        <div
                            className={clsx(
                                'flight-results__card',
                                sortBy === 'fastest' &&
                                    'flight-results__card--selected'
                            )}
                            onClick={() => {
                                handleSelectFlightCard('fastest')
                            }}
                        >
                            <p className='flight-results__label'>Fastest</p>
                            <p className='flight-results__price'>
                                <b>P {fastestFlightPrice}</b>
                            </p>
                            <p className='flight-results__duration'>
                                {fastestFlightDuration}
                            </p>
                        </div>
                    </div>
                </div>
                <section className='flight-results__list'>
                    {flightsResult}
                </section>
            </div>
        </div>
    )
}

export default FlightSearchResults
