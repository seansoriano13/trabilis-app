import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './TrackBooking.css'
import PrimaryButton from '../../components/client/PrimaryButton'
import greatPyramidOfGazaDesktop from '/images/great-pyramid.jpg'
import greatPyramidOfGazaMobile from '../../assets/great-pyramid-of-giza-mobile.jpg'
import { GiAirplaneDeparture } from 'react-icons/gi'
import axios from 'axios'
import { getStatusStyle } from '../../utils/statusStyles.js'
import { useAirports } from '../../context/AirportContext.jsx'
import { getAirportInfoByIata } from '../../utils/getAirportInfoByIata.js'
import { formatMobileNumber } from '../../utils/mobileNumberUtils'
import { getAirlineInfo } from '../../utils/metadataApi.js'

// Component to handle async airline info loading
function AirlineInfo({ airlineCode }) {
    const [airlineInfo, setAirlineInfo] = useState({ name: 'Loading...', logo: null })

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

function TrackBooking() {
    const [isLoading, setIsLoading] = useState()
    const [bookingRef, setBookingRef] = useState('')
    const [bookingType, setBookingType] = useState('flight')
    const [result, setResult] = useState(null)
    const [paymentLoading, setPaymentLoading] = useState(false)

    const { airports } = useAirports()
    const location = useLocation()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
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

    // Load on mount
    useEffect(() => {
        const saved = localStorage.getItem('bookingResult')
        if (saved) {
            setResult(JSON.parse(saved))
        }
    }, [])

    // Save whenever result changes
    useEffect(() => {
        if (result) {
            localStorage.setItem('bookingResult', JSON.stringify(result))
        }
    }, [result])

    // Auto-search when coming from success page
    useEffect(() => {
        if (location.state?.autoSearch && location.state?.bookingRef) {
            // Clear any existing results and localStorage when auto-searching
            setResult(null)
            localStorage.removeItem('bookingResult')
            
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
                    Lindela offers convenient way to track flights and tour
                    package.
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
                                    onChange={(e) =>
                                        setBookingType(e.target.value)
                                    }
                                    className='sr-only'
                                />
                                <div className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl border-2 transition-all duration-300 group-hover:shadow-lg ${
                                    bookingType === 'flight'
                                        ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-500 text-gray-900 shadow-lg'
                                        : 'bg-gradient-to-r from-white to-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md'
                                }`}>
                                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 radio-dot relative ${
                                        bookingType === 'flight'
                                            ? 'border-yellow-500 bg-yellow-500'
                                            : 'border-gray-300 group-hover:border-gray-400'
                                    }`}>
                                        {bookingType === 'flight' && (
                                            <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white'></div>
                                        )}
                                    </div>
                                    <i className='bi-airplane text-sm sm:text-lg'></i>
                                    <span className='font-medium text-sm sm:text-base'>Flight</span>
                                </div>
                            </label>
                            
                            <label className='flex items-center cursor-pointer group radio-option'>
                                <input
                                    type='radio'
                                    name='value-radio'
                                    value='tour'
                                    checked={bookingType === 'tour'}
                                    onChange={(e) =>
                                        setBookingType(e.target.value)
                                    }
                                    className='sr-only'
                                />
                                <div className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl border-2 transition-all duration-300 group-hover:shadow-lg ${
                                    bookingType === 'tour'
                                        ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-500 text-amber-700 shadow-lg'
                                        : 'bg-gradient-to-r from-white to-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md'
                                }`}>
                                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 radio-dot relative ${
                                        bookingType === 'tour'
                                            ? 'border-amber-500 bg-amber-500'
                                            : 'border-gray-300 group-hover:border-gray-400'
                                    }`}>
                                        {bookingType === 'tour' && (
                                            <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white'></div>
                                        )}
                                    </div>
                                    <i className='bi-compass text-sm sm:text-lg'></i>
                                    <span className='font-medium text-sm sm:text-base'>Tour Package</span>
                                </div>
                            </label>
                            
                            <label className='flex items-center cursor-pointer group radio-option'>
                                <input
                                    type='radio'
                                    name='value-radio'
                                    value='visa'
                                    checked={bookingType === 'visa'}
                                    onChange={(e) =>
                                        setBookingType(e.target.value)
                                    }
                                    className='sr-only'
                                />
                                <div className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl border-2 transition-all duration-300 group-hover:shadow-lg ${
                                    bookingType === 'visa'
                                        ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-500 text-green-700 shadow-lg'
                                        : 'bg-gradient-to-r from-white to-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md'
                                }`}>
                                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 radio-dot relative ${
                                        bookingType === 'visa'
                                            ? 'border-green-500 bg-green-500'
                                            : 'border-gray-300 group-hover:border-gray-400'
                                    }`}>
                                        {bookingType === 'visa' && (
                                            <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white'></div>
                                        )}
                                    </div>
                                    <i className='bi-passport text-sm sm:text-lg'></i>
                                    <span className='font-medium text-sm sm:text-base'>Visa Inquiry</span>
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
                                    onChange={(e) =>
                                        setBookingRef(e.target.value)
                                    }
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
                            <span>Format: TRB-FLT (Flight) / TRB-TOUR (Tour) / TRB-VISA (Visa)</span>
                        </div>
                    </div>
                </form>
                {result?.type === 'booking' && bookingType === 'flight' && result?.bookingData?.outbound && (
                    <div className='max-w-[1200px] mx-auto flight-card shadow-xl rounded-2xl border border-gray-100 p-8 bg-gradient-to-br from-white to-gray-50 mt-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1'>
                        {/* Route */}
                        <div className='text-lg font-semibold text-gray-800 mb-4'>
                            {
                                getAirportInfoByIata(
                                    result.bookingData.outbound.departure.iata,
                                    airports
                                ).city
                            }{' '}
                            to{' '}
                            {
                                getAirportInfoByIata(
                                    result.bookingData.outbound.arrival.iata,
                                    airports
                                ).city
                            }
                        </div>

                        <div className='flex flex-col lg:flex-row justify-between gap-6'>
                            {/* Flight Details */}
                            <div className='flex-1'>
                                {/* Dates */}
                                <div className='flex justify-between text-gray-600 text-sm mb-2'>
                                    <div>
                                        {
                                            result.bookingData.outbound
                                                .departure.date
                                        }
                                    </div>
                                    <div>
                                        {
                                            result.bookingData.outbound.arrival
                                                .date
                                        }
                                    </div>
                                </div>

                                {/* Times */}
                                <div className='flex items-center gap-3 mb-2'>
                                    <div className='text-lg font-medium text-gray-900'>
                                        {
                                            result.bookingData.outbound
                                                .departure.time
                                        }
                                    </div>
                                    <div className='flex items-center flex-1'>
                                        <span className='dot'></span>
                                        <span className='line flex-1'></span>
                                        <span className='dot'></span>
                                    </div>
                                    <div className='text-lg font-medium text-gray-900'>
                                        {
                                            result.bookingData.outbound.arrival
                                                .time
                                        }
                                    </div>
                                </div>

                                {/* Airports */}
                                <div className='flex justify-between text-sm text-gray-700'>
                                    <div>
                                        {
                                            getAirportInfoByIata(
                                                result.bookingData.outbound
                                                    .departure.iata,
                                                airports
                                            ).name
                                        }{' '}
                                        Terminal{' '}
                                        {
                                            result.bookingData.outbound
                                                .departure.terminal
                                        }
                                    </div>
                                    <div className='text-right'>
                                        {
                                            getAirportInfoByIata(
                                                result.bookingData.outbound
                                                    .arrival.iata,
                                                airports
                                            ).name
                                        }{' '}
                                        Terminal{' '}
                                        {
                                            result.bookingData.outbound.arrival
                                                .terminal
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className='vertical-line hidden lg:block'></div>

                            {/* Flight Status */}
                            <div className='flex-1'>
                                <div className='text-md font-bold text-gray-500 mb-1'>
                                    Status
                                </div>
                                <div className='flex justify-between text-gray-600 text-sm mb-2'>
                                    <div>
                                        {
                                            result.bookingData.outbound
                                                .departure.date
                                        }
                                    </div>
                                    <div>
                                        {
                                            result.bookingData.outbound.arrival
                                                .date
                                        }
                                    </div>
                                </div>

                                <div className='flex items-center gap-3 mb-2'>
                                    <div className='text-lg font-medium text-gray-900'>
                                        {
                                            result.bookingData.outbound
                                                .departure.time
                                        }
                                    </div>
                                    <div className='flex items-center flex-1'>
                                        <span className='dot'></span>
                                        <span className='line flex-1'></span>
                                        <span className='dot'></span>
                                    </div>
                                    <div className='text-lg font-medium text-gray-900'>
                                        {
                                            result.bookingData.outbound.arrival
                                                .time
                                        }
                                    </div>
                                </div>

                                <div className='flex justify-between'>
                                    <span
                                        className={getStatusStyle(
                                            result.bookingData.outbound
                                                .departure.status
                                        )}
                                    >
                                        {
                                            result.bookingData.outbound
                                                .departure.status
                                        }
                                    </span>
                                    <span
                                        className={getStatusStyle(
                                            result.bookingData.outbound.arrival
                                                .status
                                        )}
                                    >
                                        {
                                            result.bookingData.outbound.arrival
                                                .status
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className='flex items-center justify-between border-t pt-3 mt-4 text-sm text-gray-200'>
                            <div className='flex items-center gap-1 text-gray-600'>
                                <GiAirplaneDeparture className='text-blue-900' />
                                <span>Booking Reference: </span>
                                <span className='font-semibold text-gray-600'>
                                    {result.bookingReference}
                                </span>
                            </div>
                            <AirlineInfo airlineCode={result.airlineCode} />
                        </div>
                        {result.bookingData?.source && (
                            <div className='text-xs text-gray-500 flex items-center gap-1 mt-2'>
                                <i className={`bi-${result.bookingData.source === 'live' ? 'broadcast' : 'database'}`}></i>
                                <span>
                                    {result.bookingData.source === 'live' ? 'Real-time data' : 'Cached data'}
                                </span>
                                {result.bookingData.lastUpdated && (
                                    <span className='ml-2'>
                                        Updated: {new Date(result.bookingData.lastUpdated).toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {result?.type === 'booking' && bookingType === 'tour' && result?.bookingData?.tour && (
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
										{result.bookingData.tour.booking_reference || result.bookingReference}
									</span>
								</div>
							</div>
                            <div>
                                <div className='text-gray-500'>Status</div>
                                <div className='font-medium'>{result.bookingData.tour.status}</div>
                            </div>
                            <div>
                                <div className='text-gray-500'>Title</div>
                                <div className='font-medium'>{result.bookingData.tour.title}</div>
                            </div>
                            <div>
                                <div className='text-gray-500'>Travel Dates</div>
                                <div className='font-medium'>
                                    {result.bookingData.tour.start_date} - {result.bookingData.tour.end_date}
                                </div>
                            </div>
                            <div>
                                <div className='text-gray-500'>Passengers</div>
                                <div className='font-medium'>{result.bookingData.tour.passenger_count}</div>
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
								<div className='font-semibold text-green-700 text-base'>₱ {Number(result.bookingData.tour.total_amount || 0).toLocaleString()}</div>
							</div>
							<div className='md:col-span-2'>
								<div className='text-gray-500'>Lead Contact</div>
								<div className='font-medium bg-gray-50 border border-gray-200 rounded-md p-3'>
									{result.bookingData.tour.lead_first_name} {result.bookingData.tour.lead_last_name} · {result.bookingData.tour.lead_email} · {result.bookingData.tour.lead_phone}
								</div>
							</div>
                        </div>

                        {/* Flight Details (if provided by admin) */}
                        {(() => {
                            const fd = result.bookingData.tour.flight_details
                            if (!fd) return null
                            const outbound = Array.isArray(fd.outbound) ? fd.outbound : (fd.outbound ? [fd.outbound] : [])
                            const inbound = Array.isArray(fd.return) ? fd.return : (fd.return ? [fd.return] : [])
							const renderSeg = (seg, idx) => (
								<div key={idx} className='grid grid-cols-1 md:grid-cols-5 gap-2 py-2 border-b text-sm text-gray-700'>
									<div className='font-medium text-gray-800'>{seg.airline || '-'}</div>
									<div className='text-gray-600'>{seg.flight_no || '-'}</div>
									<div className='text-gray-600'>{seg.departure || '-'}</div>
									<div className='text-gray-600'>{seg.arrival || '-'}</div>
									<div className='text-gray-600'>{seg.date ? new Date(seg.date).toLocaleString() : '-'}</div>
								</div>
							)
							return (
								<div className='mt-6 rounded-md border border-gray-200 bg-gray-50 p-4'>
									<div className='text-md font-semibold text-gray-800 mb-2'>Flight Details</div>
                                    {outbound.length > 0 && (
                                        <div className='mb-4'>
                                            <div className='text-gray-600 font-medium mb-1'>Outbound</div>
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
                                            <div className='text-gray-600 font-medium mb-1'>Return</div>
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
                        })(                        )}
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
                                <div className='font-medium'>{result.inquiry.inquiry_reference}</div>
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
                                <div className='font-medium'>{result.inquiry.email_address}</div>
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
                                <div className='font-medium'>{result.inquiry.destination}</div>
                            </div>
                            <div>
                                <div className='text-gray-500'>Submitted</div>
                                <div className='font-medium'>{new Date(result.inquiry.created_at).toLocaleString()}</div>
                            </div>
                        </div>
                        {result.inquiry.message && (
                            <div className='mt-4'>
                                <div className='text-gray-500 text-sm mb-1'>Message</div>
                                <div className='text-gray-700 text-sm whitespace-pre-line'>{result.inquiry.message}</div>
                            </div>
                        )}
                        
                        {/* Payment Section */}
                        {result.inquiry.conversion_status === 'AWAITING_PAYMENT' && (
                            <div className='mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6'>
                                <div className='flex items-center gap-3 mb-4'>
                                    <i className='bi-credit-card text-green-600 text-2xl'></i>
                                    <h3 className='text-xl font-bold text-green-800'>Ready for Payment</h3>
                                </div>
                                <p className='text-gray-700 mb-4'>
                                    Your inquiry has been reviewed and is ready for processing. Please proceed with payment to start your visa application.
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
                                            Pay Now - ₱ {result.inquiry.payment_amount?.toLocaleString() || '0'}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                        
                        {result.inquiry.conversion_status === 'CONVERTED' && (
                            <div className='mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-6'>
                                <div className='flex items-center gap-3 mb-3'>
                                    <i className='bi-check-circle-fill text-blue-600 text-2xl'></i>
                                    <h3 className='text-xl font-bold text-blue-800'>Processing Started!</h3>
                                </div>
                                <p className='text-gray-700 mb-3'>
                                    Your payment has been received and visa processing has begun.
                                </p>
                                <p className='text-sm text-gray-600'>
                                    <strong>Processing Reference:</strong> Check your email for details
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}

export default TrackBooking
