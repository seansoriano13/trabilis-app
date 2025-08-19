import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './TourBookingSuccess.css' // You'll create this

function TourBookingSuccess() {
    const { search } = useLocation()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [bookingDetails, setBookingDetails] = useState(null)

    useEffect(() => {
        const params = new URLSearchParams(search)
        const bookingReference = params.get('booking_reference')

        console.log('Booking reference from URL:', bookingReference)

        const checkBookingStatus = async () => {
            if (!bookingReference) {
                console.warn('Booking reference is missing from URL')
                setError('Booking reference missing')
                setLoading(false)
                return
            }

            try {
                const response = await axios.get(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/api/v1/destinations/tour/booking`,
                    { params: { booking_reference: bookingReference } }
                )

                if (!response.data) {
                    console.warn('No booking data returned from API')
                    setError('Booking data not found')
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

                if (status === 'FAILED') {
                    console.warn('Booking status is FAILED')
                    alert(
                        'Tour booking failed. A refund has been issued. Please try booking again.'
                    )
                    navigate('/destinations')
                }
            } catch (err) {
                console.error('Error fetching booking status:', err)
                if (err.response) {
                    console.error('API response error data:', err.response.data)
                }
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
                    Please wait while we confirm your tour booking details.
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
                    onClick={() => navigate('/destinations')}
                >
                    Try Another Booking
                </button>
            </div>
        )
    }

    if (bookingDetails?.status === 'CONFIRMED') {
        return (
            <div className='success-container'>
                <h2 className='success-title'>Tour Booking Confirmed!</h2>
                <p className='success-message'>
                    Your tour booking for {bookingDetails.tourTitle} from{' '}
                    {new Date(bookingDetails.startDate).toLocaleDateString()} to{' '}
                    {new Date(bookingDetails.endDate).toLocaleDateString()} for{' '}
                    {bookingDetails.passengerCount} passenger(s) has been
                    confirmed. Check your email for details.
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
                Your tour booking is being finalized. You will receive an email
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

export default TourBookingSuccess
