import { FaArrowRight } from 'react-icons/fa'
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md'
import PrimaryButton from '../../components/client/PrimaryButton'
import FlightLeg from '../client/FlightLeg'

import './FlightResultCard.css'
import { getAirlineInfo } from '../../utils/airlinesUtils'

export default function FlightResultCard({
    index,
    flight,
    handleFavoriteClick,
    flightIsFavorite,
    outboundData,
    inboundData,
    price,
}) {
    const { name, logo } = getAirlineInfo(outboundData.airlineCode)

    return (
        <article
            className='flight-result'
            key={index}
        >
            <header className='flight-result__header'>
                <div className='flight-result__info'>
                    <img
                        className='flight-result__logo'
                        src={logo || ''}
                        alt={name}
                    />
                    <p className='flight-result__airport'>{name}</p>
                </div>
                <button
                    className='flight-result__favorite'
                    onClick={() => handleFavoriteClick(flight.id)}
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
