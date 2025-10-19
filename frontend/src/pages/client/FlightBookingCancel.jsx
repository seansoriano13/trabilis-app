import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'

function FlightBookingCancel() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const bookingReference = searchParams.get('booking_reference')
    const returnedFromPayment = searchParams.get('returned_from_payment')

    // Check if user has saved form state and redirect back to passenger details
    useEffect(() => {
        if (returnedFromPayment === 'true') {
            try {
                const savedState = sessionStorage.getItem('passengerFormState')
                if (savedState) {
                    const formState = JSON.parse(savedState)
                    const { flightId, timestamp } = formState

                    // Check if saved state is recent (within 1 hour)
                    const isRecent = Date.now() - timestamp < 60 * 60 * 1000

                    if (isRecent && flightId) {
                        // Redirect back to passenger details with the flight ID
                        navigate(
                            `/flights/passenger-details/${flightId}?returned_from_payment=true`,
                            { replace: true }
                        )
                        return
                    }
                }
            } catch (error) {
                console.warn('Failed to check saved form state:', error)
            }
        }
    }, [returnedFromPayment, navigate])

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 z-50 p-4'>
            <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-center flex flex-col items-center gap-6 animate-fadeIn'>
                {/* Animated Icon */}
                <div className='relative'>
                    <div className='w-24 h-24 rounded-full flex items-center justify-center bg-red-100 animate-pulse'>
                        <i className='bi-x-circle text-6xl text-red-500' />
                    </div>
                    <div className='absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce'>
                        <i className='bi-exclamation text-white text-sm'></i>
                    </div>
                </div>

                {/* Title and Message */}
                <div className='space-y-3'>
                    <h3 className='font-bold text-3xl text-gray-800'>
                        Booking Cancelled
                    </h3>
                    <p className='text-gray-600 text-lg leading-relaxed max-w-lg mx-auto'>
                        Your flight booking has been cancelled. No payment was
                        processed. You can try booking again or return to the
                        home page.
                    </p>
                </div>

                {/* Booking Reference Card - only show if available */}
                {bookingReference && (
                    <div className='w-full bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200'>
                        <div className='flex items-center justify-between mb-4'>
                            <span className='font-semibold text-gray-700 flex items-center gap-2'>
                                <i className='bi-ticket-perforated text-red-500'></i>
                                Cancelled Booking Reference
                            </span>
                            <span className='font-mono text-lg font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg'>
                                {bookingReference}
                            </span>
                        </div>
                        <div className='flex items-center justify-between'>
                            <span className='font-semibold text-gray-700 flex items-center gap-2'>
                                <i className='bi-x-circle text-red-500'></i>
                                Status
                            </span>
                            <span className='px-3 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200'>
                                CANCELLED
                            </span>
                        </div>
                    </div>
                )}

                {/* Cancellation Notice */}
                <div className='w-full bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200'>
                    <div className='flex items-center gap-3 mb-3'>
                        <div className='text-2xl'>ℹ️</div>
                        <div>
                            <h4 className='text-lg font-bold text-yellow-800'>
                                What happens next?
                            </h4>
                        </div>
                    </div>
                    <div className='text-left space-y-2 text-sm text-yellow-700'>
                        <p>• No payment was charged to your account</p>
                        <p>• Your booking has been automatically cancelled</p>
                        <p>• You can start a new booking at any time</p>
                        <p>• Contact support if you need assistance</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-wrap items-center justify-center gap-3 mt-6'>
                    <button
                        onClick={() => navigate('/flights')}
                        className='px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    >
                        <i className='bi-airplane mr-2'></i>
                        Book Another Flight
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className='cursor-pointer px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl hover:from-gray-900 hover:to-black transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    >
                        <i className='bi-house mr-2'></i>
                        Go to Home
                    </button>
                    <button
                        onClick={() => navigate('/track-booking')}
                        className='cursor-pointer px-6 py-3 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    >
                        <i className='bi-search mr-2'></i>
                        Track Other Bookings
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

export default FlightBookingCancel
