
import { searchAirports } from '../services/airportSearchService.js'

export const filterOptions = (inputValue, options) =>
    options.filter((a) =>
        a.label.toLowerCase().includes(inputValue.toLowerCase())
    )

export const loadOptions = (options, defaultAirportOptionsData) => {
    const defaultOptions = options.filter((option) =>
        defaultAirportOptionsData.includes(option.value)
    )

    const asyncLoader = async (inputValue, callback) => {
        if (inputValue.length < 3) {
            callback([])
            return
        }

        try {
            // Use the new Amadeus API service
            const results = await searchAirports(inputValue)
            callback(results)
        } catch (error) {
            console.error('[AIRPORT LOADER] Search failed, falling back to local filter', { 
                inputValue, 
                error: error.message 
            })
            
            // Fallback to local filtering if API fails
            setTimeout(() => {
                callback(filterOptions(inputValue, options))
            }, 100)
        }
    }

    return { asyncLoader, defaultOptions }
}
