import React, { useState } from 'react'
import Modal from 'react-modal'
import { IoIosClose, IoIosArrowDown } from 'react-icons/io'
import { BsFillSuitcaseLgFill } from 'react-icons/bs'
import './BaggagePolicyModal.css'

const BaggageSegment = ({ title, passengers }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleClick = () => setIsOpen((prev) => !prev)

    return (
        <div className='flight-details__segment'>
            <div className='flight-details__segment-header'>
                <h2 className='flight-details__segment-title'>{title}</h2>
                <IoIosArrowDown
                    onClick={handleClick}
                    className={`flight-details__segment-arrow ${
                        isOpen ? 'open' : ''
                    }`}
                />
            </div>

            {isOpen && (
                <div className='flight-details__passenger-list'>
                    {passengers.map((passenger, index) => (
                        <div
                            key={index}
                            className='flight-details__passenger'
                        >
                            <p className='flight-details__passenger-label'>
                                {`Passenger ${index + 1} (${passenger.type})`}
                            </p>

                            <div className='flight-details__baggage-item'>
                                <div className='flight-details__baggage-info'>
                                    <BsFillSuitcaseLgFill className='flight-details__baggage-icon' />
                                    <h3 className='flight-details__baggage-title'>
                                        Checked bags
                                    </h3>
                                </div>
                                <p className='flight-details__baggage-desc'>
                                    {passenger.checked.label} <br />
                                    {passenger.checked.weight}
                                </p>
                            </div>

                            <div className='flight-details__baggage-item'>
                                <div className='flight-details__baggage-info'>
                                    <BsFillSuitcaseLgFill className='flight-details__baggage-icon' />
                                    <h3 className='flight-details__baggage-title'>
                                        Carry-on bags
                                    </h3>
                                </div>
                                <p className='flight-details__baggage-desc'>
                                    {passenger.carry.label} <br />
                                    {passenger.carry.weight}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function BaggagePolicyModal({ isOpen, onClose, baggage }) {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className='modal'
            overlayClassName='modal__overlay'
        >
            <div className='flight-details__modal-header'>
                <h2 className='flight-details__modal-title'>Baggage Policy</h2>
                <button
                    className='flight-details__close-btn'
                    onClick={onClose}
                >
                    <IoIosClose />
                </button>
            </div>

            <hr className='flight-details__divider' />

            <div className='flight-details__modal-content'>
                {baggage?.outbound && (
                    <BaggageSegment
                        title={baggage.outbound.route}
                        passengers={baggage.outbound.passengers}
                    />
                )}
                {baggage?.inbound && (
                    <BaggageSegment
                        title={baggage.inbound.route}
                        passengers={baggage.inbound.passengers}
                    />
                )}
            </div>
        </Modal>
    )
}
