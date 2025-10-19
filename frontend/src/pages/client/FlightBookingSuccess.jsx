import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useSnackbar } from '../../context/SnackbarContext'

function FlightBookingSuccess() {
    const { search } = useLocation()
    const navigate = useNavigate()
    const { showError } = useSnackbar()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [bookingDetails, setBookingDetails] = useState(null)
    const [lastUpdated, setLastUpdated] = useState(null)
    const pollingRef = useRef(null)
    const [_attempts, setAttempts] = useState(0)

    const bookingReference = useMemo(() => {
        const params = new URLSearchParams(search)
        return params.get('booking_reference')
    }, [search])

    const fetchStatus = async () => {
        if (!bookingReference) {
            setError('Booking reference missing')
            setLoading(false)
            return
        }
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/bookings/status`,
                { params: { booking_reference: bookingReference } }
            )
            const { status, searchCriteria } = response.data
            setBookingDetails({ status, searchCriteria })
            setLastUpdated(new Date())

            if (status.includes('TICKETING_FAILED')) {
                showError(
                    'Booking failed due to ticketing issues. A refund has been issued. Please try booking again.'
                )
                navigate('/flights', {
                    state: {
                        origin: searchCriteria?.origin,
                        destination: searchCriteria?.destination,
                        inboundDeparture: searchCriteria?.inboundDeparture,
                        outboundDeparture: searchCriteria?.outboundDeparture,
                        travelerCount: searchCriteria?.travelerCount,
                    },
                })
                return
            }
        } catch {
            // Keep the UI responsive; show error but allow retry
            setError('Failed to verify booking status. Please try again shortly.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let intervalId = null
        const startPolling = async () => {
            await fetchStatus()
            setAttempts((a) => a + 1)

            intervalId = setInterval(async () => {
                // Stop polling if terminal state
                const status = bookingDetails?.status
                if (status === 'PENDING_TICKETING' || status?.includes('FAILED')) {
                    clearInterval(intervalId)
                    return
                }
                // Limit attempts to avoid infinite polling
                setAttempts((prev) => {
                    const next = prev + 1
                    return next
                })
                await fetchStatus()
            }, 5000)
            pollingRef.current = intervalId
        }

        startPolling()

        return () => {
            if (intervalId) clearInterval(intervalId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookingReference])

    const renderContent = () => {
        if (loading) {
            return {
                icon: 'animate-spin bi-arrow-repeat text-6xl text-primary-500',
                title: 'Verifying Your Booking...',
                message: 'Please wait while we confirm your booking details.',
                button: null,
            }
        }

        if (error) {
            return {
                icon: 'bi-x-circle text-6xl text-red-500',
                title: 'Booking Error',
                message: error,
                button: {
                    text: 'Try Another Booking',
                    onClick: () => navigate('/flights'),
                },
            }
        }

        if (bookingDetails?.status === 'PENDING_TICKETING') {
            return {
                icon: 'bi-check2-circle text-6xl text-green-500',
                title: 'Booking Confirmed!',
                message:
                    'Your flight booking has been successfully confirmed. Check your email for booking details and e-ticket information.',
                button: {
                    text: 'Return to Home',
                    onClick: () => navigate('/'),
                },
            }
        }

        return {
            icon: 'bi-clock text-6xl text-primary-500',
            title: 'Processing Your Booking',
            message:
                'Your booking is being finalized. You will receive an email confirmation soon.',
            button: { text: 'Return to Home', onClick: () => navigate('/') },
        }
    }

    const content = renderContent()

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 z-50 p-4'>
            <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-center flex flex-col items-center gap-6 animate-fadeIn'>
                {/* Animated Icon */}
                <div className='relative'>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                        content.icon.includes('animate-spin') 
                            ? 'bg-blue-100' 
                            : content.icon.includes('check2-circle')
                            ? 'bg-green-100 animate-pulse'
                            : content.icon.includes('x-circle')
                            ? 'bg-red-100'
                            : 'bg-yellow-100'
                    }`}>
                        <i className={`${content.icon} text-4xl`} />
                    </div>
                    {content.icon.includes('check2-circle') && (
                        <div className='absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce'>
                            <i className='bi-check text-white text-sm'></i>
                        </div>
                    )}
                </div>

                {/* Title and Message */}
                <div className='space-y-3'>
                    <h3 className='font-bold text-3xl text-gray-800'>{content.title}</h3>
                    <p className='text-gray-600 text-lg leading-relaxed max-w-lg mx-auto'>{content.message}</p>
                </div>

                {/* Booking Reference Card */}
                {bookingReference && (
                    <div className='w-full bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200'>
                        <div className='flex items-center justify-between mb-4'>
                            <span className='font-semibold text-gray-700 flex items-center gap-2'>
                                <i className='bi-ticket-perforated text-blue-500'></i>
                                Booking Reference
                            </span>
                            <span className='font-mono text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg'>
                                {bookingReference}
                            </span>
                        </div>
                        {bookingDetails?.status && (
                            <div className='flex items-center justify-between mb-3'>
                                <span className='font-semibold text-gray-700 flex items-center gap-2'>
                                    <i className='bi-clock text-orange-500'></i>
                                    Status
                                </span>
                                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                                    bookingDetails.status === 'PENDING_TICKETING'
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                }`}>
                                    {bookingDetails.status}
                                </span>
                            </div>
                        )}
                        {lastUpdated && (
                            <div className='flex items-center justify-between'>
                                <span className='font-semibold text-gray-700 flex items-center gap-2'>
                                    <i className='bi-arrow-clockwise text-purple-500'></i>
                                    Last updated
                                </span>
                                <span className='text-gray-600'>{lastUpdated.toLocaleTimeString()}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Flight Details Grid */}
                {bookingDetails?.searchCriteria && (
                    <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200'>
                            <div className='flex items-center gap-2 mb-2'>
                                <i className='bi-geo-alt text-blue-500'></i>
                                <div className='font-semibold text-blue-800'>From</div>
                            </div>
                            <div className='text-lg font-bold text-blue-900'>{bookingDetails.searchCriteria.origin}</div>
                        </div>
                        <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200'>
                            <div className='flex items-center gap-2 mb-2'>
                                <i className='bi-geo-alt-fill text-green-500'></i>
                                <div className='font-semibold text-green-800'>To</div>
                            </div>
                            <div className='text-lg font-bold text-green-900'>{bookingDetails.searchCriteria.destination}</div>
                        </div>
                        {bookingDetails.searchCriteria.outboundDeparture && (
                            <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <i className='bi-calendar-event text-purple-500'></i>
                                    <div className='font-semibold text-purple-800'>Departure</div>
                                </div>
                                <div className='text-lg font-bold text-purple-900'>
                                    {new Date(bookingDetails.searchCriteria.outboundDeparture).toLocaleDateString()}
                                </div>
                            </div>
                        )}
                        {bookingDetails.searchCriteria.inboundDeparture && (
                            <div className='bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <i className='bi-calendar-check text-orange-500'></i>
                                    <div className='font-semibold text-orange-800'>Return</div>
                                </div>
                                <div className='text-lg font-bold text-orange-900'>
                                    {new Date(bookingDetails.searchCriteria.inboundDeparture).toLocaleDateString()}
                                </div>
                            </div>
                        )}
                        {typeof bookingDetails.searchCriteria.travelerCount === 'number' && (
                            <div className='bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200 md:col-span-2'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <i className='bi-people text-indigo-500'></i>
                                    <div className='font-semibold text-indigo-800'>Passengers</div>
                                </div>
                                <div className='text-lg font-bold text-indigo-900'>{bookingDetails.searchCriteria.travelerCount}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className='flex flex-wrap items-center justify-center gap-3 mt-6'>
                    <button
                        onClick={() => navigate('/track-booking', { 
                            state: { 
                                bookingRef: bookingReference, 
                                bookingType: 'flight', 
                                autoSearch: true 
                            } 
                        })}
                        className='px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    >
                        <i className='bi-radar mr-2'></i>
                        Track Flight
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className='cursor-pointer px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl hover:from-gray-900 hover:to-black transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    >
                        <i className='bi-house mr-2'></i>
                        Go to Home
                    </button>
                    <button
                        onClick={() => navigate('/flights')}
                        className='cursor-pointer px-6 py-3 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    >
                        <i className='bi-airplane mr-2'></i>
                        Book another flight
                    </button>
                </div>

                {/* Support Info */}
                <div className='mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200'>
                    <p className='text-sm text-gray-600'>
                        <i className='bi-headset mr-2 text-blue-500'></i>
                        Need help? Contact support at{' '}
                        <a 
                            className='text-blue-600 hover:text-blue-800 font-semibold underline decoration-2 underline-offset-2' 
                            href='mailto:support@lindelatravel.com'
                        >
                            support@lindelatravel.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default FlightBookingSuccess
