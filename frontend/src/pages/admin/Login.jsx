import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import adminClient from '../../api/adminClient.js'

const AdminLogin = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        try {
            setIsLoading(true)
            const { data } = await adminClient.post('/login', {
                email,
                password,
            })
            localStorage.setItem('adminToken', data.token)
            localStorage.setItem('admin_email', data.email)
            localStorage.setItem('admin_role', data.role)
            navigate('/admin')
            setIsLoading(false)
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed')
            setIsLoading(false)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-black px-4'>
            <style jsx>{`
                .login-input {
                    background-color: #f9fafb !important;
                    border: 1px solid #e5e7eb !important;
                    color: #111827 !important;
                    border-radius: 0.5rem !important;
                    padding: 0.75rem 1rem 0.75rem 2.5rem !important;
                    width: 100% !important;
                    font-size: 1rem !important;
                    line-height: 1.5rem !important;
                    transition: all 0.2s ease-in-out !important;
                }
                .login-input:focus {
                    outline: none !important;
                    border-color: #f7d100 !important;
                    box-shadow: 0 0 0 2px rgba(247, 209, 0, 0.2) !important;
                }
                .login-input::placeholder {
                    color: #6b7280 !important;
                }
                .login-input-password {
                    padding-right: 3rem !important;
                }
            `}</style>
            <div className='w-full max-w-md'>
                {/* Logo/Brand Section */}
                <div className='text-center mb-8'>
                    <div className='inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg'>
                        <svg className='w-10 h-10' style={{color: '#f7d100'}} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                        </svg>
                    </div>
                    <h1 className='text-4xl font-bold text-white mb-2'>
                        Lindela Admin
                    </h1>
                    <p className='text-gray-300 text-sm'>
                        Secure access to your dashboard
                    </p>
                </div>

                {/* Login Form */}
                <div className='bg-white rounded-2xl shadow-2xl p-8'>
                    <form onSubmit={handleSubmit} className='space-y-6'>
                        {/* Email Field */}
                        <div className='space-y-2'>
                            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                                Email Address
                            </label>
                            <div className='relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207' />
                                    </svg>
                                </div>
                                <input
                                    id='email'
                                    type='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder='Enter your email'
                                    required
                                    className='login-input'
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className='space-y-2'>
                            <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                                Password
                            </label>
                            <div className='relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                                    </svg>
                                </div>
                                <input
                                    id='password'
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder='Enter your password'
                                    required
                                    className='login-input login-input-password'
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                                >
                                    {showPassword ? (
                                        <svg className='h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21' />
                                        </svg>
                                    ) : (
                                        <svg className='h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className='bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2'>
                                <svg className='h-5 w-5 text-red-500 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                                </svg>
                                <p className='text-red-700 text-sm'>{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type='submit'
                            disabled={isLoading}
                            className='w-full text-black font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                            style={{backgroundColor: '#f7d100', '--tw-ring-color': '#f7d100'}}
                        >
                            {isLoading ? (
                                <div className='flex items-center justify-center space-x-2'>
                                    <svg className='animate-spin h-5 w-5 text-black' fill='none' viewBox='0 0 24 24'>
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                    </svg>
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                <div className='flex items-center justify-center space-x-2'>
                                    <span>Sign In</span>
                                    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                                    </svg>
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className='mt-6 text-center'>
                        <p className='text-gray-500 text-xs'>
                            Protected by Lindela Admin
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin
