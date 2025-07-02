// import { createContext, useContext, useEffect, useState } from 'react'
// import { loadAirportOptions } from '../utils/loadAirportOptions'

// const AirportContext = createContext()
// export const useAirports = () => useContext(AirportContext)

// export function AirportProvider({ children }) {
//   const [airportOptions, setAirportOptions] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     loadAirportOptions().then(data => {
//       setAirportOptions(data)
//       setLoading(false)
//     })
//   }, [])

//   return (
//     <AirportContext.Provider value={{ airportOptions, loading }}>
//       {children}
//     </AirportContext.Provider>
//   )
// }
