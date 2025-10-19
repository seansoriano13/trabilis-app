import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

function CancelBooking() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [bookingDetails, setBookingDetails] = useState(null)

    const token = searchParams.get('token')

    useEffect(() => {
        if (!token) {
            setError('Invalid cancellation link')
            setLoading(false)
            return
        }

        // Verify and complete cancellation
        const verifyCancellation = async () => {
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/v1/cancel-booking/verify`,
                    { token }
                )

                if (response.data.success) {
                    setSuccess(true)
                    setBookingDetails(response.data.data)
                }
            } catch (error) {
                console.error('Cancellation verification error:', error)
                setError(
                    error.response?.data?.error ||
                        'Failed to verify cancellation'
                )
            } finally {
                setLoading(false)
            }
        }

        verifyCancellation()
    }, [token])

    if (loading) {
        return (
            <div className='fixed inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 z-50 p-4'>
                <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center flex flex-col items-center gap-6 animate-fadeIn'>
                    {/* Animated Loading Icon */}
                    <div className='relative'>
                        <div className='w-20 h-20 rounded-full flex items-center justify-center bg-red-100 animate-pulse'>
                            <div className='animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-500'></div>
                        </div>
                        <div className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce'>
                            <i className='bi-hourglass-split text-white text-xs'></i>
                        </div>
                    </div>

                    {/* Loading Message */}
                    <div className='space-y-3'>
                        <h3 className='font-bold text-2xl text-gray-800'>
                            Processing Cancellation
                        </h3>
                        <p className='text-gray-600 text-lg leading-relaxed'>
                            Please wait while we process your booking
                            cancellation...
                        </p>
                    </div>

                    {/* Loading Progress */}
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div className='bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full animate-pulse'></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className='fixed inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 z-50 p-4'>
                <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-center flex flex-col items-center gap-6 animate-fadeIn'>
                    {/* Animated Error Icon */}
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
                            Cancellation Failed
                        </h3>
                        <p className='text-gray-600 text-lg leading-relaxed max-w-lg mx-auto'>
                            {error}
                        </p>
                    </div>

                    {/* Error Details Card */}
                    <div className='w-full bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200'>
                        <div className='flex items-center gap-3 mb-3'>
                            <div className='text-2xl'>⚠️</div>
                            <div>
                                <h4 className='text-lg font-bold text-red-800'>
                                    What went wrong?
                                </h4>
                            </div>
                        </div>
                        <div className='text-left space-y-2 text-sm text-red-700'>
                            <p>• The cancellation link may have expired</p>
                            <p>• The booking may have already been cancelled</p>
                            <p>• There might be a technical issue</p>
                            <p>• Contact support for immediate assistance</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-wrap items-center justify-center gap-3 mt-6'>
                        <button
                            onClick={() => navigate('/track-booking')}
                            className='px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        >
                            <i className='bi-search mr-2'></i>
                            Track Bookings
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className='cursor-pointer px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl hover:from-gray-900 hover:to-black transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        >
                            <i className='bi-house mr-2'></i>
                            Go to Home
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

    if (success) {
        return (
            <div className='fixed inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 z-50 p-4'>
                <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-center flex flex-col items-center gap-6 animate-fadeIn'>
                    {/* Animated Success Icon */}
                    <div className='relative'>
                        <div className='w-24 h-24 rounded-full flex items-center justify-center bg-green-100 animate-pulse'>
                            <i className='bi-check-circle text-6xl text-green-500' />
                        </div>
                        <div className='absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce'>
                            <i className='bi-check text-white text-sm'></i>
                        </div>
                    </div>

                    {/* Title and Message */}
                    <div className='space-y-3'>
                        <h3 className='font-bold text-3xl text-gray-800'>
                            Booking Successfully Cancelled
                        </h3>
                        <p className='text-gray-600 text-lg leading-relaxed max-w-lg mx-auto'>
                            Your flight booking has been successfully cancelled.
                            You can start a new booking at any time.
                        </p>
                    </div>

                    {/* Booking Details Card - only show if available */}
                    {bookingDetails && (
                        <div className='w-full bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200'>
                            <div className='flex items-center justify-between mb-4'>
                                <span className='font-semibold text-gray-700 flex items-center gap-2'>
                                    <i className='bi-ticket-perforated text-green-500'></i>
                                    Cancelled Booking Reference
                                </span>
                                <span className='font-mono text-lg font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg'>
                                    {bookingDetails.bookingReference}
                                </span>
                            </div>
                            <div className='flex items-center justify-between'>
                                <span className='font-semibold text-gray-700 flex items-center gap-2'>
                                    <i className='bi-calendar-x text-green-500'></i>
                                    Cancelled At
                                </span>
                                <span className='px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200'>
                                    {new Date().toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Refund Policy Notice */}
                    <div className='w-full bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200'>
                        <div className='flex items-center gap-3 mb-3'>
                            <div className='text-2xl'>ℹ️</div>
                            <div>
                                <h4 className='text-lg font-bold text-yellow-800'>
                                    Important Information
                                </h4>
                            </div>
                        </div>
                        <div className='text-left space-y-2 text-sm text-yellow-700'>
                            <p>
                                • No refund will be issued as per our
                                non-refundable policy
                            </p>
                            <p>• Your booking has been completely cancelled</p>
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

    return null
}

export default CancelBooking
