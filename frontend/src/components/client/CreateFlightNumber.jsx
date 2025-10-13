import { getAirlineInfo } from '../../utils/metadataApi.js'
import { useState, useEffect } from 'react'

export const CreateFlightNumber = ({ flight }) => {
    const { airlineCode, segments } = flight
    const flightNumber = segments[0].number
    const [airlineInfo, setAirlineInfo] = useState({ name: 'Loading...', logo: null })

    useEffect(() => {
        if (airlineCode) {
            getAirlineInfo(airlineCode).then(setAirlineInfo)
        }
    }, [airlineCode])

    const { name: airlineName, logo: airlineLogo } = airlineInfo

    return (
        <span className='flight-info'>
            <span>
                {airlineCode} {flightNumber} - {airlineName}
            </span>
            {airlineLogo && (
                <img
                    src={airlineLogo}
                    alt={airlineName}
                    className='flight-info__logo'
                />
            )}
        </span>
    )
}
