import { FaArrowRight } from 'react-icons/fa'
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md'
import { IoAirplane } from 'react-icons/io5'
import PrimaryButton from '../../components/client/PrimaryButton'

import './FlightResultCard.css'

export default function FlightResultCard({
    index,
    flight,
    availableSeats,
    handleFavoriteClick,
    flightIsFavorite,
    departureTime,
    departureIata,
    durationStr,
    arrivalTime,
    arrivalIata,
    price,
}) {
    return (
        <article
            className='flight-result'
            key={index}
        >
            <header className='flight-result__header'>
                <p className='flight-result__airport'>
                    Available Seats: {availableSeats}
                </p>
                <button
                    className='flight-result__favorite'
                    onClick={() => {
                        handleFavoriteClick(flight.id)
                    }}
                >
                    {flightIsFavorite[flight.id] ? (
                        <MdFavorite />
                    ) : (
                        <MdFavoriteBorder />
                    )}
                </button>
            </header>

            <div className='flight-result__timeline'>
                <div className='flight-result__leg'>
                    <time className='flight-result__time'>
                        <b>{departureTime}</b>
                    </time>
                    <span className='flight-result__iata'>{departureIata}</span>
                </div>

                <div className='flight-result__duration'>
                    <p className='flight-result__duration-text'>
                        {durationStr}
                    </p>
                    <div className='flight-result__airline'>
                        <hr className='flight-result__line' />
                        <IoAirplane className='flight-result__icon' />
                    </div>
                </div>

                <div className='flight-result__leg'>
                    <time className='flight-result__time'>
                        <b>{arrivalTime}</b>
                    </time>
                    <span className='flight-result__iata'>{arrivalIata}</span>
                </div>
            </div>
            <div className='flight-result__footer'>
                <div className='flight-result__deal'>
                    <p className='flight-result__deal-price'>
                        <b>P {price}</b>
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
}
