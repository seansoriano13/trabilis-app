import { createContext, useContext, useState, useEffect } from 'react'
import { getAllAirlines } from '../utils/metadataApi'

const AirlinesContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export const useAirlines = () => useContext(AirlinesContext)

export const AirlinesProvider = ({ children }) => {
    const [airlines, setAirlines] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadAirlines = async () => {
            try {
                const response = await getAllAirlines()
                if (response.success) {
                    const airlinesData = response.data || []
                    const formattedAirlines = airlinesData
                        .filter(airline => airline.name && airline.id)
                        .map(airline => ({
                            value: airline.name,
                            label: airline.name,
                            id: airline.id,
                            logo: airline.logo,
                            lcc: airline.lcc
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label))
                    
                    setAirlines(formattedAirlines)
                }
            } catch (err) {
                console.error('Failed to load airlines:', err)
                // Fallback to empty array if API fails
                setAirlines([])
            } finally {
                setLoading(false)
            }
        }
        loadAirlines()
    }, [])

    return (
        <AirlinesContext.Provider value={{ airlines, loading }}>
            {children}
        </AirlinesContext.Provider>
    )
}
