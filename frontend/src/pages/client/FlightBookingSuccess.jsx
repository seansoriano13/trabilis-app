import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

function FlightBookingSuccess() {
    const { search } = useLocation()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [bookingDetails, setBookingDetails] = useState(null)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [polling, setPolling] = useState(false)
    const pollingRef = useRef(null)
    const [attempts, setAttempts] = useState(0)

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
                alert(
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
        } catch (err) {
            // Keep the UI responsive; show error but allow retry
            setError('Failed to verify booking status. Please try again shortly.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let intervalId = null
        const startPolling = async () => {
            setPolling(true)
            await fetchStatus()
            setAttempts((a) => a + 1)

            intervalId = setInterval(async () => {
                // Stop polling if terminal state
                const status = bookingDetails?.status
                if (status === 'TICKETED' || status?.includes('FAILED')) {
                    clearInterval(intervalId)
                    setPolling(false)
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

        if (bookingDetails?.status === 'TICKETED') {
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
        <div className='fixed inset-0 flex items-center justify-center bg-white z-50 p-4'>
            <div className='bg-tertiary-500 rounded-xl shadow-lg p-8 w-full max-w-xl text-center flex flex-col items-center gap-4'>
                <i className={`${content.icon}`} />
                <h3 className='font-bold text-2xl'>{content.title}</h3>
                <p className='text-sm'>{content.message}</p>

                {bookingReference && (
                    <div className='w-full mt-2 text-xs text-left bg-white/60 rounded-lg p-3'>
                        <div className='flex items-center justify-between'>
                            <span className='font-semibold'>Booking Reference</span>
                            <span className='font-mono'>{bookingReference}</span>
                        </div>
                        {bookingDetails?.status && (
                            <div className='mt-2 flex items-center justify-between'>
                                <span className='font-semibold'>Status</span>
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                    bookingDetails.status === 'TICKETED'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {bookingDetails.status}
                                </span>
                            </div>
                        )}
                        {lastUpdated && (
                            <div className='mt-2 flex items-center justify-between'>
                                <span className='font-semibold'>Last updated</span>
                                <span>{lastUpdated.toLocaleTimeString()}</span>
                            </div>
                        )}
                    </div>
                )}

                {bookingDetails?.searchCriteria && (
                    <div className='w-full grid grid-cols-2 gap-3 text-left text-xs mt-2'>
                        <div className='bg-white/60 rounded-lg p-3'>
                            <div className='font-semibold'>From</div>
                            <div>{bookingDetails.searchCriteria.origin}</div>
                        </div>
                        <div className='bg-white/60 rounded-lg p-3'>
                            <div className='font-semibold'>To</div>
                            <div>{bookingDetails.searchCriteria.destination}</div>
                        </div>
                        {bookingDetails.searchCriteria.outboundDeparture && (
                            <div className='bg-white/60 rounded-lg p-3'>
                                <div className='font-semibold'>Departure</div>
                                <div>{new Date(bookingDetails.searchCriteria.outboundDeparture).toLocaleDateString()}</div>
                            </div>
                        )}
                        {bookingDetails.searchCriteria.inboundDeparture && (
                            <div className='bg-white/60 rounded-lg p-3'>
                                <div className='font-semibold'>Return</div>
                                <div>{new Date(bookingDetails.searchCriteria.inboundDeparture).toLocaleDateString()}</div>
                            </div>
                        )}
                        {typeof bookingDetails.searchCriteria.travelerCount === 'number' && (
                            <div className='bg-white/60 rounded-lg p-3 col-span-2'>
                                <div className='font-semibold'>Passengers</div>
                                <div>{bookingDetails.searchCriteria.travelerCount}</div>
                            </div>
                        )}
                    </div>
                )}

                <div className='mt-4 flex flex-wrap items-center justify-center gap-2'>
                    <button
                        onClick={() => fetchStatus()}
                        className='px-4 py-2 bg-secondary-500 text-tertiary-500 font-bold rounded-lg hover:bg-secondary-400 transition disabled:opacity-50'
                        disabled={polling}
                    >
                        {polling ? 'Refreshing…' : 'Refresh status'}
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className='px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-black/80 transition'
                    >
                        Go to Home
                    </button>
                    <button
                        onClick={() => navigate('/flights')}
                        className='px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-100 transition border'
                    >
                        Book another flight
                    </button>
                </div>

                <p className='text-[11px] text-black/70 mt-2'>
                    Need help? Contact support at <a className='underline' href='mailto:support@lindelatravel.com'>support@lindelatravel.com</a>
                </p>
            </div>
        </div>
    )
}

export default FlightBookingSuccess
