import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { IoPersonCircle } from 'react-icons/io5'
import './TourBooking.css'
import flightsHeroDesktop from '/images/flights-hero-desktop.jpg'
import { PassengerForm } from './PassengerDetails.jsx'

const PrimaryButton = ({ onClick, className, buttonText, isBold, loading }) => (
    <button
        type='button'
        onClick={onClick}
        className={`w-full py-3 px-4 bg-yellow-500 text-black font-${
            isBold ? 'semibold' : 'medium'
        } rounded-md shadow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${className}`}
        disabled={loading}
    >
        {loading ? 'Processing...' : buttonText}
    </button>
)

function TourBooking() {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const { state } = useLocation()
    const { selectedDateId, passengers, selectedDate, title } = state
    const totalPassengers = passengers.adults + passengers.children

    // passengers data like flights (but no documents)
    const [formData, setFormData] = useState({
        passengers: Array.from({ length: totalPassengers }, (_, i) => ({
            id: `${i + 1}`,
            type: i < passengers.adults ? 'Adult' : 'Child',
            title: 'mr',
            name: {
                firstName: '',
                lastName: '',
            },
            gender: 'MALE',
            dateOfBirth: '',
            contact: {
                emailAddress: i === 0 ? '' : undefined, // only lead passenger has contact info
                phones: [
                    {
                        deviceType: 'MOBILE',
                        countryCallingCode: '63',
                        number: i === 0 ? '' : undefined,
                    },
                ],
            },
            documents: [], // tour booking doesn't need passport documents
        })),
        payment_type: 'FULL',
    })

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const reservation_per_pax = state.dates[0].reservation_fee_per_pax

    const handlePassengerChange = (index, field, value) => {
        setFormData((prev) => {
            const updated = [...prev.passengers]
            const keys = field.split('.')
            let target = updated[index]
            
            // Handle nested field updates (like 'name.firstName', 'contact.emailAddress', etc.)
            for (let i = 0; i < keys.length - 1; i++) {
                if (keys[i].includes('[') && keys[i].includes(']')) {
                    // Handle array access like 'phones[0]'
                    const arrayName = keys[i].split('[')[0]
                    const arrayIndex = parseInt(keys[i].split('[')[1].split(']')[0])
                    target = target[arrayName] = target[arrayName] || []
                    target = target[arrayIndex] = target[arrayIndex] || {}
                } else {
                    target = target[keys[i]] = target[keys[i]] || {}
                }
            }
            
            const finalKey = keys[keys.length - 1]
            if (finalKey.includes('[') && finalKey.includes(']')) {
                // Handle array access for final key
                const arrayName = finalKey.split('[')[0]
                const arrayIndex = parseInt(finalKey.split('[')[1].split(']')[0])
                target[arrayName] = target[arrayName] || []
                target[arrayName][arrayIndex] = value
            } else {
                target[finalKey] = value
            }
            
            return { ...prev, passengers: updated }
        })
        setError(null)
    }

    const handlePaymentTypeChange = (e) => {
        const { value } = e.target
        setFormData((prev) => ({ ...prev, payment_type: value }))
    }

    const validateForm = () => {
        const lead = formData.passengers[0]
        
        // Validate lead passenger (required for booking)
        if (!lead.name.firstName?.trim())
            return 'Lead passenger first name is required'
        if (!lead.name.lastName?.trim())
            return 'Lead passenger last name is required'
        if (!lead.contact.emailAddress?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
            return 'Valid email is required for lead passenger'
        if (!lead.contact.phones[0]?.number?.match(/^\d{10,15}$/))
            return 'Valid phone number is required for lead passenger'

        // Validate other passengers (just need names)
        for (let i = 1; i < formData.passengers.length; i++) {
            const passenger = formData.passengers[i]
            if (!passenger.name.firstName?.trim())
                return `First name is required for passenger ${i + 1}`
            if (!passenger.name.lastName?.trim())
                return `Last name is required for passenger ${i + 1}`
        }
        return null
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
            // Extract lead passenger info (first passenger)
            const leadPassenger = formData.passengers[0]
            
            const response = await axios.post(
                `${
                    import.meta.env.VITE_BACKEND_URL
                }/api/v1/destinations/tour/booking`,
                {
                    package_date_id: selectedDateId,
                    num_pax: totalPassengers,
                    lead_booker_details: {
                        firstName: leadPassenger.name.firstName,
                        lastName: leadPassenger.name.lastName,
                        email: leadPassenger.contact.emailAddress,
                        phone: leadPassenger.contact.phones[0].number,
                    },
                    payment_type: formData.payment_type,
                },
                { headers: { 'Content-Type': 'application/json' } }
            )

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
        } finally {
            setLoading(false)
        }
    }

    const paxCount = totalPassengers
    const perPax = selectedDate?.rate_per_pax || 0
    const baseTotal = perPax * paxCount
    const rules = selectedDate?.fee_rules || { perRemovedGroup: 5000, perRestDay: 3000, minFee: 5000, maxFee: 50000 }
    const customization = state?.customization
    let customizationFee = 0
    if (customization?.enabled) {
        // Prefer clientTotals from previous screen if present
        customizationFee = customization?.clientTotals?.customizationFee ?? 0
        if (!customization?.clientTotals) {
            const groups = customization?.removedInclusionGroupIds?.length || 0
            const rests = customization?.restDayNumbers?.length || 0
            const uncapped = groups * (rules.perRemovedGroup || 0) + rests * (rules.perRestDay || 0)
            customizationFee = uncapped
            if (customizationFee > 0 && customizationFee < (rules.minFee || 0)) customizationFee = rules.minFee || 0
            if (customizationFee > (rules.maxFee || Number.MAX_SAFE_INTEGER)) customizationFee = rules.maxFee
        }
    }
    const grandTotal = baseTotal + customizationFee

    return (
        <div className='passenger-details passenger-details--tour pt-[var(--default-padding-top)] lg:pt-25 md:pt-35'>
            <div className='hero-background'>
                <img
                    className='hero-image'
                    src={flightsHeroDesktop}
                    alt='Tour Hero'
                />
            </div>

            <div className='max-w-[1200px] mx-auto w-screen px-4 lg:px-0'>
                <div className='grid lg:grid-cols-3 gap-6'>
                    <div className='lg:col-span-2'>
                        <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
                            <h2 className='passenger-details__form-title'>
                                <IoPersonCircle />
                                Passenger Information
                            </h2>
                            <PassengerForm
                                passengers={formData.passengers}
                                handleChange={handlePassengerChange}
                                validationErrors={[]}
                                setValidationErrors={() => {}}
                            />

                            <div className='mt-6'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Payment Type</label>
                                <div className='inline-flex rounded-md border border-gray-300 overflow-hidden'>
                                    <button
                                        type='button'
                                        className={`px-4 py-2 text-sm ${formData.payment_type === 'FULL' ? 'bg-[#f7d100] text-black' : 'bg-white text-gray-700'}`}
                                        onClick={() => setFormData((p) => ({ ...p, payment_type: 'FULL' }))}
                                        disabled={loading}
                                    >
                                        Full Payment
                                    </button>
                                    <button
                                        type='button'
                                        className={`px-4 py-2 text-sm border-l border-gray-300 ${formData.payment_type === 'RESERVATION' ? 'bg-[#f7d100] text-black' : 'bg-white text-gray-700'}`}
                                        onClick={() => setFormData((p) => ({ ...p, payment_type: 'RESERVATION' }))}
                                        disabled={loading}
                                    >
                                        Reservation
                                    </button>
                                </div>

                                {formData.payment_type === 'RESERVATION' && (
                                    <div className='mt-3'>
                                        <label className='block text-sm font-medium text-gray-700'>Reservation Fee Per Pax</label>
                                        <input
                                            type='text'
                                            disabled
                                            defaultValue={`PHP ${reservation_per_pax}`}
                                            className='mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm py-2 px-3'
                                        />
                                    </div>
                                )}

                                {error && (
                                    <p className='mt-3 text-red-600 text-sm font-medium'>{error}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <aside className='lg:col-span-1'>
                        <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-24'>
                            <h3 className='text-base font-semibold text-gray-800'>Booking Summary</h3>
                            <div className='mt-3 space-y-2 text-sm text-gray-700'>
                                <div className='flex justify-between'><span>Tour</span><span className='font-medium text-right max-w-[60%]'>{title}</span></div>
                                <div className='flex justify-between'><span>Dates</span><span className='font-medium'>{new Date(selectedDate.start_date).toLocaleDateString()} - {new Date(selectedDate.end_date).toLocaleDateString()}</span></div>
                                <div className='flex justify-between'><span>Passengers</span><span className='font-medium'>{totalPassengers}</span></div>
                                {perPax > 0 && (
                                    <div className='flex justify-between'><span>Rate per Pax</span><span className='font-medium'>PHP {perPax.toLocaleString()}</span></div>
                                )}
                            </div>
                            <div className='mt-4 border-t border-gray-200 pt-4 space-y-2 text-sm'>
                                <div className='flex justify-between'><span>Base Total</span><span className='font-semibold'>PHP {baseTotal.toLocaleString()}</span></div>
                                {customization?.enabled && (
                                    <div className='flex justify-between'><span>Customization Fee</span><span className='font-semibold'>PHP {customizationFee.toLocaleString()}</span></div>
                                )}
                                <div className='flex justify-between text-base font-bold pt-1 mt-1 border-t border-gray-200'><span>Grand Total</span><span>PHP {grandTotal.toLocaleString()}</span></div>
                            </div>

                            <PrimaryButton
                                onClick={handleSubmit}
                                className='mt-6'
                                buttonText='Proceed To Payment'
                                isBold={true}
                                loading={loading}
                            />
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

export default TourBooking
