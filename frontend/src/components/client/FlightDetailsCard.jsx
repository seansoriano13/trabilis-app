import { CiStopwatch } from 'react-icons/ci'
import { GiAirplaneDeparture } from 'react-icons/gi'
import { IoIosArrowDown } from 'react-icons/io'
import AmenityList from './AmenityList'
import { getAirportInfoByIata } from '../../utils/getAirportInfoByIata'
import { createFlightDetails, formatToLongDate } from '../../utils/flightUtils'
import './FlightDetailsCard.css'
import PrimaryButton from '../client/PrimaryButton'
import { capitalizeWords } from '../../utils/stringUtils'
import { useCallback, useEffect, useState } from 'react'
import { useRef } from 'react'
import { IoAirplane } from 'react-icons/io5'
import FlightDetailsModal from '../client/FlightDetailsModal.jsx'

export default function FlightDetailsCard({
    flightData,
    direction,
    airports,
    fareDetails,
}) {
    const [isAmenityListShown, setIsAmenityListShown] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const timeoutRef = useRef(null)

    const handleClick = useCallback(() => {
        if (timeoutRef.current) return // ignore if still in debounce window

        setIsAmenityListShown((prev) => !prev)

        timeoutRef.current = setTimeout(() => {
            timeoutRef.current = null
        }, 300) // 300ms debounce
    }, [])

    useEffect(() => {
        return () => clearTimeout(timeoutRef.current)
    }, [])

    const segments = flightData.segments
    const departureIata = flightData.departureIata
    const arrivalIata = flightData.arrivalIata
    const departureTime = flightData.departureTime
    const arrivalTime = flightData.arrivalTime
    const duration = flightData.durationStr

    const origin = getAirportInfoByIata(departureIata, airports)
    const destination = getAirportInfoByIata(arrivalIata, airports)
    const terminal = {
        departure: segments[0]?.departure?.terminal,
        arrival: segments[0]?.arrival?.terminal,
    }

    const departureDate = formatToLongDate(segments[0]?.departure?.at)

    const { airlineCode, flightNumber, airlineName, airlineLogo } =
        createFlightDetails(flightData)
    const aircraftCode = segments[0].aircraft.code

    const amenities = fareDetails?.amenities || []
    const brandedFareLabel = fareDetails?.brandedFareLabel || ''

    return (
        <div className={'flight-details'}>
            <FlightDetailsModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                origin={origin}
                destination={destination}
                departureDate={departureDate}
                departureTime={departureTime}
                arrivalTime={arrivalTime}
                duration={duration}
                airlineCode={airlineCode}
                flightNumber={flightNumber}
                airlineName={airlineName}
                aircraftCode={aircraftCode}
                departureIata={departureIata}
            />

            <div
                className={`flight-details__route flight-details__route--${direction}`}
            >
                <h2 className='flight-details__city'>
                    {origin?.city} to {destination?.city}
                </h2>
                <h2 className='flight-details__date'>{departureDate}</h2>
            </div>

            <div className='flight-section'>
                <div className='flight-details__route-block'>
                    <div className='flight-details__time'>
                        <div className='flight-details__time-block'>
                            <h3 className='flight-details__time-hour'>
                                {departureTime}
                            </h3>
                            <p className='flight-details__time-iata'>
                                {departureIata}
                            </p>
                        </div>
                        <hr className='flight-details__separator' />
                        <IoAirplane className='flight-details__airplane' />
                        <div className='flight-details__time-block'>
                            <h3 className='flight-details__time-hour'>
                                {arrivalTime}
                            </h3>
                            <p className='flight-details__time-iata flight-details__time-iata--right'>
                                {arrivalIata}
                            </p>
                        </div>
                    </div>

                    <div className='flight-details__airports'>
                        <div className='flight-details__airport-group'>
                            <p className='flight-details__airport-name'>
                                {origin?.name}
                            </p>
                            <p className='flight-details__airport-terminal'>
                                Terminal {terminal.departure}
                            </p>
                        </div>
                        <div className='flight-details__airport-group flight-details__airport-group--right'>
                            <p className='flight-details__airport-name'>
                                {destination?.name}
                            </p>
                            <p className='flight-details__airport-terminal'>
                                Terminal {terminal.arrival}
                            </p>
                        </div>
                    </div>
                </div>

                <div className='flight-details__airline'>
                    <div className='flight-details__info-group'>
                        <CiStopwatch className='flight-details__icon' />
                        <p className='flight-details__duration'>{duration}</p>
                    </div>
                    <div className='flight-details__info-group'>
                        <GiAirplaneDeparture className='flight-details__icon' />
                        <p className='flight-details__flight-number'>
                            {airlineCode} {flightNumber} {airlineName}
                        </p>
                        <img
                            className='flight-details__logo'
                            src={airlineLogo}
                            alt={airlineName}
                        />
                    </div>
                </div>
                <PrimaryButton
                    onClick={() => setIsOpen(true)}
                    buttonText={'See itinerary details'}
                    isBold={true}
                    className='flight-details__btn flight-details__btn--itinerary'
                    icon={null}
                    iconPosition={'left'}
                />
            </div>

            <div className='flight-details__amenities'>
                <div
                    onClick={() => handleClick()}
                    className='flight-details__fare-label'
                >
                    <h2 className='flight-details__fare'>
                        {capitalizeWords(brandedFareLabel) || 'Economy'}
                    </h2>
                    <IoIosArrowDown className='flight-details__arrow' />
                </div>
                {isAmenityListShown && (
                    <>
                        <AmenityList
                            amenities={amenities}
                            direction={direction}
                        />
                        <PrimaryButton
                            buttonText={'Change Flight'}
                            isBold={true}
                            className='flight-details__btn'
                        />
                    </>
                )}
            </div>
        </div>
    )
}
