export async function loadAirportOptions() {
  const airportsRes = await fetch('/airports.json')
  const airports = await airportsRes.json()

  return Object.values(airports)
    .filter(ap => ap.iata && ap.country)
    .map(ap => ({
      label: `${ap.city} – ${ap.name} (${ap.iata})`,
      value: ap.iata,
      country: ap.country,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/*
import { AirportProvider } from './context/AirportContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AirportProvider>
    <App />
  </AirportProvider>
)

import { useAirports } from '../context/AirportContext'
import Select from 'react-select'

export default function AirportSelect() {
  const { airportOptions, loading } = useAirports()

  if (loading) return <p>Loading airports...</p>

  return (
    <Select
      options={airportOptions}
      placeholder="Search airport..."
      isSearchable
    />
  )
}


*/