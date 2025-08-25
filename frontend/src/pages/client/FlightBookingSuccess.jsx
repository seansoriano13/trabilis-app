import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

function FlightBookingSuccess() {
    const { search } = useLocation()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [bookingDetails, setBookingDetails] = useState(null)

    useEffect(() => {
        const params = new URLSearchParams(search)
        const bookingReference = params.get('booking_reference')

        const checkBookingStatus = async () => {
            if (!bookingReference) {
                setError('Booking reference missing')
                setLoading(false)
                return
            }

            try {
                const response = await axios.get(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/api/v1/bookings/status`,
                    { params: { booking_reference: bookingReference } }
                )
                const { status, searchCriteria } = response.data
                setBookingDetails({ status, searchCriteria })

                if (status.includes('TICKETING_FAILED')) {
                    alert(
                        'Booking failed due to ticketing issues. A refund has been issued. Please try booking again.'
                    )
                    navigate('/flights', {
                        state: {
                            origin: searchCriteria.origin,
                            destination: searchCriteria.destination,
                            inboundDeparture: searchCriteria.inboundDeparture,
                            outboundDeparture: searchCriteria.outboundDeparture,
                            travelerCount: searchCriteria.travelerCount,
                        },
                    })
                }
            } catch (err) {
                console.error('Failed to check booking status:', err)
                setError(
                    'Failed to verify booking status. Please contact support.'
                )
            } finally {
                setLoading(false)
            }
        }

        checkBookingStatus()
    }, [search, navigate])

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
            <div className='bg-tertiary-500 rounded-xl shadow-lg p-8 w-full max-w-md text-center flex flex-col items-center gap-4'>
                <i className={`${content.icon}`} />
                <h3 className='font-bold text-2xl'>{content.title}</h3>
                <p className='text-sm'>{content.message}</p>
                {content.button && (
                    <button
                        onClick={content.button.onClick}
                        className='mt-4 px-6 py-2 bg-secondary-500 text-tertiary-500 font-bold rounded-lg hover:bg-secondary-400 transition'
                    >
                        {content.button.text}
                    </button>
                )}
            </div>
        </div>
    )
}

export default FlightBookingSuccess
