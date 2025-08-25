import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

function TourBookingSuccess() {
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
                    }/api/v1/destinations/tour/booking`,
                    { params: { booking_reference: bookingReference } }
                )

                if (!response.data) {
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
                    alert(
                        'Tour booking failed. A refund has been issued. Please try booking again.'
                    )
                    navigate('/destinations')
                }
            } catch (err) {
                setError(
                    'Failed to verify booking status. Please contact support.'
                )
            } finally {
                setLoading(false)
            }
        }

        checkBookingStatus()
    }, [search, navigate])

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

                    {buttonText && (
                        <button
                            onClick={buttonAction}
                            className='mt-8 px-6 py-3 bg-primary-500 hover:bg-primary-600 transition rounded-lg font-semibold text-white'
                        >
                            {buttonText}
                        </button>
                    )}
                </div>
            </div>
        </section>
    )
}

export default TourBookingSuccess
