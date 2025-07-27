import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AirportProvider } from './context/AirportContext.jsx'

createRoot(document.getElementById('root')).render(
    <AirportProvider>
        <StrictMode>
            <App />
        </StrictMode>
    </AirportProvider>
)
