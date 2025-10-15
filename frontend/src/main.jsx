import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { SnackbarProvider } from './context/SnackbarContext.jsx'
import Snackbar from './components/Snackbar.jsx'

createRoot(document.getElementById('root')).render(
    <SnackbarProvider>
        <StrictMode>
            <App />
        </StrictMode>
        <Snackbar />
    </SnackbarProvider>
)
