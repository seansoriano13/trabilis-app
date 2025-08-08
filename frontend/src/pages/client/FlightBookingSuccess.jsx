import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './FlightBookingSuccess.css'

function FlightBookingSuccess() {
    const { search } = useLocation()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [bookingDetails, setBookingDetails] = useState(null)

    useEffect(() => {
        const params = new URLSearchParams(search)
        // eslint-disable-next-line no-unused-vars
        const sessionId = params.get('session_id')
        const bookingReference = params.get('booking_reference')

        const checkBookingStatus = async () => {
            if (!bookingReference) {
                setError('Booking reference missing')
                setLoading(false)
                return
            }

            try {
                const response = await axios.get('/api/v1/bookings/status', {
                    params: { booking_reference: bookingReference },
                })
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

    if (loading) {
        return (
            <div className='success-container'>
                <h2 className='success-title'>Verifying Your Booking...</h2>
                <p className='success-message'>
                    Please wait while we confirm your booking details.
                </p>
            </div>
        )
    }

    if (error) {
        return (
            <div className='success-container'>
                <h2 className='success-title'>Booking Error</h2>
                <p className='success-message'>{error}</p>
                <button
                    className='success-button'
                    onClick={() => navigate('/flights')}
                >
                    Try Another Booking
                </button>
            </div>
        )
    }

    if (bookingDetails?.status === 'TICKETED') {
        return (
            <div className='success-container'>
                <h2 className='success-title'>Booking Confirmed!</h2>
                <p className='success-message'>
                    Your flight booking has been successfully confirmed. Check
                    your email for booking details and e-ticket information.
                </p>
                <button
                    className='success-button'
                    onClick={() => navigate('/')}
                >
                    Return to Home
                </button>
            </div>
        )
    }

    return (
        <div className='success-container'>
            <h2 className='success-title'>Processing Your Booking</h2>
            <p className='success-message'>
                Your booking is being finalized. You will receive an email
                confirmation soon.
            </p>
            <button
                className='success-button'
                onClick={() => navigate('/')}
            >
                Return to Home
            </button>
        </div>
    )
}

export default FlightBookingSuccess
