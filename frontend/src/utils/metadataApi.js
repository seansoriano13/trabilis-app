import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL

// Get airline information by ID
export const getAirlineInfo = async (id) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/metadata/airlines`,
            {
                params: { id },
            }
        )
        return response.data.data
    } catch (error) {
        console.error('Error fetching airline info:', error)
        // Return fallback data
        return {
            name: id,
            logo: null,
        }
    }
}

// Get aircraft information by code
export const getAircraftName = async (code) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/metadata/aircraft`,
            {
                params: { code },
            }
        )
        return response.data.data.name
    } catch (error) {
        console.error('Error fetching aircraft info:', error)
        // Return fallback data
        return `Aircraft Code: ${code}`
    }
}

// Get all aircraft entries
export const getAllAircraftEntries = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/metadata/aircraft/all`
        )
        return response.data.data
    } catch (error) {
        console.error('Error fetching all aircraft:', error)
        return []
    }
}

// Get aircraft options for dropdowns
export const getAircraftOptions = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/metadata/aircraft/options`
        )
        return {
            success: true,
            data: response.data.data || [],
        }
    } catch (error) {
        console.error('Error fetching aircraft options:', error)
        return {
            success: false,
            data: [],
        }
    }
}

// Get all airlines
export const getAllAirlines = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/metadata/airlines/all`
        )
        return {
            success: true,
            data: response.data.data || [],
        }
    } catch (error) {
        console.error('Error fetching all airlines:', error)
        return {
            success: false,
            data: [],
        }
    }
}

// Get airline info by name (for logos)
export const getAirlineInfoByName = async (name) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/metadata/airlines`,
            {
                params: { name },
            }
        )
        return {
            success: true,
            data: response.data.data || { name, logo: null },
        }
    } catch (error) {
        console.error('Error fetching airline info:', error)
        return {
            success: false,
            data: { name, logo: null },
        }
    }
}

// Get airport information by IATA code
export const getAirportInfo = async (iata) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/metadata/airport/${iata}`
        )
        if (response.data.success) {
            return response.data.data
        }
        return {
            iata: iata.toUpperCase(),
            name: 'Unknown Airport',
            city: 'Unknown',
            country: 'Unknown',
        }
    } catch (error) {
        console.error('Error fetching airport info:', error)
        return {
            iata: iata.toUpperCase(),
            name: 'Unknown Airport',
            city: 'Unknown',
            country: 'Unknown',
        }
    }
}
