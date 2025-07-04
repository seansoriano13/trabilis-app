import axios from 'axios'
import flightsData from '../mock/flightsData.js'

export const searchFlights = async (req, res) => {
	const { tripType, date, origin, destination } = req.body

      console.log('🔥 req.body:', req.body)
  console.log('🔥 req.query:', req.query)


	if (!tripType || !date || !origin || !destination) {
		return res.status(400).json({
			error: 'Missing required query parameters: from, to, date',
		})
	}

	try {
		if (tripType === 'round-trip') {
		} else if (tripType === 'one-way') {
			try {
				const filteredFlights = flightsData.filter((flight) => {
					return (
						flight.tripType === tripType &&
						flight.flight_date === date &&
						flight.origin === origin &&
						flight.destination === destination
					)
				})
				res.status(200).json({ filteredFlights })
			} catch (error) {
				res.status(500).send('Error Filtering flights')
			}
		} else {
			console.log('Trip-type selection error')
		}

		console.log('Filtered flights: ', filteredFlights)
		res.status(200).json({ flights: filteredFlights })
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
