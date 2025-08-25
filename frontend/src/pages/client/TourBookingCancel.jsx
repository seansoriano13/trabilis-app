import { useNavigate } from 'react-router-dom'

function TourBookingCancel() {
    const navigate = useNavigate()

    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-gray-200 px-6 text-center'>
            <div className='bg-white shadow-lg rounded-xl p-8 max-w-md w-full'>
                <h2 className='text-2xl font-bold text-red-600 mb-4'>
                    Booking Cancelled
                </h2>
                <p className='text-gray-700 mb-6'>
                    Your tour booking has been cancelled. Please try booking
                    again or contact support if you need assistance.
                </p>
                <button
                    className='px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition'
                    onClick={() => navigate('/destinations')}
                >
                    Browse Tours
                </button>
            </div>
        </div>
    )
}

export default TourBookingCancel
