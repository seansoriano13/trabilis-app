import { createContext, useContext, useState, useEffect } from 'react'
import { preCachePopularSearches } from '../services/airportSearchService'

const AirportContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export const useAirports = () => useContext(AirportContext)

export const AirportProvider = ({ children }) => {
    const [airports, setAirports] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadPopularAirports = async () => {
            try {
                // Load a smaller set of popular airports for default options
                const popularAirports = [
                    { value: 'LHR', city: 'London', name: 'London Heathrow Airport', label: 'London Heathrow Airport (LHR) - London, GB' },
                    { value: 'LGW', city: 'London', name: 'London Gatwick Airport', label: 'London Gatwick Airport (LGW) - London, GB' },
                    { value: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', label: 'John F. Kennedy International Airport (JFK) - New York, US' },
                    { value: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', label: 'Los Angeles International Airport (LAX) - Los Angeles, US' },
                    { value: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', label: 'Charles de Gaulle Airport (CDG) - Paris, FR' },
                    { value: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', label: 'Frankfurt Airport (FRA) - Frankfurt, DE' },
                    { value: 'DXB', city: 'Dubai', name: 'Dubai International Airport', label: 'Dubai International Airport (DXB) - Dubai, AE' },
                    { value: 'SIN', city: 'Singapore', name: 'Singapore Changi Airport', label: 'Singapore Changi Airport (SIN) - Singapore, SG' },
                    { value: 'HKG', city: 'Hong Kong', name: 'Hong Kong International Airport', label: 'Hong Kong International Airport (HKG) - Hong Kong, HK' },
                    { value: 'NRT', city: 'Tokyo', name: 'Narita International Airport', label: 'Narita International Airport (NRT) - Tokyo, JP' },
                    { value: 'ICN', city: 'Seoul', name: 'Incheon International Airport', label: 'Incheon International Airport (ICN) - Seoul, KR' },
                    { value: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith Airport', label: 'Sydney Kingsford Smith Airport (SYD) - Sydney, AU' },
                    { value: 'MEL', city: 'Melbourne', name: 'Melbourne Airport', label: 'Melbourne Airport (MEL) - Melbourne, AU' },
                    { value: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International Airport', label: 'Toronto Pearson International Airport (YYZ) - Toronto, CA' },
                    { value: 'YVR', city: 'Vancouver', name: 'Vancouver International Airport', label: 'Vancouver International Airport (YVR) - Vancouver, CA' },
                    { value: 'GRU', city: 'São Paulo', name: 'São Paulo Guarulhos International Airport', label: 'São Paulo Guarulhos International Airport (GRU) - São Paulo, BR' },
                    { value: 'EZE', city: 'Buenos Aires', name: 'Ezeiza International Airport', label: 'Ezeiza International Airport (EZE) - Buenos Aires, AR' },
                    { value: 'MAD', city: 'Madrid', name: 'Adolfo Suárez Madrid–Barajas Airport', label: 'Adolfo Suárez Madrid–Barajas Airport (MAD) - Madrid, ES' },
                    { value: 'BCN', city: 'Barcelona', name: 'Barcelona–El Prat Airport', label: 'Barcelona–El Prat Airport (BCN) - Barcelona, ES' },
                    { value: 'FCO', city: 'Rome', name: 'Leonardo da Vinci–Fiumicino Airport', label: 'Leonardo da Vinci–Fiumicino Airport (FCO) - Rome, IT' }
                ]
                
                setAirports(popularAirports)
                
                // Pre-cache popular searches in the background
                preCachePopularSearches()
                
            } catch (err) {
                console.error('Failed to load popular airports:', err)
                // Set empty array as fallback
                setAirports([])
            } finally {
                setLoading(false)
            }
        }
        
        loadPopularAirports()
    }, [])

    return (
        <AirportContext.Provider value={{ airports, loading }}>
            {children}
        </AirportContext.Provider>
    )
}
