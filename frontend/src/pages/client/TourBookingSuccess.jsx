import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useSnackbar } from '../../context/SnackbarContext'

function TourBookingSuccess() {
    const { search } = useLocation()
    const navigate = useNavigate()
    const { showSuccess, showError } = useSnackbar()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [bookingDetails, setBookingDetails] = useState(null)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [polling, setPolling] = useState(false)
    const pollingRef = useRef(null)

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
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/destinations/tour/booking`,
                { params: { booking_reference: bookingReference } }
            )

            if (!response.data) {
                setError('Booking data not found')
                setLoading(false)
                return
            }

            const {
                status = 'UNKNOWN',
                start_date = null,
                end_date = null,
                title = 'Unknown Tour',
                passenger_count = 0,
            } = response.data

            setBookingDetails({
                status,
                startDate: start_date,
                endDate: end_date,
                tourTitle: title,
                passengerCount: passenger_count,
            })
            setLastUpdated(new Date())

            if (status === 'FAILED') {
                showError(
                    'Tour booking failed. A refund has been issued. Please try booking again.'
                )
                navigate('/destinations')
                return
            }
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError('Failed to verify booking status. Please try again shortly.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let intervalId = null
        const start = async () => {
            setPolling(true)
            await fetchStatus()
            intervalId = setInterval(async () => {
                const status = bookingDetails?.status
                if (status === 'CONFIRMED' || status === 'FAILED') {
                    clearInterval(intervalId)
                    setPolling(false)
                    return
                }
                await fetchStatus()
            }, 5000)
            pollingRef.current = intervalId
        }
        start()
        return () => {
            if (intervalId) clearInterval(intervalId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookingReference])

    const getContent = () => {
        if (loading) {
            return {
                title: 'Verifying Your Booking...',
                message:
                    'Please wait while we confirm your tour booking details.',
                buttonText: null,
            }
        }
        if (error) {
            return {
                title: 'Booking Error',
                message: error,
                buttonText: 'Try Another Booking',
                buttonAction: () => navigate('/destinations'),
            }
        }
        if (bookingDetails?.status === 'CONFIRMED') {
            return {
                title: 'Tour Booking Confirmed!',
                message: `Your tour booking for ${
                    bookingDetails.tourTitle
                } from ${new Date(
                    bookingDetails.startDate
                ).toLocaleDateString()} to ${new Date(
                    bookingDetails.endDate
                ).toLocaleDateString()} for ${
                    bookingDetails.passengerCount
                } passenger(s) has been confirmed. Check your email for details.`,
                buttonText: 'Return to Home',
                buttonAction: () => navigate('/'),
            }
        }
        return {
            title: 'Processing Your Booking',
            message:
                'Your tour booking is being finalized. You will receive an email confirmation soon.',
            buttonText: 'Return to Home',
            buttonAction: () => navigate('/'),
        }
    }

    const { title, message, buttonText, buttonAction } = getContent()

    return (
        <section
            id='sectionBookingSuccess'
            className='relative w-full min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50'
        >
            {/* Background Image with Overlay */}
            <div className='absolute inset-0'>
                <div className='absolute inset-0 bg-gradient-to-br from-amber-900/50 via-orange-800/50 to-red-900/20'></div>
                <div className='absolute inset-0 bg-white/10'></div>
            </div>

            {/* Floating Elements */}
            <div className='absolute top-10 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl animate-pulse'></div>
            <div className='absolute top-32 right-16 w-16 h-16 bg-orange-400/20 rounded-full blur-lg animate-pulse delay-1000'></div>
            <div className='absolute bottom-20 left-20 w-24 h-24 bg-red-400/20 rounded-full blur-2xl animate-pulse delay-2000'></div>

            <div className='relative w-full max-w-6xl mx-auto pt-[var(--default-padding-top)] pb-10 lg:pt-25 md:pt-35 flex flex-col justify-center min-h-screen'>
                <div className='max-w-4xl mx-auto'>
                    {/* Main Card */}
                    <div className='bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 lg:p-12 animate-fadeIn'>
                        {/* Header */}
                        <div className='text-center mb-8'>
                            <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg'>
                                <i className='bi-compass text-white text-3xl'></i>
                            </div>
                            <h1 className='text-2xl lg:text-3xl font-bold text-gray-800 mb-2'>
                                Tour Booking Status
                            </h1>
                            <h3 className='text-3xl lg:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent'>
                                {title}
                            </h3>
                            <p className='mt-6 text-gray-600 text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto'>
                                {message}
                            </p>
                        </div>


                        {/* Booking Reference Card */}
                        {bookingReference && (
                            <div className='bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 border border-gray-200 shadow-lg'>
                                <div className='flex items-center justify-between mb-4'>
                                    <span className='font-semibold text-gray-700 flex items-center gap-2 text-lg'>
                                        <i className='bi-ticket-perforated text-amber-500'></i>
                                        Booking Reference
                                    </span>
                                    <span className='font-mono text-xl font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200'>
                                        {bookingReference}
                                    </span>
                                </div>
                                {bookingDetails?.status && (
                                    <div className='flex items-center justify-between mb-3'>
                                        <span className='font-semibold text-gray-700 flex items-center gap-2'>
                                            <i className='bi-clock text-orange-500'></i>
                                            Status
                                        </span>
                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                            bookingDetails.status === 'CONFIRMED'
                                                ? 'bg-green-100 text-green-800 border border-green-200'
                                                : bookingDetails.status === 'FAILED'
                                                ? 'bg-red-100 text-red-800 border border-red-200'
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

                        {/* Tour Details Grid */}
                        {bookingDetails && (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                                {bookingDetails.tourTitle && (
                                    <div className='bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 border border-amber-200 md:col-span-2 shadow-lg'>
                                        <div className='flex items-center gap-3 mb-3'>
                                            <i className='bi-geo-alt text-amber-500 text-xl'></i>
                                            <div className='font-semibold text-amber-800 text-lg'>Tour Package</div>
                                        </div>
                                        <div className='text-xl font-bold text-amber-900'>{bookingDetails.tourTitle}</div>
                                    </div>
                                )}
                                {bookingDetails.startDate && (
                                    <div className='bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200 shadow-lg'>
                                        <div className='flex items-center gap-3 mb-3'>
                                            <i className='bi-calendar-event text-green-500 text-xl'></i>
                                            <div className='font-semibold text-green-800 text-lg'>Start Date</div>
                                        </div>
                                        <div className='text-xl font-bold text-green-900'>
                                            {new Date(bookingDetails.startDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                                {bookingDetails.endDate && (
                                    <div className='bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-6 border border-blue-200 shadow-lg'>
                                        <div className='flex items-center gap-3 mb-3'>
                                            <i className='bi-calendar-check text-blue-500 text-xl'></i>
                                            <div className='font-semibold text-blue-800 text-lg'>End Date</div>
                                        </div>
                                        <div className='text-xl font-bold text-blue-900'>
                                            {new Date(bookingDetails.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                                {typeof bookingDetails.passengerCount === 'number' && (
                                    <div className='bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6 border border-purple-200 md:col-span-2 shadow-lg'>
                                        <div className='flex items-center gap-3 mb-3'>
                                            <i className='bi-people text-purple-500 text-xl'></i>
                                            <div className='font-semibold text-purple-800 text-lg'>Passengers</div>
                                        </div>
                                        <div className='text-xl font-bold text-purple-900'>{bookingDetails.passengerCount}</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className='flex flex-wrap items-center justify-center gap-4'>
                            
                            {buttonText && (
                                <button
                                    onClick={buttonAction}
                                    className='px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-2xl hover:from-gray-900 hover:to-black transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                                >
                                    <i className='bi-house mr-2 text-lg'></i>
                                    {buttonText}
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/destinations')}
                                className='px-8 py-4 bg-white text-gray-800 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                            >
                                <i className='bi-compass mr-2 text-lg'></i>
                                Explore more tours
                            </button>
                        </div>

                        {/* Support Info */}
                        <div className='mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200'>
                            <p className='text-center text-gray-600'>
                                <i className='bi-headset mr-2 text-amber-500 text-lg'></i>
                                Need help? Contact our travel experts at{' '}
                                <a 
                                    className='text-amber-600 hover:text-amber-800 font-semibold underline decoration-2 underline-offset-2' 
                                    href='mailto:support@lindelatravel.com'
                                >
                                    support@lindelatravel.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default TourBookingSuccess
