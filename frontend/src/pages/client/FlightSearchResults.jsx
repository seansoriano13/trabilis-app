import { useLocation } from 'react-router-dom'
import './FlightSearchResults.css'
import { formatIso } from '../../utils/flightTimeUtils'
// getDuration
import { FaBell, FaHotel, FaPlane } from 'react-icons/fa'
import { IoAirplane } from 'react-icons/io5'
import { MdFavorite } from 'react-icons/md'
import { FaCarSide } from 'react-icons/fa'
import { MdFavoriteBorder } from 'react-icons/md'
import { IoChevronBack } from 'react-icons/io5'
import { FaAngleDown } from 'react-icons/fa'
import { FaArrowRight } from 'react-icons/fa'
import PrimaryButton from '../../components/client/PrimaryButton'
import { useState } from 'react'
import clsx from 'clsx'

function FlightSearchResults() {
    const { state: flights } = useLocation()
    const [isFavorite, setIsFavorite] = useState(false)
    const [isDisabled, setIsDisabled] = useState(false)

    const flightsResult = flights.flights.outbound.map((flight, index) => {
        const departureAirport = flight.departure.airport
        const departureTimeIso = flight.departure.scheduled
        const departureTime = formatIso(departureTimeIso)
        const departureIata = flight.departure.iata

        const arrivalTimeIso = flight.arrival.scheduled
        const arrivalTime = formatIso(arrivalTimeIso)
        const arrivalIata = flight.arrival.iata

        // const flightDuration = getDuration(departureTimeIso, arrivalTimeIso)

        const handleFavoriteClick = () => {
            if (isDisabled) return

            setIsDisabled(true)
            setIsFavorite(!isFavorite)

            setTimeout(() => {
                setIsDisabled(false)
            }, 500)
        }
        return (
            <article
                className='flight-result'
                key={index}
            >
                <header className='flight-result__header'>
                    <p className='flight-result__airport'>{departureAirport}</p>
                    <button
                        className='flight-result__favorite'
                        onClick={() => {
                            handleFavoriteClick()
                        }}
                    >
                        {isFavorite ? <MdFavoriteBorder /> : <MdFavorite />}
                    </button>
                </header>

                <div className='flight-result__timeline'>
                    <div className='flight-result__leg'>
                        <time className='flight-result__time'>
                            <b>{departureTime}</b>
                        </time>
                        <span className='flight-result__iata'>
                            {departureIata}
                        </span>
                    </div>

                    <div className='flight-result__duration'>
                        <p className='flight-result__duration-text'>2h 25m</p>
                        {/* {flightDuration} */}
                        <div className='flight-result__airline'>
                            <hr className='flight-result__line' />
                            <IoAirplane className='flight-result__icon' />
                        </div>
                    </div>

                    <div className='flight-result__leg'>
                        <time className='flight-result__time'>
                            <b>{arrivalTime}</b>
                        </time>
                        <span className='flight-result__iata'>
                            {arrivalIata}
                        </span>
                    </div>
                </div>
                <div className='flight-result__footer'>
                    <div className='flight-result__deal'>
                        <p className='flight-result__deal-price'>
                            <b>P 2,112</b>
                        </p>
                    </div>
                    <PrimaryButton
                        className='flight-result__select-btn'
                        buttonText={'Book Now'}
                        icon={<FaArrowRight />}
                        iconPosition='right'
                    />
                </div>
            </article>
        )
    })

    const [activeTab, setActiveTab] = useState('Flights')
    const [selectedCard, setSelectedCard] = useState('best')

    const handleClick = (tab) => {
        setActiveTab(tab)
    }

    const handleSelectFlightCard = (selectedCard) => {
        setSelectedCard(selectedCard)
    }

    return (
        <div className='flight-results'>
            <div className='flight-nav'>
                <div className='flight-nav__tabs'>
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
                    <input
                        className='flight-nav__input'
                        type='text'
                        disabled
                        defaultValue={'Hong Kong Intl (HKG)'}
                    />
                </div>

                <div className='flight-nav__filters'>
                    <button className='flight-nav__filter'>
                        From Manila Ninoy Aquino (MNL) <FaAngleDown />
                    </button>
                    <button className='flight-nav__filter'>
                        1 adult <FaAngleDown />
                    </button>
                    <button className='flight-nav__filter'>
                        Sat. 2 Aug <FaAngleDown />
                    </button>
                    <button className='flight-nav__filter'>
                        Economy <FaAngleDown />
                    </button>
                </div>
            </div>

            <div className='flight-results__main'>
                <div className='flight-results__header'>
                    <div className='flight-results__title'>
                        <h2>Flights</h2>
                        <p>1 result</p>
                    </div>
                    <div className='flight-results__actions'>
                        <button className='flight-results__btn'>Filter</button>
                        <button className='flight-results__btn'>Sort</button>
                        <button className='flight-results__btn'>
                            <FaBell />
                        </button>
                    </div>
                </div>

                <div className='flight-results__summary'>
                    <div
                        className={clsx(
                            'flight-results__card',
                            selectedCard === 'best' &&
                                'flight-results__card--selected'
                        )}
                        onClick={() => {
                            handleSelectFlightCard('best')
                        }}
                    >
                        <p className='flight-results__label'>Best</p>
                        <p className='flight-results__price'>
                            <b>P 2,112</b>
                        </p>
                        <p className='flight-results__duration'>2h 25m</p>
                    </div>
                    <div
                        className={clsx(
                            'flight-results__card',
                            selectedCard === 'cheapest' &&
                                'flight-results__card--selected'
                        )}
                        onClick={() => {
                            handleSelectFlightCard('cheapest')
                        }}
                    >
                        <p className='flight-results__label'>Cheapest</p>
                        <p className='flight-results__price'>
                            <b>P 2,112</b>
                        </p>
                        <p className='flight-results__duration'>2h 25m</p>
                    </div>
                    <div
                        className={clsx(
                            'flight-results__card',
                            selectedCard === 'fastest' &&
                                'flight-results__card--selected'
                        )}
                        onClick={() => {
                            handleSelectFlightCard('fastest')
                        }}
                    >
                        <p className='flight-results__label'>Fastest</p>
                        <p className='flight-results__price'>
                            <b>P 3,512</b>
                        </p>
                        <p className='flight-results__duration'>2h 25m</p>
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
