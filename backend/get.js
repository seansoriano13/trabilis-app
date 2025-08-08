import { amadeus } from './src/config/amadeus.js'
amadeus.booking
    .flightOrder('eJzTd9e38I30CXQBAAswAmU%3D')
    .get()
    .then((response) => console.log(JSON.stringify(response.data, null, 2)))
    .catch((err) => console.error(err.response?.data || err))
