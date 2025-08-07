import { createContext, useContext, useState, useEffect } from 'react'
import { AIRPORTS_URL } from './airportConstants'

const AirportContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export const useAirports = () => useContext(AirportContext)

export const AirportProvider = ({ children }) => {
    const [airports, setAirports] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadAirports = async () => {
            try {
                const res = await fetch(AIRPORTS_URL)
                const data = await res.json()
                const filtered = Object.entries(data)
                    .filter(([, a]) => a.iata && a.name && a.city && a.country)
                    .map(([, a]) => ({
                        value: a.iata,
                        city: a.city,
                        name: a.name,
                        label: `${a.name} (${a.iata}) - ${a.city}, ${a.country}`,
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label))
                setAirports(filtered)
            } catch (err) {
                console.error('Failed to load airports:', err)
            } finally {
                setLoading(false)
            }
        }
        loadAirports()
    }, [])

    return (
        <AirportContext.Provider value={{ airports, loading }}>
            {children}
        </AirportContext.Provider>
    )
}
