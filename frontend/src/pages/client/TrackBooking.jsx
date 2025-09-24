import React, { useEffect, useState } from 'react'
import './TrackBooking.css'
import PrimaryButton from '../../components/client/PrimaryButton'
import greatPyramidOfGazaDesktop from '/images/great-pyramid.jpg'
import greatPyramidOfGazaMobile from '../../assets/great-pyramid-of-giza-mobile.jpg'
import { GiAirplaneDeparture } from 'react-icons/gi'
import axios from 'axios'
import { getStatusStyle } from '../../utils/statusStyles.js'
import { useAirports } from '../../context/AirportContext.jsx'
import { getAirportInfoByIata } from '../../utils/getAirportInfoByIata.js'
import { getAirlineInfo } from '../../utils/airlinesUtils.js'

function TrackBooking() {
    const [isLoading, setIsLoading] = useState()
    const [bookingRef, setBookingRef] = useState('')
    const [bookingType, setBookingType] = useState('flight')
    const [result, setResult] = useState(null)

    const { airports } = useAirports()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            if (bookingType === 'visa') {
                const res = await axios.get(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/api/v1/visa/inquiries/track?inquiryReference=${bookingRef}`
                )
                setResult({ type: 'visa', inquiry: res.data })
            } else {
                const res = await axios.get(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/api/v1/bookings/track-booking?bookingReference=${bookingRef}&bookingType=${bookingType}`
                )
                setResult({ type: 'booking', ...res.data })
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    // Load on mount
    useEffect(() => {
        const saved = localStorage.getItem('bookingResult')
        if (saved) {
            setResult(JSON.parse(saved))
        }
    }, [])

    // Save whenever result changes
    useEffect(() => {
        if (result) {
            localStorage.setItem('bookingResult', JSON.stringify(result))
        }
    }, [result])

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
                                <label>
                                    <input
                                        type='radio'
                                        name='value-radio'
                                        value='visa'
                                        checked={bookingType === 'visa'}
                                        onChange={(e) =>
                                            setBookingType(e.target.value)
                                        }
                                    />
                                    <span>Visa Inquiry</span>
                                </label>
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
                                <div className='text-xs text-gray-400 italic'>
                                    TRB-FLT for Flight / TRB-TOUR for Tour Package / TRB-VISA for Visa
                                </div>
                            </div>
                        </div>

                        <div>
                            <PrimaryButton
                                buttonText={
                                    isLoading ? 'Checking...' : 'Track Me'
                                }
                                isBold={true}
                                className='px-4 py-4'
                            />
                        </div>
                    </div>
                </form>
                {result?.type === 'booking' && bookingType === 'flight' && result?.bookingData?.outbound && (
                    <div className='max-w-[1200px] mx-auto flight-card shadow-md rounded-lg border border-gray-200 p-6 bg-white mt-8'>
                        {/* Route */}
                        <div className='text-lg font-semibold text-gray-800 mb-4'>
                            {
                                getAirportInfoByIata(
                                    result.bookingData.outbound.departure.iata,
                                    airports
                                ).city
                            }{' '}
                            to{' '}
                            {
                                getAirportInfoByIata(
                                    result.bookingData.outbound.arrival.iata,
                                    airports
                                ).city
                            }
                        </div>

                        <div className='flex flex-col lg:flex-row justify-between gap-6'>
                            {/* Flight Details */}
                            <div className='flex-1'>
                                {/* Dates */}
                                <div className='flex justify-between text-gray-600 text-sm mb-2'>
                                    <div>
                                        {
                                            result.bookingData.outbound
                                                .departure.date
                                        }
                                    </div>
                                    <div>
                                        {
                                            result.bookingData.outbound.arrival
                                                .date
                                        }
                                    </div>
                                </div>

                                {/* Times */}
                                <div className='flex items-center gap-3 mb-2'>
                                    <div className='text-lg font-medium text-gray-900'>
                                        {
                                            result.bookingData.outbound
                                                .departure.time
                                        }
                                    </div>
                                    <div className='flex items-center flex-1'>
                                        <span className='dot'></span>
                                        <span className='line flex-1'></span>
                                        <span className='dot'></span>
                                    </div>
                                    <div className='text-lg font-medium text-gray-900'>
                                        {
                                            result.bookingData.outbound.arrival
                                                .time
                                        }
                                    </div>
                                </div>

                                {/* Airports */}
                                <div className='flex justify-between text-sm text-gray-700'>
                                    <div>
                                        {
                                            getAirportInfoByIata(
                                                result.bookingData.outbound
                                                    .departure.iata,
                                                airports
                                            ).name
                                        }{' '}
                                        Terminal{' '}
                                        {
                                            result.bookingData.outbound
                                                .departure.terminal
                                        }
                                    </div>
                                    <div className='text-right'>
                                        {
                                            getAirportInfoByIata(
                                                result.bookingData.outbound
                                                    .arrival.iata,
                                                airports
                                            ).name
                                        }{' '}
                                        Terminal{' '}
                                        {
                                            result.bookingData.outbound.arrival
                                                .terminal
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className='vertical-line hidden lg:block'></div>

                            {/* Flight Status */}
                            <div className='flex-1'>
                                <div className='text-md font-bold text-gray-500 mb-1'>
                                    Status
                                </div>
                                <div className='flex justify-between text-gray-600 text-sm mb-2'>
                                    <div>
                                        {
                                            result.bookingData.outbound
                                                .departure.date
                                        }
                                    </div>
                                    <div>
                                        {
                                            result.bookingData.outbound.arrival
                                                .date
                                        }
                                    </div>
                                </div>

                                <div className='flex items-center gap-3 mb-2'>
                                    <div className='text-lg font-medium text-gray-900'>
                                        {
                                            result.bookingData.outbound
                                                .departure.time
                                        }
                                    </div>
                                    <div className='flex items-center flex-1'>
                                        <span className='dot'></span>
                                        <span className='line flex-1'></span>
                                        <span className='dot'></span>
                                    </div>
                                    <div className='text-lg font-medium text-gray-900'>
                                        {
                                            result.bookingData.outbound.arrival
                                                .time
                                        }
                                    </div>
                                </div>

                                <div className='flex justify-between'>
                                    <span
                                        className={getStatusStyle(
                                            result.bookingData.outbound
                                                .departure.status
                                        )}
                                    >
                                        {
                                            result.bookingData.outbound
                                                .departure.status
                                        }
                                    </span>
                                    <span
                                        className={getStatusStyle(
                                            result.bookingData.outbound.arrival
                                                .status
                                        )}
                                    >
                                        {
                                            result.bookingData.outbound.arrival
                                                .status
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className='flex items-center justify-between border-t pt-3 mt-4 text-sm text-gray-200'>
                            <div className='flex items-center gap-1 text-gray-600'>
                                <GiAirplaneDeparture className='text-blue-900' />
                                <span>Booking Reference: </span>
                                <span className='font-semibold text-gray-600'>
                                    {result.bookingReference}
                                </span>
                            </div>
                            <div className='text-gray-600 flex gap-1 items-center'>
                                <div>This flight is operated by</div>
                                <div className='flex items-center'>
                                    {getAirlineInfo(result.airlineCode).name}
                                    <img
                                        className='h-8'
                                        src={
                                            getAirlineInfo(result.airlineCode)
                                                .logo
                                        }
                                        alt={
                                            getAirlineInfo(result.airlineCode)
                                                .name
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {result?.type === 'visa' && result?.inquiry && (
                    <div className='max-w-[1200px] mx-auto shadow-md rounded-lg border border-gray-200 p-6 bg-white mt-8'>
                        <div className='text-lg font-semibold text-gray-800 mb-4'>
                            Visa Inquiry Status
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700'>
                            <div>
                                <div className='text-gray-500'>Reference</div>
                                <div className='font-medium'>{result.inquiry.inquiry_reference}</div>
                            </div>
                            <div>
                                <div className='text-gray-500'>Status</div>
                                <div className='font-medium'>{result.inquiry.status}</div>
                            </div>
                            <div>
                                <div className='text-gray-500'>Full Name</div>
                                <div className='font-medium'>{result.inquiry.full_name}</div>
                            </div>
                            <div>
                                <div className='text-gray-500'>Email</div>
                                <div className='font-medium'>{result.inquiry.email_address}</div>
                            </div>
                            <div>
                                <div className='text-gray-500'>Mobile</div>
                                <div className='font-medium'>{result.inquiry.mobile_number}</div>
                            </div>
                            <div>
                                <div className='text-gray-500'>Visa Type</div>
                                <div className='font-medium'>{result.inquiry.visa_type}</div>
                            </div>
                            <div>
                                <div className='text-gray-500'>Destination</div>
                                <div className='font-medium'>{result.inquiry.destination}</div>
                            </div>
                            <div>
                                <div className='text-gray-500'>Submitted</div>
                                <div className='font-medium'>{new Date(result.inquiry.created_at).toLocaleString()}</div>
                            </div>
                        </div>
                        {result.inquiry.message && (
                            <div className='mt-4'>
                                <div className='text-gray-500 text-sm mb-1'>Message</div>
                                <div className='text-gray-700 text-sm whitespace-pre-line'>{result.inquiry.message}</div>
                            </div>
                        )}
                    </div>
                )}
                {result?.type === 'booking' && bookingType === 'tour' && result?.bookingData?.tour && (
                    <div className='max-w-[1200px] mx-auto shadow-md rounded-lg border border-gray-200 p-6 bg-white mt-8'>
						<div className='flex items-center justify-between mb-4'>
							<div className='text-lg font-semibold text-gray-800'>
								Tour Booking Details
							</div>
							<span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200'>
								{result.bookingData.tour.status}
							</span>
						</div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mb-6'>
							<div>
								<div className='text-gray-500'>Reference</div>
								<div className='font-medium'>
									<span className='font-mono text-[13px] px-2 py-1 rounded-md bg-gray-50 border border-gray-200'>
										{result.bookingData.tour.booking_reference || result.bookingReference}
									</span>
								</div>
							</div>
                            <div>
                                <div className='text-gray-500'>Status</div>
                                <div className='font-medium'>{result.bookingData.tour.status}</div>
                            </div>
                            <div>
                                <div className='text-gray-500'>Title</div>
                                <div className='font-medium'>{result.bookingData.tour.title}</div>
                            </div>
                            <div>
                                <div className='text-gray-500'>Travel Dates</div>
                                <div className='font-medium'>
                                    {result.bookingData.tour.start_date} - {result.bookingData.tour.end_date}
                                </div>
                            </div>
                            <div>
                                <div className='text-gray-500'>Passengers</div>
                                <div className='font-medium'>{result.bookingData.tour.passenger_count}</div>
                            </div>
							<div>
								<div className='text-gray-500'>Payment Type</div>
								<div>
									<span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200'>
										{result.bookingData.tour.payment_type}
									</span>
								</div>
							</div>
							<div>
								<div className='text-gray-500'>Total Amount</div>
								<div className='font-semibold text-green-700 text-base'>₱ {Number(result.bookingData.tour.total_amount || 0).toLocaleString()}</div>
							</div>
							<div className='md:col-span-2'>
								<div className='text-gray-500'>Lead Contact</div>
								<div className='font-medium bg-gray-50 border border-gray-200 rounded-md p-3'>
									{result.bookingData.tour.lead_first_name} {result.bookingData.tour.lead_last_name} · {result.bookingData.tour.lead_email} · {result.bookingData.tour.lead_phone}
								</div>
							</div>
                        </div>

                        {/* Flight Details (if provided by admin) */}
                        {(() => {
                            const fd = result.bookingData.tour.flight_details
                            if (!fd) return null
                            const outbound = Array.isArray(fd.outbound) ? fd.outbound : (fd.outbound ? [fd.outbound] : [])
                            const inbound = Array.isArray(fd.return) ? fd.return : (fd.return ? [fd.return] : [])
							const renderSeg = (seg, idx) => (
								<div key={idx} className='grid grid-cols-1 md:grid-cols-5 gap-2 py-2 border-b text-sm text-gray-700'>
									<div className='font-medium text-gray-800'>{seg.airline || '-'}</div>
									<div className='text-gray-600'>{seg.flight_no || '-'}</div>
									<div className='text-gray-600'>{seg.departure || '-'}</div>
									<div className='text-gray-600'>{seg.arrival || '-'}</div>
									<div className='text-gray-600'>{seg.date ? new Date(seg.date).toLocaleString() : '-'}</div>
								</div>
							)
							return (
								<div className='mt-6 rounded-md border border-gray-200 bg-gray-50 p-4'>
									<div className='text-md font-semibold text-gray-800 mb-2'>Flight Details</div>
                                    {outbound.length > 0 && (
                                        <div className='mb-4'>
                                            <div className='text-gray-600 font-medium mb-1'>Outbound</div>
											<div className='text-[11px] uppercase tracking-wide text-gray-500 grid grid-cols-1 md:grid-cols-5 gap-2 pb-2 border-b'>
                                                <div>Airline</div>
                                                <div>Flight No.</div>
                                                <div>Departure</div>
                                                <div>Arrival</div>
                                                <div>Date</div>
                                            </div>
                                            {outbound.map(renderSeg)}
                                        </div>
                                    )}
                                    {inbound.length > 0 && (
                                        <div>
                                            <div className='text-gray-600 font-medium mb-1'>Return</div>
											<div className='text-[11px] uppercase tracking-wide text-gray-500 grid grid-cols-1 md:grid-cols-5 gap-2 pb-2 border-b'>
                                                <div>Airline</div>
                                                <div>Flight No.</div>
                                                <div>Departure</div>
                                                <div>Arrival</div>
                                                <div>Date</div>
                                            </div>
                                            {inbound.map(renderSeg)}
                                        </div>
                                    )}
                                </div>
                            )
                        })()}
                    </div>
                )}
            </div>
        </section>
    )
}

export default TrackBooking
