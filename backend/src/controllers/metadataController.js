import { getAirlineInfo } from '../utils/airlinesUtils.js'
import {
    getAircraftName,
    getAllAircraftEntries,
    getAircraftOptions,
} from '../utils/aircraftUtils.js'
import { getAirportFull } from '../utils/airportUtils.js'
import airlines from '../data/airlines.json' with { type: 'json' }

// Get airline information by ID or name
export const getAirline = async (req, res) => {
    try {
        const { id, name } = req.query

        if (!id && !name) {
            return res.status(400).json({
                error: 'Airline ID or name is required',
                message:
                    'Please provide an airline ID or name in the query parameters',
            })
        }

        let airlineInfo
        if (id) {
            airlineInfo = getAirlineInfo(id)
        } else if (name) {
            // Find airline by name
            const foundAirline = airlines.find((airline) =>
                airline.name.toLowerCase().includes(name.toLowerCase())
            )
            airlineInfo = foundAirline || { name, logo: null }
        }

        res.json({
            success: true,
            data: airlineInfo,
        })
    } catch (error) {
        console.error('Error fetching airline info:', error)
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch airline information',
        })
    }
}

// Get aircraft information by code
export const getAircraft = async (req, res) => {
    try {
        const { code } = req.query

        if (!code) {
            return res.status(400).json({
                error: 'Aircraft code is required',
                message:
                    'Please provide an aircraft code in the query parameters',
            })
        }

        const aircraftName = getAircraftName(code)

        res.json({
            success: true,
            data: {
                code,
                name: aircraftName,
            },
        })
    } catch (error) {
        console.error('Error fetching aircraft info:', error)
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch aircraft information',
        })
    }
}

// Get all aircraft entries
export const getAllAircraft = async (req, res) => {
    try {
        const aircraftEntries = getAllAircraftEntries()

        res.json({
            success: true,
            data: aircraftEntries,
        })
    } catch (error) {
        console.error('Error fetching all aircraft:', error)
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch aircraft list',
        })
    }
}

// Get aircraft options for dropdowns
export const getAircraftOptionsEndpoint = async (req, res) => {
    try {
        const aircraftOptions = getAircraftOptions()

        res.json({
            success: true,
            data: aircraftOptions,
        })
    } catch (error) {
        console.error('Error fetching aircraft options:', error)
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch aircraft options',
        })
    }
}

// Get all airlines
export const getAllAirlines = async (req, res) => {
    try {
        res.json({
            success: true,
            data: airlines,
        })
    } catch (error) {
        console.error('Error fetching all airlines:', error)
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch airlines list',
        })
    }
}

// Get airport information by IATA code
export const getAirport = async (req, res) => {
    try {
        const { iata } = req.params

        if (!iata) {
            return res.status(400).json({
                error: 'IATA code is required',
                message: 'Please provide an IATA code in the URL parameters',
            })
        }

        const airportInfo = getAirportFull(iata)

        res.json({
            success: true,
            data: airportInfo,
        })
    } catch (error) {
        console.error('Error fetching airport info:', error)
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch airport information',
        })
    }
}
