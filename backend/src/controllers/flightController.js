import axios from 'axios'
import flightsData from '../mock/flightsData.js'

export const searchFlights = async (req, res) => {
	const { tripType, date, origin, destination } = req.body

	if (!tripType || !date || !origin || !destination) {
		return res.status(400).json({
			error: 'Missing required query parameters: from, to, date',
		})
	}

	const filterFlights = (date, origin, destination) =>
		flightsData.data.filter((flight) => {
			return (
				flight.flight_date === date &&
				flight.departure.iata === origin &&
				flight.arrival.iata === destination
			)
		})

	try {
		if (tripType.value === 'round-trip') {
			const outBoundFlights = filterFlights(
				date[0],
				origin.value,
				destination.value
			)
			const inBoundFlights = filterFlights(
				date[1],
				destination.value,
				origin.value
			)

			console.log('Rount-Trip (Outbound) flights:', outBoundFlights)
			console.log('Round-Trip (Inbound) flights:', inBoundFlights)
			return res.status(200).json({
				flights: {
					outbound: outBoundFlights,
					inbound: inBoundFlights,
				},
			})
		} else if (tripType.value === 'one-way') {
			const oneWayFlights = filterFlights(
				date,
				origin.value,
				destination.value
			)
			console.log('One Way flights:', oneWayFlights)
			return res.status(200).json({
				flights: {
					outbound: oneWayFlights,
				},
			})
		} else {
			console.log('Trip-type selection error')
		}
	} catch (error) {
		console.error('Error using mock flights: ', error.message)
		res.status(500).json({ error: 'Failed to fetch flight data (mock)' })
	}
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
