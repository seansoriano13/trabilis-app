import Modal from 'react-modal'
import { GiAirplaneDeparture } from 'react-icons/gi'
import { IoIosClose } from 'react-icons/io'
import { getAircraftName } from '../../utils/metadataApi.js'
import { LuDot } from 'react-icons/lu'
import PrimaryButton from './PrimaryButton'
import { useState, useEffect } from 'react'

function FlightDetailsModal({
    isOpen,
    onClose,
    origin,
    destination,
    departureDate,
    departureTime,
    arrivalTime,
    duration,
    airlineCode,
    flightNumber,
    airlineName,
    aircraftCode,
    departureIata,
}) {
    const [aircraftName, setAircraftName] = useState('Loading...')

    useEffect(() => {
        if (aircraftCode) {
            getAircraftName(aircraftCode).then(setAircraftName)
        }
    }, [aircraftCode])

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className='flight-details__modal'
            overlayClassName='flight-details__modal-overlay'
        >
            <div className='flight-details__modal-header'>
                <h2 className='flight-details__modal-title'>
                    {origin?.city} to {destination?.city}
                </h2>
                <button
                    className='flight-details__close-btn'
                    onClick={onClose}
                >
                    <IoIosClose />
                </button>
            </div>

            <hr className='flight-details__divider' />

            <div className='flight-details__container'>
                <div className='flight-details__info'>
                    <p className='flight-details__info-item'>
                        Departs on <b>{departureDate}</b>
                    </p>
                    <p className='flight-details__info-item'>
                        Total Duration: <b>{duration}</b>
                    </p>
                </div>

                <div className='flight-details__summary'>
                    <div className='flight-details__icon-row'>
                        <GiAirplaneDeparture className='flight-details__icon' />
                        <p className='flight-details__duration'>{duration}</p>
                    </div>

                    <div className='flight-details__divider-group'>
                        <LuDot className='flight-details__divider-dot' />
                        <hr className='flight-details__divider flight-details__divider--vertical' />
                        <LuDot className='flight-details__divider-dot' />
                    </div>

                    <div className='flight-details__segments'>
                        <div className='flight-details__segment'>
                            <p className='flight-details__city-time'>
                                <b>{departureTime}</b> {origin?.city}
                            </p>
                            <p className='flight-details__segment-detail'>
                                {origin?.name} ({departureIata})
                            </p>
                        </div>

                        <div className='flight-meta'>
                            <p className='flight-meta__item'>
                                Flight number {airlineCode} {flightNumber}
                            </p>
                            <p className='flight-meta__item'>
                                Operated by {airlineName}
                            </p>
                            <p className='flight-meta__item'>{aircraftName}</p>
                        </div>

                        <div className='flight-details__segment'>
                            <p className='flight-details__city-time'>
                                <b>{arrivalTime}</b> {destination?.city}
                            </p>
                            <p className='flight-details__segment-detail'>
                                {destination.name} {`(${departureIata})`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <PrimaryButton
                className='flight-details__close-btn-bottom'
                buttonText='Close'
                onClick={onClose}
            />
        </Modal>
    )
}

export default FlightDetailsModal
