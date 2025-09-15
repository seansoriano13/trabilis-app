import React, { useState } from 'react'
import './TrackBooking.css'
import PrimaryButton from '../../components/client/PrimaryButton'
import greatPyramidOfGazaDesktop from '/images/great-pyramid.jpg'
import greatPyramidOfGazaMobile from '../../assets/great-pyramid-of-giza-mobile.jpg'
import { GiAirplaneDeparture } from 'react-icons/gi'
import axios from 'axios'

function TrackBooking() {
    const [isLoading, setIsLoading] = useState()
    const [bookingRef, setBookingRef] = useState('')
    const [bookingType, setBookingType] = useState('flight')
    const [result, setResult] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const res = await axios.get(
                `${
                    import.meta.env.VITE_BACKEND_URL
                }/api/v1/bookings/track-booking?bookingReference=${bookingRef}&bookingType=${bookingType}`
            )
            console.log(res)
            setResult(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className='track-booking'>
            <picture>
                {/* Desktop */}
                <source
                    srcSet={greatPyramidOfGazaDesktop}
                    media='(min-width: 1024px)' // Tailwind's lg breakpoint
                />

                {/* Mobile fallback */}
                <img
                    className='destinations__hero-mobile'
                    src={greatPyramidOfGazaMobile}
                    alt='great-pyramid-of-giza'
                />
            </picture>
            <div className='p-14 h-1/3 max-w-[1200px] mx-auto'>
                <div className='text-6xl font-bold text-white'>
                    Track Your Booking
                </div>
                <div className='text-white mt-3 text-lg'>
                    Lindela offers convenient way to track flights and tour
                    package.
                </div>
            </div>
            <div className='bg-white p-8'>
                <div className='max-w-[1200px] mx-auto font-bold text-3xl text-[#333] '>
                    Stay updated on your bookings
                </div>
                <form
                    onSubmit={handleSubmit}
                    className='max-w-[1200px] mx-auto shadow-md rounded-lg border border-gray-200 p-8 mt-8'
                >
                    <div className='lg:flex md:flex gap-8 justify-between grid'>
                        <div className='grid lg:flex md:flex gap-8'>
                            <div className='radio-input'>
                                <label>
                                    <input
                                        type='radio'
                                        name='value-radio'
                                        value='flight'
                                        checked={bookingType === 'flight'}
                                        onChange={(e) =>
                                            setBookingType(e.target.value)
                                        }
                                    />
                                    <span>Flight</span>
                                </label>
                                <label>
                                    <input
                                        type='radio'
                                        name='value-radio'
                                        value='tour'
                                        checked={bookingType === 'tour'}
                                        onChange={(e) =>
                                            setBookingType(e.target.value)
                                        }
                                    />
                                    <span>Tour Package</span>
                                </label>
                                <span className='selection'></span>
                            </div>
                            <div className=''>
                                <input
                                    type='text'
                                    className='rounded-md border border-gray-300 h-full'
                                    placeholder='Booking Reference'
                                    value={bookingRef}
                                    onChange={(e) =>
                                        setBookingRef(e.target.value)
                                    }
                                />
                                <div className='text-xs text-gray-400 italic absolute'>
                                    TRB-FLT for Flight / TRB-TOUR for Tour
                                    Package
                                </div>
                            </div>
                        </div>

                        <div>
                            <PrimaryButton
                                buttonText={
                                    isLoading ? 'Checking...' : 'Check Status'
                                }
                                isBold={true}
                                className='px-4 py-4'
                            />
                        </div>
                    </div>
                </form>
                {result && (
                    <div className='max-w-[1200px] mx-auto flight-card shadow-md rounded-lg border border-gray-200 p-6 bg-white mt-8'>
                        {/* Route */}
                        <div className='text-lg font-semibold text-gray-800 mb-4'>
                            MNL to CEB
                        </div>

                        <div className='flex flex-col lg:flex-row justify-between gap-6'>
                            {/* Flight Details */}
                            <div className='flex-1'>
                                {/* Dates */}
                                <div className='flex justify-between text-gray-600 text-sm mb-2'>
                                    <div>Thu 11 Sep 2025</div>
                                    <div>Thu 11 Sep 2025</div>
                                </div>

                                {/* Times */}
                                <div className='flex items-center gap-3 mb-2'>
                                    <div className='text-lg font-medium text-gray-900'>
                                        4:50 PM
                                    </div>
                                    <div className='flex items-center flex-1'>
                                        <span className='dot'></span>
                                        <span className='line flex-1'></span>
                                        <span className='dot'></span>
                                    </div>
                                    <div className='text-lg font-medium text-gray-900'>
                                        6:20 PM
                                    </div>
                                </div>

                                {/* Airports */}
                                <div className='flex justify-between text-sm text-gray-700'>
                                    <div>
                                        CEB - Mactan-Cebu International Airport,
                                        Philippines
                                    </div>
                                    <div className='text-right'>
                                        CEB - Mactan-Cebu International Airport,
                                        Philippines
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className='vertical-line hidden lg:block'></div>

                            {/* Flight Status */}
                            <div className='flex-1'>
                                <div className='text-sm text-gray-500 mb-1'>
                                    Actual
                                </div>
                                <div className='flex justify-between text-gray-600 text-sm mb-2'>
                                    <div>Thu 11 Sep 2025</div>
                                    <div>Thu 11 Sep 2025</div>
                                </div>

                                <div className='flex items-center gap-3 mb-2'>
                                    <div className='text-lg font-medium text-gray-900'>
                                        4:50 PM
                                    </div>
                                    <div className='flex items-center flex-1'>
                                        <span className='dot'></span>
                                        <span className='line flex-1'></span>
                                        <span className='dot'></span>
                                    </div>
                                    <div className='text-lg font-medium text-gray-900'>
                                        6:20 PM
                                    </div>
                                </div>

                                <div className='flex justify-between'>
                                    <span className='status departed'>
                                        Departed
                                    </span>
                                    <span className='status arrived'>
                                        Arrived
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className='flex items-center justify-between border-t pt-3 mt-4 text-sm text-gray-200'>
                            <div className='flex items-center gap-2 text-gray-600'>
                                <GiAirplaneDeparture className='text-blue-900' />
                                <span className='font-semibold text-gray-600'>
                                    PR 2313
                                </span>
                            </div>
                            <div className='text-gray-600 flex gap-1'>
                                <div>This flight is operated by</div>
                                <div>PAL Express</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default TrackBooking
