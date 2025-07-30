import { IoAirplane } from 'react-icons/io5'

export default function FlightLeg({
    departureTime,
    arrivalTime,
    departureIata,
    arrivalIata,
    durationStr,
}) {
    return (
        <div className='flight-result__timeline'>
            <div className='flight-result__leg'>
                <time className='flight-result__time'>
                    <b>{departureTime}</b>
                </time>
                <span className='flight-result__iata'>{departureIata}</span>
            </div>

            <div className='flight-result__duration'>
                <p className='flight-result__duration-text'>{durationStr}</p>
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
    )
}
