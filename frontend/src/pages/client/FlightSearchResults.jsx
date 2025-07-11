import { useLocation } from 'react-router-dom'
import './FlightSearchResults.css'

function FlightSearchResults() {
    const { state: flights } = useLocation()
    const outbound = JSON.stringify(flights.flights, null, 2)

    return (
        <>
            <pre>{outbound}</pre>
        </>
    )
}

export default FlightSearchResults
