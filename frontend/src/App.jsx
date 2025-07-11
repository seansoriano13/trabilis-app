import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ClientLayout from './layouts/ClientLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/client/Home'
import Destinations from './pages/client/Destinations'
import ImmigrationVisaConsultancy from './pages/client/ImmigrationVisaConsultancy'
import Flights from './pages/client/Flights'
import AboutUs from './pages/client/AboutUs'
import ContactUs from './pages/client/ContactUs'
import Dashboard from './pages/admin/Dashboard'
import Users from './pages/admin/Users'
import NotFound from './pages/NotFound'
import { AirportProvider } from './context/AirportContext'
import FlightSearchResults from './pages/client/FlightSearchResults'

function App() {
    return (
        <Router>
            <Routes>
                {/* CLient Routes */}
                <Route
                    path='/'
                    element={<ClientLayout />}
                >
                    <Route
                        index
                        element={<Home />}
                    />
                    <Route
                        path='destinations'
                        element={<Destinations />}
                    />
                    <Route
                        path='immigration-visa-consultancy'
                        element={<ImmigrationVisaConsultancy />}
                    />
                    <Route
                        path='flights'
                        element={
                            <AirportProvider>
                                <Flights />
                            </AirportProvider>
                        }
                    />
                    <Route
                        path='flights/search-result'
                        element={<FlightSearchResults />}
                    />
                    <Route
                        path='about-us'
                        element={<AboutUs />}
                    />
                    <Route
                        path='contact-us'
                        element={<ContactUs />}
                    />
                </Route>

                {/* Admin Routes */}
                <Route
                    path='/admin'
                    element={<AdminLayout />}
                >
                    <Route
                        index
                        element={<Dashboard />}
                    />
                    <Route
                        path='users'
                        element={<Users />}
                    />
                </Route>

                {/* 404 */}
                <Route
                    path='*'
                    element={<NotFound />}
                />
            </Routes>
        </Router>
    )
}

export default App
