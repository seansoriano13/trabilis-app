import { useNavigate } from 'react-router-dom'
import './TourBookingSuccess.css'

function TourBookingCancel() {
    const navigate = useNavigate()

    return (
        <div className='success-container'>
            <h2 className='success-title'>Booking Cancelled</h2>
            <p className='success-message'>
                Your tour booking has been cancelled. Please try booking again
                or contact support if you need assistance.
            </p>
            <button
                className='success-button'
                onClick={() => navigate('/destinations')}
            >
                Browse Tours
            </button>
        </div>
    )
}

export default TourBookingCancel
