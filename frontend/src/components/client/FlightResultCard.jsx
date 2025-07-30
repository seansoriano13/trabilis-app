import { FaArrowRight } from 'react-icons/fa'
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md'
import PrimaryButton from '../../components/client/PrimaryButton'
import FlightLeg from '../client/FlightLeg'

import './FlightResultCard.css'

export default function FlightResultCard({
    index,
    flight,
    handleFavoriteClick,
    flightIsFavorite,
    outboundData,
    inboundData,
    price,
}) {
    return (
        <article
            className='flight-result'
            key={index}
        >
            <header className='flight-result__header'>
                <p className='flight-result__airport'>Airline Name</p>
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

            <FlightLeg {...outboundData} />
            {inboundData && <FlightLeg {...inboundData} />}

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
