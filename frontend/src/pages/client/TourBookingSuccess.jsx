import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

function TourBookingSuccess() {
    const { search } = useLocation()
    const navigate = useNavigate()
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
                alert(
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
            className='relative w-full h-screen xl:h-screen bg-secondary-500'
        >
            <img
                src='https://lindelatravel.com/images/section-content/reception-telephone-booth-20240602.jpg'
                className='absolute top-0 left-0 w-full h-full object-center object-cover brightness-40'
                alt=''
            />
            <div className='absolute top-0 left-0 w-full h-full bg-secondary-500/60'></div>

            <div className='relative w-full xl:max-w-[1166px] h-screen mx-auto px-4 lg:px-8 xl:px-0 flex flex-col justify-center'>
                <div className='max-w-lg xl:max-w-2xl mx-auto text-center bg-black/40 p-8 rounded-lg shadow-lg'>
                    <h1 className='font-poppins font-bold text-yellow-300 text-lg lg:text-xl'>
                        Booking Status
                    </h1>
                    <h3 className='font-poppins font-bold text-white text-2xl lg:text-4xl mt-2'>
                        {title}
                    </h3>
                    <p className='mt-6 text-white text-sm lg:text-lg'>
                        {message}
                    </p>

                    {bookingReference && (
                        <div className='mt-6 text-left text-white/90 text-xs bg-white/10 rounded-lg p-3'>
                            <div className='flex items-center justify-between'>
                                <span className='font-semibold'>Booking Reference</span>
                                <span className='font-mono'>{bookingReference}</span>
                            </div>
                            {bookingDetails?.status && (
                                <div className='mt-2 flex items-center justify-between'>
                                    <span className='font-semibold'>Status</span>
                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                        bookingDetails.status === 'CONFIRMED'
                                            ? 'bg-green-200/20 text-green-200'
                                            : bookingDetails.status === 'FAILED'
                                            ? 'bg-red-200/20 text-red-200'
                                            : 'bg-yellow-200/20 text-yellow-200'
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

                    {bookingDetails && (
                        <div className='grid grid-cols-2 gap-3 text-left text-white text-xs mt-3'>
                            {bookingDetails.tourTitle && (
                                <div className='bg-white/10 rounded-lg p-3 col-span-2'>
                                    <div className='font-semibold'>Tour</div>
                                    <div>{bookingDetails.tourTitle}</div>
                                </div>
                            )}
                            {bookingDetails.startDate && (
                                <div className='bg-white/10 rounded-lg p-3'>
                                    <div className='font-semibold'>Start</div>
                                    <div>{new Date(bookingDetails.startDate).toLocaleDateString()}</div>
                                </div>
                            )}
                            {bookingDetails.endDate && (
                                <div className='bg-white/10 rounded-lg p-3'>
                                    <div className='font-semibold'>End</div>
                                    <div>{new Date(bookingDetails.endDate).toLocaleDateString()}</div>
                                </div>
                            )}
                            {typeof bookingDetails.passengerCount === 'number' && (
                                <div className='bg-white/10 rounded-lg p-3 col-span-2'>
                                    <div className='font-semibold'>Passengers</div>
                                    <div>{bookingDetails.passengerCount}</div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className='mt-8 flex flex-wrap items-center justify-center gap-2'>
                        <button
                            onClick={() => fetchStatus()}
                            className='px-5 py-3 bg-primary-500 hover:bg-primary-600 transition rounded-lg font-semibold text-white disabled:opacity-50'
                            disabled={polling}
                        >
                            {polling ? 'Refreshing…' : 'Refresh status'}
                        </button>
                        {buttonText && (
                            <button
                                onClick={buttonAction}
                                className='px-5 py-3 bg-white/10 hover:bg-white/20 transition rounded-lg font-semibold text-white'
                            >
                                {buttonText}
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/destinations')}
                            className='px-5 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition'
                        >
                            Explore more tours
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default TourBookingSuccess
