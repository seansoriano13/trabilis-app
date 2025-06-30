import axios from 'axios'
import flightsData from '../mock/flightsData.js'

export const searchFlights = async (req, res) => {
    const { from, to, date } = req.query
    
    if (!from || !to || !date) {
        return res.status(400).json({
            error: 'Missing required query parameters: from, to, date',
        })
    }

    try {
        const filteredFlights = flightsData.data.filter(flight => 
            flight.departure.iata === from &&
            flight.arrival.iata === to && 
            flight.flight_date === date
        )
        console.log('Filtered flights: ', filteredFlights)
        res.status(200).json({ flights: filteredFlights})
    } catch (error) {
        console.error('Error using mock flights: ', error.message)
        res.status(500).json({error: 'Failed to fetch flight data (mock)'})
    }

    // FOR LIVE API 
    // try {
    //     const apiKey = process.env.AVIATIONSTACK_API_KEY

    //     const response = await axios.get('http://api.aviationstack.com/v1/flights', {
    //         params: {
    //             access_key: apiKey,
    //             dep_iata: from,
    //             arr_iata: to,
    //             flight_date: date,
    //         },
    //     })

    //     const flights = response.data.data

    //     res.status(200).json({ flights })
    // } catch (error) {
    //     console.error('Error fetching flights: ', error.message)
    //     res.status(500).json({ error: 'Failed to fetch flight data' })
    // }
}

