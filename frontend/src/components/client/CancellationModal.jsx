import React, { useState, useEffect } from 'react'
import { BsX, BsExclamationTriangle } from 'react-icons/bs'
import axios from 'axios'

const CancellationModal = ({ 
    isOpen, 
    onClose, 
    bookingReference, 
    onCancellationSuccess 
}) => {
    const [cancellationInfo, setCancellationInfo] = useState(null)
    const [loading, setLoading] = useState(false)
    const [cancelling, setCancelling] = useState(false)
    const [reason, setReason] = useState('')
    const [error, setError] = useState('')

    // Fetch cancellation info when modal opens
    useEffect(() => {
        if (isOpen && bookingReference) {
            fetchCancellationInfo()
        }
    }, [isOpen, bookingReference])

    const fetchCancellationInfo = async () => {
        setLoading(true)
        setError('')
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/bookings/cancellation-info`,
                { params: { booking_reference: bookingReference } }
            )
            setCancellationInfo(response.data)
        } catch (err) {
            console.error('Failed to fetch cancellation info:', err)
            setError('Failed to load cancellation information')
        } finally {
            setLoading(false)
        }
    }

    const handleCancelBooking = async () => {
        if (!reason.trim()) {
            setError('Please provide a reason for cancellation')
            return
        }

        setCancelling(true)
        setError('')
        
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/bookings/cancel`,
                { 
                    booking_reference: bookingReference,
                    reason: reason.trim()
                }
            )
            
            if (response.data.success) {
                onCancellationSuccess(response.data.data)
                onClose()
            } else {
                setError(response.data.error || 'Cancellation failed')
            }
        } catch (err) {
            console.error('Cancellation failed:', err)
            setError(err.response?.data?.error || 'Failed to cancel booking')
        } finally {
            setCancelling(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        Cancel Booking
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <BsX size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading cancellation information...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <BsExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={fetchCancellationInfo}
                                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : !cancellationInfo?.canCancel ? (
                        <div className="text-center py-8">
                            <BsExclamationTriangle className="text-orange-500 text-4xl mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Cannot Cancel Booking
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {cancellationInfo?.blockReason || 'This booking cannot be cancelled'}
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4 text-left">
                                <p className="text-sm text-gray-600">
                                    <strong>Booking Status:</strong> {cancellationInfo?.status}
                                </p>
                                {cancellationInfo?.hasDeparted && (
                                    <p className="text-sm text-red-600 mt-1">
                                        <strong>Note:</strong> Flight has already departed
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Warning Section */}
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <BsExclamationTriangle className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-red-800 font-bold text-lg mb-2">
                                            ⚠️ NON-REFUNDABLE BOOKING
                                        </h3>
                                        <p className="text-red-700 text-sm mb-2">
                                            This booking has been confirmed with the airline. 
                                            Cancelling now will <strong>forfeit 100% of your payment</strong> 
                                            as per our non-refundable policy.
                                        </p>
                                        <p className="text-red-700 font-bold">
                                            Total paid: <strong>₱{cancellationInfo?.totalAmount?.toLocaleString() || '0'}</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Details */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-gray-900 mb-2">Booking Details</h4>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p><strong>Reference:</strong> {bookingReference}</p>
                                    <p><strong>Status:</strong> {cancellationInfo?.status}</p>
                                    <p><strong>Amount:</strong> ₱{cancellationInfo?.totalAmount?.toLocaleString() || '0'}</p>
                                    {cancellationInfo?.departureTime && (
                                        <p><strong>Departure:</strong> {new Date(cancellationInfo.departureTime).toLocaleString()}</p>
                                    )}
                                </div>
                            </div>

                            {/* Cancellation Reason */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Cancellation *
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please provide a reason for cancelling this booking..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                    rows={3}
                                    required
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={cancelling}
                                >
                                    Keep Booking
                                </button>
                                <button
                                    onClick={handleCancelBooking}
                                    disabled={cancelling || !reason.trim()}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {cancelling ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                                            <span className="ml-2">Cancelling...</span>
                                        </>
                                    ) : (
                                        'Confirm Cancellation'
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CancellationModal
