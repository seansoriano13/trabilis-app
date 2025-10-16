import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useSnackbar } from '../../context/SnackbarContext'

function VisaProcessingSuccess() {
    const { search } = useLocation()
    const navigate = useNavigate()
    const { showSuccess, showError } = useSnackbar()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [processingDetails, setProcessingDetails] = useState(null)

    const inquiryReference = useMemo(() => {
        const params = new URLSearchParams(search)
        return params.get('inquiry_reference')
    }, [search])

    const fetchProcessingDetails = async () => {
        if (!inquiryReference) {
            setError('Inquiry reference missing')
            setLoading(false)
            return
        }
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/visa/inquiries/track?inquiryReference=${inquiryReference}`
            )

            if (!response.data) {
                setError('Processing data not found')
                setLoading(false)
                return
            }

            setProcessingDetails({
                inquiryReference: response.data.inquiry_reference,
                status: response.data.status,
                conversionStatus: response.data.conversion_status,
                fullName: response.data.full_name,
                visaType: response.data.visa_type,
                destination: response.data.destination,
                submittedAt: response.data.created_at
            })
        } catch (err) {
            console.error('Error fetching processing details:', err)
            setError('Failed to verify processing status. Please try again shortly.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProcessingDetails()
    }, [inquiryReference])

    const getContent = () => {
        if (loading) {
            return {
                title: 'Verifying Your Payment...',
                message: 'Please wait while we confirm your visa processing details.',
                buttonText: null,
            }
        }
        if (error) {
            return {
                title: 'Processing Error',
                message: error,
                buttonText: 'Try Again',
                buttonAction: () => fetchProcessingDetails(),
            }
        }
        if (processingDetails?.conversionStatus === 'CONVERTED') {
            return {
                title: 'Visa Processing Started!',
                message: `Your visa processing for ${processingDetails.visaType} to ${processingDetails.destination} has been successfully initiated. Check your email for detailed instructions and document requirements.`,
                buttonText: 'Return to Home',
                buttonAction: () => navigate('/'),
            }
        }
        return {
            title: 'Processing Your Payment',
            message: 'Your payment is being processed. You will receive an email confirmation soon.',
            buttonText: 'Return to Home',
            buttonAction: () => navigate('/'),
        }
    }

    const { title, message, buttonText, buttonAction } = getContent()

    return (
        <section
            id='sectionVisaProcessingSuccess'
            className='relative w-full min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50'
        >
            {/* Background Image with Overlay */}
            <div className='absolute inset-0'>
                <div className='absolute inset-0 bg-gradient-to-br from-green-900/50 via-emerald-800/50 to-teal-900/20'></div>
                <div className='absolute inset-0 bg-white/10'></div>
            </div>

            {/* Floating Elements */}
            <div className='absolute top-10 left-10 w-20 h-20 bg-green-400/20 rounded-full blur-xl animate-pulse'></div>
            <div className='absolute top-32 right-16 w-16 h-16 bg-emerald-400/20 rounded-full blur-lg animate-pulse delay-1000'></div>
            <div className='absolute bottom-20 left-20 w-24 h-24 bg-teal-400/20 rounded-full blur-2xl animate-pulse delay-2000'></div>

            <div className='relative w-full max-w-6xl mx-auto pt-[var(--default-padding-top)] pb-10 lg:pt-25 md:pt-35 flex flex-col justify-center min-h-screen'>
                <div className='max-w-4xl mx-auto'>
                    {/* Main Card */}
                    <div className='bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 lg:p-12 animate-fadeIn'>
                        {/* Header */}
                        <div className='text-center mb-8'>
                            <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg'>
                                <i className='bi-passport text-white text-3xl'></i>
                            </div>
                            <h1 className='text-2xl lg:text-3xl font-bold text-gray-800 mb-2'>
                                Visa Processing Status
                            </h1>
                            <h3 className='text-3xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'>
                                {title}
                            </h3>
                            <p className='mt-6 text-gray-600 text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto'>
                                {message}
                            </p>
                        </div>

                        {/* Processing Reference Card */}
                        {inquiryReference && (
                            <div className='bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 border border-gray-200 shadow-lg'>
                                <div className='flex items-center justify-between mb-4'>
                                    <span className='font-semibold text-gray-700 flex items-center gap-2 text-lg'>
                                        <i className='bi-ticket-perforated text-green-500'></i>
                                        Inquiry Reference
                                    </span>
                                    <span className='font-mono text-xl font-bold text-green-600 bg-green-50 px-4 py-2 rounded-xl border border-green-200'>
                                        {inquiryReference}
                                    </span>
                                </div>
                                {processingDetails?.conversionStatus && (
                                    <div className='flex items-center justify-between mb-3'>
                                        <span className='font-semibold text-gray-700 flex items-center gap-2'>
                                            <i className='bi-clock text-emerald-500'></i>
                                            Processing Status
                                        </span>
                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                            processingDetails.conversionStatus === 'CONVERTED'
                                                ? 'bg-green-100 text-green-800 border border-green-200'
                                                : processingDetails.conversionStatus === 'AWAITING_PAYMENT'
                                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                                        }`}>
                                            {processingDetails.conversionStatus.replace('_', ' ')}
                                        </span>
                                    </div>
                                )}
                                {processingDetails?.submittedAt && (
                                    <div className='flex items-center justify-between'>
                                        <span className='font-semibold text-gray-700 flex items-center gap-2'>
                                            <i className='bi-calendar text-teal-500'></i>
                                            Submitted
                                        </span>
                                        <span className='text-gray-600'>{new Date(processingDetails.submittedAt).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Processing Details Grid */}
                        {processingDetails && (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                                {processingDetails.fullName && (
                                    <div className='bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200 md:col-span-2 shadow-lg'>
                                        <div className='flex items-center gap-3 mb-3'>
                                            <i className='bi-person text-green-500 text-xl'></i>
                                            <div className='font-semibold text-green-800 text-lg'>Client Name</div>
                                        </div>
                                        <div className='text-xl font-bold text-green-900'>{processingDetails.fullName}</div>
                                    </div>
                                )}
                                {processingDetails.visaType && (
                                    <div className='bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl p-6 border border-emerald-200 shadow-lg'>
                                        <div className='flex items-center gap-3 mb-3'>
                                            <i className='bi-file-text text-emerald-500 text-xl'></i>
                                            <div className='font-semibold text-emerald-800 text-lg'>Visa Type</div>
                                        </div>
                                        <div className='text-xl font-bold text-emerald-900'>{processingDetails.visaType}</div>
                                    </div>
                                )}
                                {processingDetails.destination && (
                                    <div className='bg-gradient-to-br from-teal-50 to-cyan-100 rounded-2xl p-6 border border-teal-200 shadow-lg'>
                                        <div className='flex items-center gap-3 mb-3'>
                                            <i className='bi-geo-alt text-teal-500 text-xl'></i>
                                            <div className='font-semibold text-teal-800 text-lg'>Destination</div>
                                        </div>
                                        <div className='text-xl font-bold text-teal-900'>{processingDetails.destination}</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className='flex flex-wrap items-center justify-center gap-4'>
                            {buttonText && (
                                <button
                                    onClick={buttonAction}
                                    className='px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-2xl hover:from-gray-900 hover:to-black transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                                >
                                    <i className='bi-house mr-2 text-lg'></i>
                                    {buttonText}
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/track-booking')}
                                className='px-8 py-4 bg-white text-gray-800 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                            >
                                <i className='bi-search mr-2 text-lg'></i>
                                Track Another Booking
                            </button>
                        </div>

                        {/* Support Info */}
                        <div className='mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200'>
                            <p className='text-center text-gray-600'>
                                <i className='bi-headset mr-2 text-green-500 text-lg'></i>
                                Need help? Contact our visa processing team at{' '}
                                <a 
                                    className='text-green-600 hover:text-green-800 font-semibold underline decoration-2 underline-offset-2' 
                                    href='mailto:lindelatravelctws@gmail.com'
                                >
                                    lindelatravelctws@gmail.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default VisaProcessingSuccess
