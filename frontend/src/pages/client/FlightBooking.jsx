import { useLocation, useNavigate } from 'react-router-dom'
import { useAirports } from '../../context/AirportContext'
import { SyncLoader } from 'react-spinners'
import FlightDetailsCard from '../../components/client/FlightDetailsCard'
import './FlightBooking.css'
import PrimaryButton from '../../components/client/PrimaryButton'
import { useEffect, useState } from 'react'
import BaggagePolicyModal from '../../components/client/BaggagePolicyModal'
import { getAirportInfoByIata } from '../../utils/getAirportInfoByIata'
import { formatToLongDate } from '../../utils/flightUtils'

function FlightBooking() {
    const { airports: options, loading } = useAirports()
    const { state } = useLocation()
    const flight = state

    const navigate = useNavigate()

    // Derived Data
    const outbound = flight.outboundData
    const inbound = flight.inboundData ?? null
    const currency = flight.currency
    const price = flight.price

    const [isBaggageModalOpen, setIsBaggageModalOpen] = useState(false)
    const [, setBookingData] = useState(state)

    useEffect(() => {
        if (!state) {
            const stored = sessionStorage.getItem('bookingData')
            if (stored) setBookingData(JSON.parse(stored))
        }
    }, [state])

    // Format baggage utility
    const formatBaggage = (bag) => {
        if (!bag) {
            return {
                label: 'Not included',
                weight: 'No allowance',
            }
        }

        const label = 'Included in fare'
        let weight = ''

        if (bag.quantity && bag.weight) {
            weight = `${bag.quantity} bag(s), ${bag.weight}${
                bag.weightUnit || 'KG'
            } included in fare`
        } else if (bag.weight) {
            weight = `${bag.weight}${bag.weightUnit || 'KG'} included in fare`
        } else if (bag.quantity) {
            weight = `${bag.quantity} bag(s) included in fare`
        } else {
            weight = 'Allowance included'
        }

        return { label, weight }
    }

    // Extract fare details
    const fareDetailsBySegment = {
        outbound:
            flight?.flight?.travelerPricings[0]?.fareDetailsBySegment[0] || [],
        inbound:
            flight?.flight?.travelerPricings[0]?.fareDetailsBySegment[1] || [],
    }

    // Create baggage preview data
    const baggagePreview = {
        outbound: {
            cabin: formatBaggage(
                fareDetailsBySegment.outbound?.includedCabinBags
            ),
            checked: formatBaggage(
                fareDetailsBySegment.outbound?.includedCheckedBags
            ),
        },
        inbound: {
            cabin: formatBaggage(
                fareDetailsBySegment.inbound?.includedCabinBags
            ),
            checked: formatBaggage(
                fareDetailsBySegment.inbound?.includedCheckedBags
            ),
        },
    }

    // Final baggageModalData object
    const baggageModalData = {
        outbound: {
            route: `${
                getAirportInfoByIata(
                    flight?.flight?.itineraries[0]?.segments[0]?.departure
                        ?.iataCode,
                    options
                ).city
            } - ${
                getAirportInfoByIata(
                    flight?.flight?.itineraries[0]?.segments.at(-1)?.arrival
                        ?.iataCode,
                    options
                ).city
            }`,
            passengers: [
                ...(flight.travelerCount.adults > 0
                    ? Array.from(
                          { length: flight.travelerCount.adults },
                          () => ({
                              type: 'Adult',
                              checked: baggagePreview.outbound.checked,
                              carry: baggagePreview.outbound.cabin,
                          })
                      )
                    : []),
                ...(flight.travelerCount.children > 0
                    ? Array.from(
                          { length: flight.travelerCount.children },
                          () => ({
                              type: 'Child',
                              checked: baggagePreview.outbound.checked,
                              carry: baggagePreview.outbound.cabin,
                          })
                      )
                    : []),
            ],
        },
        ...(flight?.flight?.itineraries[1] && {
            inbound: {
                route: `${
                    getAirportInfoByIata(
                        flight?.flight?.itineraries[1]?.segments[0]?.departure
                            ?.iataCode,
                        options
                    ).city
                } - ${
                    getAirportInfoByIata(
                        flight?.flight?.itineraries[1]?.segments.at(-1)?.arrival
                            ?.iataCode,
                        options
                    ).city
                }`,
                passengers: [
                    ...(flight.travelerCount.adults > 0
                        ? Array.from(
                              { length: flight.travelerCount.adults },
                              () => ({
                                  type: 'Adult',
                                  checked: baggagePreview.inbound.checked,
                                  carry: baggagePreview.inbound.cabin,
                              })
                          )
                        : []),
                    ...(flight.travelerCount.children > 0
                        ? Array.from(
                              { length: flight.travelerCount.children },
                              () => ({
                                  type: 'Child',
                                  checked: baggagePreview.inbound.checked,
                                  carry: baggagePreview.inbound.cabin,
                              })
                          )
                        : []),
                ],
            },
        }),
    }

    if (loading) {
        return (
            <div className='flight-booking__loading'>
                <SyncLoader
                    color='#f7d100'
                    size={15}
                />
            </div>
        )
    }

    const handleClick = () => {
        const passengerData = {
            flight,
            id: flight.id,
            travelerCount: flight.travelerCount,
            origin: flight.outboundData.departureIata,
            destination: flight.outboundData.arrivalIata,
            outboundDeparture: formatToLongDate(
                flight.outboundData.segments[0].departure.at
            ),
            ...(flight.inboundData && {
                inboundDeparture: formatToLongDate(
                    flight.inboundData.segments[0].departure.at
                ),
            }),
        }

        // Keep your existing in-memory navigation
        navigate(`/flights/passenger-details/${flight.id}`, {
            state: passengerData,
        })

        // Add reload persistence
        sessionStorage.setItem('passengerData', JSON.stringify(passengerData))
    }

    return (
        <div className='flight-booking pt-[var(--default-padding-top)] lg:pt-25 md:pt-35'>
            <BaggagePolicyModal
                isOpen={isBaggageModalOpen}
                onClose={() => setIsBaggageModalOpen(false)}
                baggage={baggageModalData}
            />
            <div className='flight-booking__main max-w-[1200px] mx-auto'>
                <h2 className='flight-booking__heading'>Flight details</h2>

                <FlightDetailsCard
                    direction='outbound'
                    flightData={outbound}
                    airports={options}
                    fareDetails={fareDetailsBySegment.outbound}
                />

                {inbound && (
                    <FlightDetailsCard
                        direction='inbound'
                        flightData={inbound}
                        airports={options}
                        fareDetails={fareDetailsBySegment.inbound}
                    />
                )}

                <div className='flight-booking__summary-wrapper'>
                    <div className='flight-booking__price-summary'>
                        <div className='flight-booking__price'>
                            <h2 className='flight-booking__price-label'>
                                Total price: {currency}
                            </h2>
                            <h1 className='flight-booking__price-value'>
                                {price}
                            </h1>
                        </div>
                        <h3 className='flight-booking__note'>
                            (including taxes, fees and discounts)
                        </h3>
                    </div>

                    <div className='flight-booking__policies'>
                        <PrimaryButton
                            onClick={() => setIsBaggageModalOpen(true)}
                            className='flight-booking__policy-btn'
                            buttonText='Detailed baggage policy'
                        />
                    </div>

                    <PrimaryButton
                        onClick={() => handleClick()}
                        className='flight-booking__passenger-btn'
                        buttonText='Fill passenger details'
                        isBold={true}
                    />
                </div>
            </div>
        </div>
    )
}

export default FlightBooking
