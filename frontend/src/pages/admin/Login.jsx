import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import adminClient from '../../api/adminClient.js'

const AdminLogin = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

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
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
            <div className='grid gap-5 bg-white rounded-xl shadow-2xl w-full max-w-md p-8'>
                <h1 className='text-3xl font-bold text-center text-primary-500 mb-6'>
                    Lindela Admin
                </h1>
                <form
                    onSubmit={handleSubmit}
                    className='flex flex-col gap-4 content-center'
                >
                    <input
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Email'
                        required
                        className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500'
                    />
                    <input
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Password'
                        required
                        className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500'
                    />
                    <div className='flex justify-center'>
                        <button
                            type='submit'
                            className='bg-black text-white font-bold px-4 py-3 rounded-lg hover:bg-primary-600 transition'
                        >
                            {isLoading ? 'Logging in...' : 'Log in'}
                        </button>
                    </div>
                    {error && (
                        <p className='text-red-500 text-sm mt-2 text-center'>
                            {error}
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}

export default AdminLogin
