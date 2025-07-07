import axios from 'axios'
import flightsData from '../mock/flightsData.js'

export const searchFlights = async (req, res) => {
	const { tripType, date, origin, destination } = req.body

	if (!tripType || !date || !origin || !destination) {
		return res.status(400).json({
			error: 'Missing required query parameters: from, to, date',
		})
	}

	try {
		if (tripType.value === 'round-trip') {
		} else if (tripType.value === 'one-way') {
			const filteredFlights = flightsData.data.filter((flight) => {
				return (
					flight.flight_date === date &&
					flight.departure.iata === origin.value &&
					flight.arrival.iata === destination.value
				)
			})
			console.log('Filtered flights:', filteredFlights)
			return res.status(200).json({ flights: filteredFlights })
		} else {
			console.log('Trip-type selection error')
		}
	} catch (error) {
		console.error('Error using mock flights: ', error.message)
		res.status(500).json({ error: 'Failed to fetch flight data (mock)' })
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
