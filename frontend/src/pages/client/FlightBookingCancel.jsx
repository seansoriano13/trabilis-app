import { useNavigate } from 'react-router-dom'

function FlightBookingCancel() {
    const navigate = useNavigate()

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-white z-50 p-4'>
            <div className='bg-tertiary-500 rounded-xl shadow-lg p-8 w-full max-w-md text-center flex flex-col items-center gap-4'>
                <i className='bi-x-circle text-6xl text-red-500' />
                <h3 className='font-bold text-2xl'>Booking Cancelled</h3>
                <p className='text-sm'>
                    Your flight booking has been cancelled. You can try booking
                    again or return to the home page.
                </p>
                <div className='flex gap-4 mt-4'>
                    <button
                        onClick={() => navigate('/flights')}
                        className='px-6 py-2 bg-secondary-500 text-tertiary-500 font-bold rounded-lg hover:bg-secondary-400 transition'
                    >
                        Book Again
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className='px-6 py-2 bg-secondary-500 text-tertiary-500 font-bold rounded-lg hover:bg-secondary-400 transition'
                    >
                        Return Home
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FlightBookingCancel
