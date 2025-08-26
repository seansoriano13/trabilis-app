import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import './TourBooking.css'

function TourBooking() {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])
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
        <div className='max-w-lg mx-auto px-6 pb-6 pt-[var(--default-padding-top)] bg-white rounded-lg shadow-md'>
            <div className='text-3xl font-extrabold mb-6 text-gray-900'>
                Lead Passenger Details
            </div>

            <form
                onSubmit={handleSubmit}
                className='space-y-4'
            >
                {/* Tour */}
                <div>
                    <label className='block text-sm font-medium text-gray-700'>
                        Tour Package Name
                    </label>
                    <div className='mt-1 text-lg text-gray-900'>{title}</div>
                </div>

                {/* Date */}
                <div>
                    <label className='block text-sm font-medium text-gray-700'>
                        Date
                    </label>
                    <p className='mt-1 text-gray-900'>
                        {new Date(selectedDate.start_date).toLocaleDateString()}{' '}
                        - {new Date(selectedDate.end_date).toLocaleDateString()}
                    </p>
                </div>

                {/* Passengers */}
                <div>
                    <label className='block text-sm font-medium text-gray-700'>
                        Passengers
                    </label>
                    <p className='mt-1 text-gray-900'>{passengers}</p>
                </div>

                {/* First Name */}
                <div>
                    <label
                        htmlFor='firstName'
                        className='block text-sm font-medium text-gray-700'
                    >
                        First Name
                    </label>
                    <input
                        type='text'
                        id='firstName'
                        name='firstName'
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm'
                        required
                        disabled={loading}
                    />
                </div>

                {/* Last Name */}
                <div>
                    <label
                        htmlFor='lastName'
                        className='block text-sm font-medium text-gray-700'
                    >
                        Last Name
                    </label>
                    <input
                        type='text'
                        id='lastName'
                        name='lastName'
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm'
                        required
                        disabled={loading}
                    />
                </div>

                {/* Email */}
                <div>
                    <label
                        htmlFor='email'
                        className='block text-sm font-medium text-gray-700'
                    >
                        Email
                    </label>
                    <input
                        type='email'
                        id='email'
                        name='email'
                        value={formData.email}
                        onChange={handleInputChange}
                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm'
                        required
                        disabled={loading}
                    />
                </div>

                {/* Phone */}
                <div>
                    <label
                        htmlFor='phone'
                        className='block text-sm font-medium text-gray-700'
                    >
                        Phone
                    </label>
                    <input
                        type='tel'
                        id='phone'
                        name='phone'
                        value={formData.phone}
                        onChange={handleInputChange}
                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm'
                        required
                        disabled={loading}
                    />
                </div>

                {/* Payment Type */}
                <div>
                    <label
                        htmlFor='payment_type'
                        className='block text-sm font-medium text-gray-700'
                    >
                        Payment Type
                    </label>
                    <select
                        id='payment_type'
                        name='payment_type'
                        value={formData.payment_type}
                        onChange={handleInputChange}
                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm'
                        disabled={loading}
                    >
                        <option value='FULL'>Full Payment</option>
                        <option value='RESERVATION'>Reservation</option>
                    </select>
                </div>

                {/* Reservation Fee */}
                {formData.payment_type === 'RESERVATION' && (
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>
                            Reservation Fee Per Pax
                        </label>
                        <input
                            type='text'
                            disabled
                            defaultValue={`PHP ${reservation_per_pax}`}
                            className='mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm'
                        />
                    </div>
                )}

                {/* Error */}
                {error && <p className='text-red-600 text-sm'>{error}</p>}

                {/* Submit */}
                <button
                    type='submit'
                    className='w-full py-2 px-4 bg-[var(--color-yellow)] text-black font-medium rounded-md shadow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Confirm & Proceed to Payment'}
                </button>
            </form>
        </div>
    )
}

export default TourBooking
