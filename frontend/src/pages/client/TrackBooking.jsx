import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './TrackBooking.css'
import '../admin/Dashboard.css'
import PrimaryButton from '../../components/client/PrimaryButton'
import greatPyramidOfGazaDesktop from '/images/great-pyramid.jpg'
import greatPyramidOfGazaMobile from '../../assets/great-pyramid-of-giza-mobile.jpg'
import { GiAirplaneDeparture } from 'react-icons/gi'
import {
  MdCancel,
  MdFlight,
  MdHelp,
  MdEmail,
  MdWarning,
  MdCheckCircle,
  MdSearch,
} from 'react-icons/md'
import { FaMoneyBillWave, FaPhone, FaClipboardList } from 'react-icons/fa'
import axios from 'axios'
import { useAirports } from '../../context/AirportContext.jsx'
import { formatMobileNumber } from '../../utils/mobileNumberUtils'
import { getAirlineInfo, getAirportInfo } from '../../utils/metadataApi.js'
import { getCountryNameByCodeIgnoreCase } from '../../utils/countryOptionsLoader.js'

// Component to handle async airline info loading
function AirlineInfo({ airlineCode }) {
  const [airlineInfo, setAirlineInfo] = useState({
    name: 'Loading...',
    logo: null,
  })

  useEffect(() => {
    if (airlineCode) {
      getAirlineInfo(airlineCode).then(setAirlineInfo)
    }
  }, [airlineCode])

  return (
    <div className='text-gray-600 flex gap-1 items-center'>
      <div>This flight is operated by</div>
      <div className='flex items-center'>
        {airlineInfo.name}
        {airlineInfo.logo && (
          <img
            className='h-8'
            src={airlineInfo.logo}
            alt={airlineInfo.name}
          />
        )}
      </div>
    </div>
  )
}

// Component to handle async airport info loading
function AirportInfo({ iata, children }) {
  const [airportInfo, setAirportInfo] = useState({
    iata: iata,
    name: 'Loading...',
    city: 'Loading...',
    country: 'Loading...',
  })

  useEffect(() => {
    if (iata) {
      getAirportInfo(iata).then((info) => {
        // Convert country code to full country name
        const fullCountryName = getCountryNameByCodeIgnoreCase(info.country)
        setAirportInfo({
          ...info,
          country: fullCountryName,
        })
      })
    }
  }, [iata])

  return children(airportInfo)
}

