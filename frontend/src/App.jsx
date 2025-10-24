import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom'
import ClientLayout from './layouts/ClientLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/client/Home'
import Destinations from './pages/client/Destinations'
import ImmigrationVisaConsultancy from './pages/client/ImmigrationVisaConsultancy'
import Flights from './pages/client/Flights'
import AboutUs from './pages/client/AboutUs'
import ContactUs from './pages/client/ContactUs'
import Dashboard from './pages/admin/Dashboard'
import NotFound from './pages/NotFound'
import FlightSearchResults from './pages/client/FlightSearchResults'
import FlightBooking from './pages/client/FlightBooking'
import Modal from 'react-modal'
import PassengerDetails from './pages/client/PassengerDetails'
import FlightBookingSuccess from './pages/client/FlightBookingSuccess'
import FlightBookingCancel from './pages/client/FlightBookingCancel'
import AdminLogin from './pages/admin/Login'
import AdminProtectedLayout from './layouts/AdminLayout'
import TourPackages from './pages/admin/TourPackages'
import AdminFlights from './pages/admin/AdminFlights'
import TourPackageForm from './pages/admin/TourPackageForm'
import Tour from './pages/client/Tour'
import TourBookingSuccess from './pages/client/TourBookingSuccess'
import TourBookingCancel from './pages/client/TourBookingCancel'
import TourBooking from './pages/client/TourBooking'
import AdminTours from './pages/admin/AdminTour'
import AdminUsers from './pages/admin/AdminUsers'
import AdminVisa from './pages/admin/AdminVisa'
import TrackBooking from './pages/client/TrackBooking'
import CancelBooking from './pages/CancelBooking'
import VisaProcessingSuccess from './pages/client/VisaProcessingSuccess'
import FlightBookingDetail from './pages/admin/FlightBookingDetail'
import TourBookingDetail from './pages/admin/TourBookingDetail'
import VisaInquiryDetail from './pages/admin/VisaInquiryDetail'
import SalesReport from './pages/admin/SalesReport'
import Ratings from './pages/admin/Ratings'
import Settings from './pages/admin/Settings'
import VisaRequirements from './pages/admin/VisaRequirements'
import SubmitRating from './pages/client/SubmitRating'
import { AirportProvider } from './context/AirportContext'
import { AirlinesProvider } from './context/AirlinesContext'

Modal.setAppElement('#root')

function App() {
  function AdminProtectedRoute({ children }) {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      return (
        <Navigate
          to='/admin/login'
          replace
        />
      )
    }
    return children ? children : <Outlet />
  }
  return (
    <AirportProvider>
      <AirlinesProvider>
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
                path='track-booking'
                element={<TrackBooking />}
              />
              <Route
                path='cancel-booking'
                element={<CancelBooking />}
              />
              <Route
                path='visa-processing-success'
                element={<VisaProcessingSuccess />}
              />
              <Route
                path='destinations'
                element={<Destinations />}
              />
              <Route
                path='destinations/tour/:id'
                element={<Tour />}
              />
              <Route
                path='destinations/tour/:id/booking/'
                element={<TourBooking />}
              />
              <Route
                path='tour/booking/success'
                element={<TourBookingSuccess />}
              />
              <Route
                path='tour/booking/cancel'
                element={<TourBookingCancel />}
              />
              <Route
                path='immigration-visa-consultancy'
                element={<ImmigrationVisaConsultancy />}
              />
              <Route
                path='flights'
                element={<Flights />}
              />
              <Route
                path='flights/search-result'
                element={<FlightSearchResults />}
              />
              <Route
                path='flights/booking/:id'
                element={<FlightBooking />}
              />
              <Route
                path='flights/passenger-details/:id'
                element={<PassengerDetails />}
              />
              <Route
                path='flight-booking/success'
                element={<FlightBookingSuccess />}
              />
              <Route
                path='flight-booking/cancel'
                element={<FlightBookingCancel />}
              />
              <Route
                path='about-us'
                element={<AboutUs />}
              />
              <Route
                path='contact-us'
                element={<ContactUs />}
              />
              <Route
                path='submit-rating/:token'
                element={<SubmitRating />}
              />
            </Route>

            {/* Admin Routes */}
            <Route
              path='/admin/login'
              element={<AdminLogin />}
            />

            <Route
              path='/admin'
              element={<AdminProtectedRoute />}
            >
              <Route element={<AdminProtectedLayout />}>
                <Route
                  index
                  element={
                    <Navigate
                      to='/admin/dashboard'
                      replace
                    />
                  }
                />
                <Route
                  path='dashboard'
                  element={<Dashboard />}
                />
                <Route
                  path='tours'
                  element={<TourPackages />}
                />
                <Route
                  path='tours/create'
                  element={<TourPackageForm mode='create' />}
                />
                <Route
                  path='tours/:id'
                  element={<TourPackageForm mode='edit' />}
                />
                <Route
                  path='tour-sales'
                  element={<AdminTours />}
                />
                <Route
                  path='tour-sales/:id'
                  element={<TourBookingDetail />}
                />
                <Route
                  path='flights'
                  element={<AdminFlights />}
                />
                <Route
                  path='flights/:id'
                  element={<FlightBookingDetail />}
                />
                <Route
                  path='users'
                  element={<AdminUsers />}
                />
                <Route
                  path='visa-inquiries'
                  element={<AdminVisa />}
                />
                <Route
                  path='visa-inquiries/:id'
                  element={<VisaInquiryDetail />}
                />
                <Route
                  path='sales-report'
                  element={<SalesReport />}
                />
                <Route
                  path='ratings'
                  element={<Ratings />}
                />
                <Route
                  path='settings'
                  element={<Settings />}
                />
                <Route
                  path='visa-requirements'
                  element={<VisaRequirements />}
                />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AirlinesProvider>
    </AirportProvider>
  )
}

export default App
