import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import './TourBooking.css'

function TourBooking() {
    const { state } = useLocation()
    const { selectedDateId, passengers, selectedDate, title } = state

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        payment_type: 'FULL',
    })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const reservation_per_pax = state.dates[0].reservation_fee_per_pax

    const validateForm = () => {
        if (!formData.firstName.trim()) return 'First name is required'
        if (!formData.lastName.trim()) return 'Last name is required'
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
            return 'Valid email is required'
        if (!formData.phone.match(/^\+?\d{10,15}$/))
            return 'Valid phone number is required'
        if (!['FULL', 'RESERVATION'].includes(formData.payment_type))
            return 'Invalid payment type'
        if (!Number.isInteger(selectedDateId) || selectedDateId <= 0)
            return 'Invalid tour date'
        if (!Number.isInteger(passengers) || passengers <= 0)
            return 'Invalid number of passengers'
        return null
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const validationError = validateForm()
        if (validationError) {
            setError(validationError)
            setLoading(false)
            return
        }

        try {
            const response = await axios.post(
                `${
                    import.meta.env.VITE_BACKEND_URL
                }/api/v1/destinations/tour/booking`,
                {
                    package_date_id: selectedDateId,
                    num_pax: passengers,
                    lead_booker_details: {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                    },
                    payment_type: formData.payment_type,
                },
                { headers: { 'Content-Type': 'application/json' } }
            )

            // Redirect to Stripe checkout URL
            if (response.data.checkoutUrl) {
                window.location.href = response.data.checkoutUrl
            } else {
                throw new Error('No checkout URL received')
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.error ||
                'Failed to initiate booking. Please try again.'
            setError(errorMessage)
            if (err.response?.status === 404) {
                setError('Selected tour date is not available.')
            } else if (err.response?.status === 409) {
                setError('Not enough slots available for this tour.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='booking-container'>
            <h1 className='booking-title'>Book Your Tour</h1>
            <form
                className='booking-form'
                onSubmit={handleSubmit}
            >
                <div className='booking-form__group'>
                    <label className='booking-form__label'>Tour</label>
                    <p className='booking-form__value'>{title}</p>
                </div>
                <div className='booking-form__group'>
                    <label className='booking-form__label'>Date</label>
                    <p className='booking-form__value'>
                        {new Date(selectedDate.start_date).toLocaleDateString()}{' '}
                        - {new Date(selectedDate.end_date).toLocaleDateString()}
                    </p>
                </div>
                <div className='booking-form__group'>
                    <label className='booking-form__label'>Passengers</label>
                    <p className='booking-form__value'>{passengers}</p>
                </div>
                <div className='booking-form__group'>
                    <label
                        className='booking-form__label'
                        htmlFor='firstName'
                    >
                        First Name
                    </label>
                    <input
                        type='text'
                        id='firstName'
                        name='firstName'
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className='booking-form__input'
                        required
                        disabled={loading}
                    />
                </div>
                <div className='booking-form__group'>
                    <label
                        className='booking-form__label'
                        htmlFor='lastName'
                    >
                        Last Name
                    </label>
                    <input
                        type='text'
                        id='lastName'
                        name='lastName'
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className='booking-form__input'
                        required
                        disabled={loading}
                    />
                </div>
                <div className='booking-form__group'>
                    <label
                        className='booking-form__label'
                        htmlFor='email'
                    >
                        Email
                    </label>
                    <input
                        type='email'
                        id='email'
                        name='email'
                        value={formData.email}
                        onChange={handleInputChange}
                        className='booking-form__input'
                        required
                        disabled={loading}
                    />
                </div>
                <div className='booking-form__group'>
                    <label
                        className='booking-form__label'
                        htmlFor='phone'
                    >
                        Phone
                    </label>
                    <input
                        type='tel'
                        id='phone'
                        name='phone'
                        value={formData.phone}
                        onChange={handleInputChange}
                        className='booking-form__input'
                        required
                        disabled={loading}
                    />
                </div>
                <div className='booking-form__group'>
                    <label
                        className='booking-form__label'
                        htmlFor='payment_type'
                    >
                        Payment Type
                    </label>
                    <select
                        id='payment_type'
                        name='payment_type'
                        value={formData.payment_type}
                        onChange={handleInputChange}
                        className='booking-form__input'
                        disabled={loading}
                    >
                        <option value='FULL'>Full Payment</option>
                        <option value='RESERVATION'>Reservation</option>
                    </select>
                </div>
                {formData.payment_type === 'RESERVATION' && (
                    <div className='booking-form__group'>
                        <label
                            className='booking-form__label'
                            htmlFor='payment_type'
                        >
                            Reservation Fee Per Pax
                        </label>
                        <input
                            className='booking-form__input'
                            type='text'
                            disabled
                            defaultValue={`PHP ${reservation_per_pax}`}
                        />
                    </div>
                )}
                {error && <p className='booking-form__error'>{error}</p>}
                <button
                    type='submit'
                    className='booking-form__submit'
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Confirm & Proceed to Payment'}
                </button>
            </form>
        </div>
    )
}

export default TourBooking