function TrackBooking() {
  const [isLoading, setIsLoading] = useState()
  const [bookingRef, setBookingRef] = useState('')
  const [bookingType, setBookingType] = useState('flight')
  const [result, setResult] = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(false)

  // Cancellation states
  const [cancellationLoading, setCancellationLoading] = useState(false)
  const [cancellationEmail, setCancellationEmail] = useState('')
  const [cancellationReason, setCancellationReason] = useState('')
  const [showCancellationForm, setShowCancellationForm] = useState(false)
  const [cancellationMessage, setCancellationMessage] = useState('')
  const [cancellationError, setCancellationError] = useState('')

  const { airports } = useAirports()
  const location = useLocation()

  console.log(result)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setCancellationError('') // Clear any previous cancellation errors
    setCancellationMessage('') // Clear any previous cancellation messages
    try {
      if (bookingType === 'visa') {
        const res = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/visa/inquiries/track?inquiryReference=${bookingRef}`
        )
        setResult({ type: 'visa', inquiry: res.data })
      } else {
        const res = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/bookings/track-booking?bookingReference=${bookingRef}&bookingType=${bookingType}`
        )
        setResult({ type: 'booking', ...res.data })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVisaPayment = async () => {
    setPaymentLoading(true)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/visa/inquiries/${result.inquiry.inquiry_reference}/create-checkout`,
        { payment_amount: result.inquiry.payment_amount || 5000 } // Default or from inquiry
      )

      if (response.data.success) {
        // Redirect to Stripe checkout
        window.location.href = response.data.checkout_url
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to initiate payment. Please try again.')
    } finally {
      setPaymentLoading(false)
    }
  }

  // Cancellation functions
  const handleRequestCancellation = async () => {
    if (!cancellationEmail.trim()) {
      setCancellationError('Please enter your email address')
      return
    }

    setCancellationLoading(true)
    setCancellationError('') // Clear previous errors

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/cancel-booking/request`,
        {
          booking_reference: result.bookingReference,
          email: cancellationEmail.trim(),
          reason: cancellationReason.trim() || null,
        }
      )

      if (response.data.success) {
        setCancellationMessage(response.data.message)
        setShowCancellationForm(false)
        // Clear form
        setCancellationEmail('')
        setCancellationReason('')
      }
    } catch (error) {
      console.error('Cancellation request error:', error)
      const errorMessage =
        error.response?.data?.error ||
        'Failed to request cancellation. Please try again.'
      setCancellationError(errorMessage)
    } finally {
      setCancellationLoading(false)
    }
  }

  const canCancelBooking = (booking) => {
    if (!booking) return false

    // ALWAYS use database booking status from result.bookingStatus
    // Never use Amadeus flight status for cancellation eligibility
    const status = result.bookingStatus

    if (!status) {
      console.warn('No booking status available for cancellation check')
      return false
    }

    const cancellableStatuses = [
      'PENDING_PAYMENT',
      'PAID_PENDING_BOOKING',
      'BOOKED',
    ]
    return cancellableStatuses.includes(status)
  }

  // Check if flight has departed
  const hasFlightDeparted = (booking) => {
    if (
      !booking?.amadeus_flight_offer?.itineraries?.[0]?.segments?.[0]?.departure
        ?.at
    ) {
      return false
    }

    const departureTime = new Date(
      booking.amadeus_flight_offer.itineraries[0].segments[0].departure.at
    )
    const now = new Date()
    return departureTime < now
  }

  // Get refund policy message based on booking status
  const getRefundPolicyMessage = (bookingStatus) => {
    switch (bookingStatus) {
      case 'PENDING_PAYMENT':
        return 'No refund applicable (payment not processed)'
      case 'PAID_PENDING_BOOKING':
        return 'You may be eligible for a full refund. Please contact customer service.'
      case 'BOOKED':
        return 'This booking is non-refundable as it was confirmed with the airline.'
      default:
        return 'Please contact customer service for refund information.'
    }
  }

  // Get user-friendly error message
  const getCancellationErrorMessage = (error) => {
    if (error.includes('Flight has already departed')) {
      return {
        type: 'departed',
        title: 'Flight Has Already Departed',
        message:
          'Unfortunately, this flight has already departed and cannot be cancelled. Please contact our customer service for assistance.',
        icon: <MdFlight className='text-lg' />,
        color: 'blue',
      }
    } else if (error.includes('Email address does not match')) {
      return {
        type: 'email',
        title: 'Email Address Mismatch',
        message:
          'The email address you entered does not match the one used for this booking. Please check and try again.',
        icon: <MdEmail className='text-lg' />,
        color: 'orange',
      }
    } else if (error.includes('not found')) {
      return {
        type: 'not_found',
        title: 'Booking Not Found',
        message:
          'We could not find a booking with this reference number. Please check your booking reference and try again.',
        icon: <MdSearch className='text-lg' />,
        color: 'red',
      }
    } else {
      return {
        type: 'general',
        title: 'Cancellation Error',
        message: error,
        icon: <MdWarning className='text-lg' />,
        color: 'red',
      }
    }
  }

  // Note: Removed localStorage persistence to prevent showing stale booking data

  // Auto-search when coming from success page
  useEffect(() => {
    if (location.state?.autoSearch && location.state?.bookingRef) {
      // Clear any existing results when auto-searching
      setResult(null)

      setBookingRef(location.state.bookingRef)
      setBookingType(location.state.bookingType || 'flight')

      // Trigger search automatically
      const autoSearch = async () => {
        setIsLoading(true)
        try {
          const type = location.state.bookingType || 'flight'
          const ref = location.state.bookingRef

          if (type === 'visa') {
            const res = await axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/api/v1/visa/inquiries/track?inquiryReference=${ref}`
            )
            setResult({ type: 'visa', inquiry: res.data })
          } else {
            const res = await axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/api/v1/bookings/track-booking?bookingReference=${ref}&bookingType=${type}`
            )
            setResult({ type: 'booking', ...res.data })
          }
        } catch (err) {
          console.error('Auto-search failed:', err)
        } finally {
          setIsLoading(false)
        }
      }

      autoSearch()
    }
  }, [location.state])

  return (
    <>
      <section className='track-booking'>
        <picture>
          {/* Desktop */}
          <source
            srcSet={greatPyramidOfGazaDesktop}
            media='(min-width: 1024px)' // Tailwind's lg breakpoint
          />

          {/* Mobile fallback */}
          <img
            className='destinations__hero-mobile'
            src={greatPyramidOfGazaMobile}
            alt='great-pyramid-of-giza'
          />
        </picture>
        <div className='p-14 h-1/3 max-w-[1200px] mx-auto'>
          <div className='text-6xl font-bold text-white'>
            Track Your Booking
          </div>
          <div className='text-white mt-3 text-lg'>
            Lindela offers convenient way to track flights and tour package.
          </div>
        </div>
        <div className='bg-white p-8'>
          <div className='max-w-[1200px] mx-auto font-bold text-3xl text-[#333] '>
            Stay updated on your bookings
          </div>
          <form
            onSubmit={handleSubmit}
            className='max-w-[1200px] mx-auto shadow-xl rounded-2xl border border-gray-100 p-6 sm:p-8 mt-8 bg-gradient-to-br from-white to-gray-50 hover:shadow-2xl transition-all duration-300'
          >
            {/* Radio Button Options */}
            <div className='mb-6'>
              <div className='flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start'>
                <label className='flex items-center cursor-pointer group radio-option'>
                  <input
                    type='radio'
                    name='value-radio'
                    value='flight'
                    checked={bookingType === 'flight'}
                    onChange={(e) => setBookingType(e.target.value)}
                    className='sr-only'
                  />
                  <div
                    className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl border-2 transition-all duration-300 group-hover:shadow-lg ${
                      bookingType === 'flight'
                        ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-500 text-gray-900 shadow-lg'
                        : 'bg-gradient-to-r from-white to-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 radio-dot relative ${
                        bookingType === 'flight'
                          ? 'border-yellow-500 bg-yellow-500'
                          : 'border-gray-300 group-hover:border-gray-400'
                      }`}
                    >
                      {bookingType === 'flight' && (
                        <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white'></div>
                      )}
                    </div>
                    <i className='bi-airplane text-sm sm:text-lg'></i>
                    <span className='font-medium text-sm sm:text-base'>
                      Flight
                    </span>
                  </div>
                </label>

                <label className='flex items-center cursor-pointer group radio-option'>
                  <input
                    type='radio'
                    name='value-radio'
                    value='tour'
                    checked={bookingType === 'tour'}
                    onChange={(e) => setBookingType(e.target.value)}
                    className='sr-only'
                  />
                  <div
                    className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl border-2 transition-all duration-300 group-hover:shadow-lg ${
                      bookingType === 'tour'
                        ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-500 text-amber-700 shadow-lg'
                        : 'bg-gradient-to-r from-white to-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 radio-dot relative ${
                        bookingType === 'tour'
                          ? 'border-amber-500 bg-amber-500'
                          : 'border-gray-300 group-hover:border-gray-400'
                      }`}
                    >
                      {bookingType === 'tour' && (
                        <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white'></div>
                      )}
                    </div>
                    <i className='bi-compass text-sm sm:text-lg'></i>
                    <span className='font-medium text-sm sm:text-base'>
                      Tour Package
                    </span>
                  </div>
                </label>

                <label className='flex items-center cursor-pointer group radio-option'>
                  <input
                    type='radio'
                    name='value-radio'
                    value='visa'
                    checked={bookingType === 'visa'}
                    onChange={(e) => setBookingType(e.target.value)}
                    className='sr-only'
                  />
                  <div
                    className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl border-2 transition-all duration-300 group-hover:shadow-lg ${
                      bookingType === 'visa'
                        ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-500 text-green-700 shadow-lg'
                        : 'bg-gradient-to-r from-white to-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 radio-dot relative ${
                        bookingType === 'visa'
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300 group-hover:border-gray-400'
                      }`}
                    >
                      {bookingType === 'visa' && (
                        <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white'></div>
                      )}
                    </div>
                    <i className='bi-passport text-sm sm:text-lg'></i>
                    <span className='font-medium text-sm sm:text-base'>
                      Visa Inquiry
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Search Input and Button */}
            <div className='flex flex-col sm:flex-row gap-4 items-stretch sm:items-center'>
              <div className='flex-1'>
                <div className='relative'>
                  <input
                    type='text'
                    className='w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 track-input bg-gradient-to-r from-white to-gray-50 hover:shadow-md focus:shadow-lg text-sm sm:text-base'
                    placeholder='Enter your booking reference'
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value)}
                  />
                  <i className='bi-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'></i>
                </div>
              </div>

              <div className='flex items-center justify-center sm:justify-end'>
                <button
                  type='submit'
                  disabled={isLoading}
                  className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed btn-loading'
                      : 'bg-black hover:bg-gray-800'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <i className='bi-arrow-clockwise animate-spin'></i>
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <i className='bi-search'></i>
                      <span>Track Booking</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Format notice at bottom */}
            <div className='mt-6 pt-4 border-t border-gray-200'>
              <div className='text-xs text-gray-500 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl'>
                <i className='bi-info-circle text-yellow-500'></i>
                <span>
                  Format: TRB-FLT (Flight) / TRB-TOUR (Tour) / TRB-VISA (Visa)
                </span>
              </div>
            </div>
          </form>
          {result?.type === 'booking' &&
            bookingType === 'flight' &&
            result?.bookingData?.outbound && (
              <div className='flight-card max-w-[1200px] mx-auto shadow-xl rounded-2xl border border-gray-100 p-4 sm:p-2 mt-8 bg-gradient-to-br from-white to-gray-50 hover:shadow-2xl transition-all duration-300'>
                {/* Booking Status Badge */}
                <div className='flight-card__ref'>
                  <div className='flight-card__title'>
                    <span>Booking Reference: </span>
                    <span className='flights__status flight-card__booking-ref-value'>
                      {result.bookingReference}
                    </span>
                  </div>
                  <div className='flight-card__sta'>
                    <span
                      className={`flight-card__status flight-card__status--${result.bookingStatus?.toLowerCase().replace('_', '-')}`}
                    >
                      {result.bookingStatus}
                    </span>
                  </div>
                </div>

                {/* Cancellation Notice */}
                {result.bookingStatus === 'CANCELLED' && (
                  <div className='flight-card__cancellation-notice'>
                    <div className='flight-card__cancellation-content'>
                      <div className='flight-card__cancellation-icon'>
                        <MdCancel />
                      </div>
                      <div className='flight-card__cancellation-text'>
                        <h3 className='flight-card__cancellation-title'>
                          Booking Cancelled
                        </h3>
                        <p className='flight-card__cancellation-message'>
                          This flight booking has been cancelled. No refund will
                          be issued as per our non-refundable policy.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Flight Layout */}
                <div className='flight-card__layout'>
                  {/* Left Side: Scheduled Flight Details */}
                  <div className='flight-card__scheduled-section'>
                    {/* Route Header */}
                    <div className='flight-card__route-header'>
                      <AirportInfo
                        iata={result.bookingData.outbound.departure.iata}
                      >
                        {(departureInfo) => departureInfo.city}
                      </AirportInfo>{' '}
                      to{' '}
                      <AirportInfo
                        iata={result.bookingData.outbound.arrival.iata}
                      >
                        {(arrivalInfo) => arrivalInfo.city}
                      </AirportInfo>
                    </div>

                    {/* Flight Details */}
                    <div className='flight-card__flight-details'>
                      {/* Dates */}
                      <div className='flight-card__dates'>
                        <div className='flight-card__date'>
                          {result.bookingData.outbound.departure.date}
                        </div>
                        <div className='flight-card__date'>
                          {result.bookingData.outbound.arrival.date}
                        </div>
                      </div>

                      {/* Times with connector */}
                      <div className='flight-card__times'>
                        <div className='flight-card__time'>
                          {result.bookingData.outbound.departure.time}
                        </div>
                        <div className='flight-card__connector'>
                          <span className='flight-card__connector-icon'>
                            <GiAirplaneDeparture />
                          </span>
                          <div className='flight-card__connector-dot'></div>
                          <div className='flight-card__connector-line'></div>
                          <div className='flight-card__connector-dot'></div>
                        </div>
                        <div className='flight-card__time'>
                          {result.bookingData.outbound.arrival.time}
                        </div>
                      </div>

                      {/* Airports */}
                      <div className='flight-card__airports'>
                        <div className='flight-card__airport'>
                          <AirportInfo
                            iata={result.bookingData.outbound.departure.iata}
                          >
                            {(departureInfo) =>
                              `${departureInfo.iata} - ${departureInfo.name}${
                                result.bookingData.outbound.departure.terminal
                                  ? ` Terminal ${result.bookingData.outbound.departure.terminal}`
                                  : ''
                              }, ${departureInfo.country}`
                            }
                          </AirportInfo>
                        </div>
                        <div className='flight-card__airport flight-card__airport--right'>
                          <AirportInfo
                            iata={result.bookingData.outbound.arrival.iata}
                          >
                            {(arrivalInfo) =>
                              `${arrivalInfo.iata} - ${arrivalInfo.name} Terminal ${result.bookingData.outbound.arrival.terminal}, ${arrivalInfo.country}`
                            }
                          </AirportInfo>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className='flight-card__divider'></div>

                  {/* Right Side: Actual Flight Status */}
                  <div className='flight-card__actual-section'>
                    <div className='flight-card__status-section'>
                      {/* Actual Labels */}
                      <div className='flight-card__actual-labels'>
                        <div className='flight-card__actual-label'>Actual</div>
                        <div className='flight-card__actual-label'>Actual</div>
                      </div>

                      {/* Actual Dates */}
                      <div className='flight-card__dates'>
                        <div className='flight-card__date'>
                          {result.bookingData.outbound.departure.date}
                        </div>
                        <div className='flight-card__date'>
                          {result.bookingData.outbound.arrival.date}
                        </div>
                      </div>

                      {/* Actual Times with connector */}
                      <div className='flight-card__times'>
                        <div className='flight-card__time'>
                          {result.bookingData.outbound.departure.time}
                        </div>
                        <div className='flight-card__connector'>
                          <span className='flight-card__connector-icon'>
                            <GiAirplaneDeparture />
                          </span>
                          <span className='flight-card__connector-dot'></span>
                          <span className='flight-card__connector-line'></span>
                          <span className='flight-card__connector-dot'></span>
                        </div>
                        <div className='flight-card__time'>
                          {result.bookingData.outbound.arrival.time}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className='flight-card__status-badges'>
                        <span
                          className={`flight-card__status-badge flight-card__status-badge--${(result.bookingData.outbound.departure.status || 'Scheduled').toLowerCase()}`}
                        >
                          {result.bookingData.outbound.departure.status ||
                            'Scheduled'}
                        </span>
                        <span
                          className={`flight-card__status-badge flight-card__status-badge--${(result.bookingData.outbound.arrival.status || 'Scheduled').toLowerCase()}`}
                        >
                          {result.bookingData.outbound.arrival.status ||
                            'Scheduled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='ml-4'>
                  <AirlineInfo airlineCode={result.airlineCode} />
                </div>
                <div className='flight-card__bottom-section'>
                  {/* Amadeus Data Unavailable Notice */}
                  {result.bookingData?.source === 'database' && (
                    <div className='flight-card__data-notice'>
                      <div className='flight-card__data-notice-content'>
                        <div className='flight-card__data-notice-icon'>
                          <MdWarning />
                        </div>
                        <span className='flight-card__data-notice-text'>
                          Live flight status currently unavailable. Showing
                          scheduled information.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Flight Departed Warning */}
                  {hasFlightDeparted(result.bookingData) && (
                    <div className='flight-card__departed-warning'>
                      <div className='flight-card__departed-content'>
                        <div className='flight-card__departed-icon'>
                          <MdFlight />
                        </div>
                        <div className='flight-card__departed-text'>
                          <h3 className='flight-card__departed-title'>
                            Flight Has Already Departed
                          </h3>
                          <p className='flight-card__departed-message'>
                            This flight departed on{' '}
                            <span className='flight-card__departed-time'>
                              {result.bookingData?.amadeus_flight_offer
                                ?.itineraries?.[0]?.segments?.[0]?.departure?.at
                                ? new Date(
                                    result.bookingData.amadeus_flight_offer.itineraries[0].segments[0].departure.at
                                  ).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'the scheduled departure time'}
                            </span>{' '}
                            and cannot be cancelled online.
                          </p>
                        </div>
                      </div>

                      {/* Refund Policy Section */}
                      <div className='flight-card__refund-policy'>
                        <h4 className='flight-card__refund-policy-title'>
                          <div className='flight-card__refund-policy-icon'>
                            <FaMoneyBillWave />
                          </div>
                          Refund Policy
                        </h4>
                        <p className='flight-card__refund-policy-text'>
                          {getRefundPolicyMessage(result.bookingStatus)}
                        </p>
                      </div>

                      {/* Contact Information */}
                      <div className='flight-card__contact-info'>
                        <h4 className='flight-card__contact-title'>
                          <div className='flight-card__contact-icon'>
                            <MdHelp />
                          </div>
                          Need Assistance?
                        </h4>
                        <p className='flight-card__contact-message'>
                          For any questions about your booking or to discuss
                          refund options, please contact our customer service
                          team.
                        </p>
                        <div className='flight-card__contact-links'>
                          <a
                            href='tel:+1234567890'
                            className='flight-card__contact-link'
                          >
                            <div className='flight-card__contact-link-icon'>
                              <FaPhone />
                            </div>
                            +1 (234) 567-890
                          </a>
                          <a
                            href='mailto:support@trabilis.com'
                            className='flight-card__contact-link'
                          >
                            <div className='flight-card__contact-link-icon'>
                              <MdEmail />
                            </div>
                            support@trabilis.com
                          </a>
                        </div>
                        <p className='flight-card__contact-availability'>
                          Available 24/7 for your convenience
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Cancellation Section - Simple Button */}
                  {canCancelBooking(result.bookingData) &&
                    result.bookingStatus !== 'CANCELLED' &&
                    !hasFlightDeparted(result.bookingData) && (
                      <div className='flight-card__cancellation-section'>
                        <button
                          onClick={() => setShowCancellationForm(true)}
                          className='flight-card__cancel-button'
                        >
                          <div className='flight-card__cancel-button-icon'>
                            <MdCancel />
                          </div>
                          Cancel Booking
                        </button>
                      </div>
                    )}
                </div>
                {/* Footer */}
                <div className='flight-card__footer'>
                  <div className='flight-card__footer-right'>
                    {result.bookingData?.source && (
                      <div className='flight-card__data-source'>
                        <i
                          className={`flight-card__data-source-icon bi-${result.bookingData.source === 'live' ? 'broadcast' : 'database'}`}
                        ></i>
                        <span className='flight-card__data-source-text'>
                          {result.bookingData.source === 'live'
                            ? 'Real-time data'
                            : 'Cached data'}
                        </span>
                        {result.bookingData.lastUpdated && (
                          <span className='flight-card__data-source-updated'>
                            Updated:{' '}
                            {new Date(
                              result.bookingData.lastUpdated
                            ).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          {result?.type === 'booking' &&
            bookingType === 'tour' &&
            result?.bookingData?.tour && (
              <div className='max-w-[1200px] mx-auto shadow-xl rounded-2xl border border-gray-100 p-8 bg-gradient-to-br from-white to-gray-50 mt-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='text-lg font-semibold text-gray-800'>
                    Tour Booking Details
                  </div>
                  <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200'>
                    {result.bookingData.tour.status}
                  </span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mb-6'>
                  <div>
                    <div className='text-gray-500'>Reference</div>
                    <div className='font-medium'>
                      <span className='font-mono text-[13px] px-2 py-1 rounded-md bg-gray-50 border border-gray-200'>
                        {result.bookingData.tour.booking_reference ||
                          result.bookingReference}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className='text-gray-500'>Status</div>
                    <div className='font-medium'>
                      {result.bookingData.tour.status}
                    </div>
                  </div>
                  <div>
                    <div className='text-gray-500'>Title</div>
                    <div className='font-medium'>
                      {result.bookingData.tour.title}
                    </div>
                  </div>
                  <div>
                    <div className='text-gray-500'>Travel Dates</div>
                    <div className='font-medium'>
                      {result.bookingData.tour.start_date} -{' '}
                      {result.bookingData.tour.end_date}
                    </div>
                  </div>
                  <div>
                    <div className='text-gray-500'>Passengers</div>
                    <div className='font-medium'>
                      {result.bookingData.tour.passenger_count}
                    </div>
                  </div>
                  <div>
                    <div className='text-gray-500'>Payment Type</div>
                    <div>
                      <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200'>
                        {result.bookingData.tour.payment_type}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className='text-gray-500'>Total Amount</div>
                    <div className='font-semibold text-green-700 text-base'>
                      ₱{' '}
                      {Number(
                        result.bookingData.tour.total_amount || 0
                      ).toLocaleString()}
                    </div>
                  </div>
                  <div className='md:col-span-2'>
                    <div className='text-gray-500'>Lead Contact</div>
                    <div className='font-medium bg-gray-50 border border-gray-200 rounded-md p-3'>
                      {result.bookingData.tour.lead_first_name}{' '}
                      {result.bookingData.tour.lead_last_name} ·{' '}
                      {result.bookingData.tour.lead_email} ·{' '}
                      {result.bookingData.tour.lead_phone}
                    </div>
                  </div>
                </div>

                {/* Flight Details (if provided by admin) */}
                {(() => {
                  const fd = result.bookingData.tour.flight_details
                  if (!fd) return null
                  const outbound = Array.isArray(fd.outbound)
                    ? fd.outbound
                    : fd.outbound
                      ? [fd.outbound]
                      : []
                  const inbound = Array.isArray(fd.return)
                    ? fd.return
                    : fd.return
                      ? [fd.return]
                      : []
                  const renderSeg = (seg, idx) => (
                    <div
                      key={idx}
                      className='grid grid-cols-1 md:grid-cols-5 gap-2 py-2 border-b text-sm text-gray-700'
                    >
                      <div className='font-medium text-gray-800'>
                        {seg.airline || '-'}
                      </div>
                      <div className='text-gray-600'>
                        {seg.flight_no || '-'}
                      </div>
                      <div className='text-gray-600'>
                        {seg.departure || '-'}
                      </div>
                      <div className='text-gray-600'>{seg.arrival || '-'}</div>
                      <div className='text-gray-600'>
                        {seg.date ? new Date(seg.date).toLocaleString() : '-'}
                      </div>
                    </div>
                  )
                  return (
                    <div className='mt-6 rounded-md border border-gray-200 bg-gray-50 p-4'>
                      <div className='text-md font-semibold text-gray-800 mb-2'>
                        Flight Details
                      </div>
                      {outbound.length > 0 && (
                        <div className='mb-4'>
                          <div className='text-gray-600 font-medium mb-1'>
                            Outbound
                          </div>
                          <div className='text-[11px] uppercase tracking-wide text-gray-500 grid grid-cols-1 md:grid-cols-5 gap-2 pb-2 border-b'>
                            <div>Airline</div>
                            <div>Flight No.</div>
                            <div>Departure</div>
                            <div>Arrival</div>
                            <div>Date</div>
                          </div>
                          {outbound.map(renderSeg)}
                        </div>
                      )}
                      {inbound.length > 0 && (
                        <div>
                          <div className='text-gray-600 font-medium mb-1'>
                            Return
                          </div>
                          <div className='text-[11px] uppercase tracking-wide text-gray-500 grid grid-cols-1 md:grid-cols-5 gap-2 pb-2 border-b'>
                            <div>Airline</div>
                            <div>Flight No.</div>
                            <div>Departure</div>
                            <div>Arrival</div>
                            <div>Date</div>
                          </div>
                          {inbound.map(renderSeg)}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
          {result?.type === 'visa' && result?.inquiry && (
            <div className='max-w-[1200px] mx-auto shadow-xl rounded-2xl border border-gray-100 p-8 bg-gradient-to-br from-white to-gray-50 mt-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1'>
              <div className='text-lg font-semibold text-gray-800 mb-4'>
                Visa Inquiry Status
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700'>
                <div>
                  <div className='text-gray-500'>Reference</div>
                  <div className='font-medium'>
                    {result.inquiry.inquiry_reference}
                  </div>
                </div>
                <div>
                  <div className='text-gray-500'>Status</div>
                  <div className='font-medium'>{result.inquiry.status}</div>
                </div>
                <div>
                  <div className='text-gray-500'>Full Name</div>
                  <div className='font-medium'>{result.inquiry.full_name}</div>
                </div>
                <div>
                  <div className='text-gray-500'>Email</div>
                  <div className='font-medium'>
                    {result.inquiry.email_address}
                  </div>
                </div>
                <div>
                  <div className='text-gray-500'>Mobile</div>
                  <div className='font-medium'>
                    {formatMobileNumber(result.inquiry.mobile_number)}
                  </div>
                </div>
                <div>
                  <div className='text-gray-500'>Visa Type</div>
                  <div className='font-medium'>{result.inquiry.visa_type}</div>
                </div>
                <div>
                  <div className='text-gray-500'>Destination</div>
                  <div className='font-medium'>
                    {result.inquiry.destination}
                  </div>
                </div>
                <div>
                  <div className='text-gray-500'>Submitted</div>
                  <div className='font-medium'>
                    {new Date(result.inquiry.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              {result.inquiry.message && (
                <div className='mt-4'>
                  <div className='text-gray-500 text-sm mb-1'>Message</div>
                  <div className='text-gray-700 text-sm whitespace-pre-line'>
                    {result.inquiry.message}
                  </div>
                </div>
              )}

              {/* Payment Section */}
              {result.inquiry.conversion_status === 'AWAITING_PAYMENT' && (
                <div className='mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6'>
                  <div className='flex items-center gap-3 mb-4'>
                    <i className='bi-credit-card text-green-600 text-2xl'></i>
                    <h3 className='text-xl font-bold text-green-800'>
                      Ready for Payment
                    </h3>
                  </div>
                  <p className='text-gray-700 mb-4'>
                    Your inquiry has been reviewed and is ready for processing.
                    Please proceed with payment to start your visa application.
                  </p>
                  <button
                    onClick={handleVisaPayment}
                    disabled={paymentLoading}
                    className='w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {paymentLoading ? (
                      <>
                        <i className='bi-arrow-clockwise animate-spin mr-2'></i>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className='bi-credit-card mr-2'></i>
                        Pay Now - ₱{' '}
                        {result.inquiry.payment_amount?.toLocaleString() || '0'}
                      </>
                    )}
                  </button>
                </div>
              )}

              {result.inquiry.conversion_status === 'CONVERTED' && (
                <div className='mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-6'>
                  <div className='flex items-center gap-3 mb-3'>
                    <MdCheckCircle className='text-blue-600 text-2xl' />
                    <h3 className='text-xl font-bold text-blue-800'>
                      Processing Started!
                    </h3>
                  </div>
                  <p className='text-gray-700 mb-3'>
                    Your payment has been received and visa processing has
                    begun.
                  </p>
                  <p className='text-sm text-gray-600'>
                    <strong>Processing Reference:</strong> Check your email for
                    details
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Cancellation Modal - Outside of all containers */}
      {showCancellationForm &&
        result?.type === 'booking' &&
        result?.bookingData?.outbound && (
          <div className='modal-overlay'>
            <div className='modal-content'>
              {/* Modal Header */}
              <div className='modal-header'>
                <div className='flex items-center gap-3'>
                  <MdFlight className='text-2xl text-red-600' />
                  <div>
                    <h3 className='text-xl font-bold text-red-800'>
                      Cancel Booking
                    </h3>
                    <p className='text-sm text-red-600 mt-1'>
                      Flight scheduled for{' '}
                      {result.bookingData?.amadeus_flight_offer
                        ?.itineraries?.[0]?.segments?.[0]?.departure?.at
                        ? new Date(
                            result.bookingData.amadeus_flight_offer.itineraries[0].segments[0].departure.at
                          ).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'the scheduled date'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCancellationForm(false)
                    setCancellationError('')
                    setCancellationMessage('')
                  }}
                  className='modal-close'
                >
                  <MdCancel className='text-2xl' />
                </button>
              </div>

              {/* Modal Body */}
              <div className='edit-form'>
                {/* Non-refundable Warning */}
                <div className='p-4 bg-red-50 border border-red-200 rounded-lg mb-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <MdWarning className='text-red-600' />
                    <span className='font-semibold text-red-800'>
                      NON-REFUNDABLE
                    </span>
                  </div>
                  <p className='text-sm text-red-700'>
                    This booking is non-refundable as per our policy.
                  </p>
                </div>

                {/* Policy Information */}
                <div className='p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4'>
                  <h4 className='text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2'>
                    <FaClipboardList className='text-gray-600' />
                    Cancellation Policy
                  </h4>
                  <div className='space-y-2 text-sm text-gray-700'>
                    <p>• This booking can be cancelled online</p>
                    <p>
                      • <strong>No refund will be issued</strong> as per our
                      non-refundable policy
                    </p>
                    <p>
                      • Cancellation will be processed immediately upon
                      verification
                    </p>
                    <p>
                      • You will receive a confirmation email once cancelled
                    </p>
                  </div>
                </div>

                {/* Confirmation Question */}
                <div className='flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4'>
                  <MdWarning className='text-amber-600 text-lg' />
                  <p className='text-sm text-amber-800 font-medium'>
                    Are you sure you want to cancel this booking? This action
                    cannot be undone.
                  </p>
                </div>

                {/* Cancellation Form */}
                <div className='space-y-4'>
                  <div className='form-group'>
                    <label className='form-group label'>Email Address *</label>
                    <input
                      type='email'
                      value={cancellationEmail}
                      onChange={(e) => setCancellationEmail(e.target.value)}
                      placeholder='Enter the email used for this booking'
                      className='form-input'
                      required
                    />
                  </div>

                  <div className='form-group'>
                    <label className='form-group label'>
                      Reason for Cancellation (Optional)
                    </label>
                    <textarea
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder='Please tell us why you need to cancel...'
                      rows={3}
                      className='form-input'
                    />
                  </div>
                </div>

                {/* Success/Error Messages */}
                {cancellationMessage && (
                  <div className='p-4 bg-green-50 border border-green-200 rounded-lg mb-4'>
                    <div className='flex items-center gap-2'>
                      <MdCheckCircle className='text-green-600 text-lg' />
                      <p className='text-sm text-green-800 font-medium'>
                        {cancellationMessage}
                      </p>
                    </div>
                  </div>
                )}

                {cancellationError && (
                  <div className='p-4 bg-red-50 border border-red-200 rounded-lg mb-4'>
                    {(() => {
                      const errorInfo =
                        getCancellationErrorMessage(cancellationError)
                      return (
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <div className='text-lg'>{errorInfo.icon}</div>
                            <h4
                              className={`text-sm font-semibold text-${errorInfo.color}-800`}
                            >
                              {errorInfo.title}
                            </h4>
                          </div>
                          <p className={`text-sm text-${errorInfo.color}-700`}>
                            {errorInfo.message}
                          </p>
                          {errorInfo.type === 'departed' && (
                            <div className='mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md'>
                              <p className='text-xs text-blue-700'>
                                <strong>Need help?</strong> Contact our customer
                                service at{' '}
                                <a
                                  href='tel:+1234567890'
                                  className='underline hover:no-underline'
                                >
                                  +1 (234) 567-890
                                </a>{' '}
                                or email{' '}
                                <a
                                  href='mailto:support@trabilis.com'
                                  className='underline hover:no-underline'
                                >
                                  support@trabilis.com
                                </a>
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* Modal Actions */}
                <div className='modal-actions'>
                  <button
                    onClick={() => {
                      setShowCancellationForm(false)
                      setCancellationError('')
                      setCancellationMessage('')
                    }}
                    className='btn btn-secondary'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestCancellation}
                    disabled={cancellationLoading}
                    className='btn btn-primary'
                  >
                    {cancellationLoading ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <MdEmail className='text-lg' />
                        Send Verification Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  )
}

export default TrackBooking
