import { getAirlineInfo } from '../../utils/airlinesUtils'

export const createFlightNumber = (flight) => {
    const { airlineCode, segments } = flight
    const flightNumber = segments[0].number
    const { name: airlineName, logo: airlineLogo } = getAirlineInfo(airlineCode)

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
