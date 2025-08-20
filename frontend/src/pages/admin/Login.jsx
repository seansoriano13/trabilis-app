import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import adminClient from '../../api/adminClient.js'

const AdminLogin = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data } = await adminClient.post('/login', {
                email,
                password,
            }) 
            localStorage.setItem('adminToken', data.token)
            localStorage.setItem('admin_email', data.email)
            localStorage.setItem('admin_role', data.role)
            navigate('/admin')
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed')
        }
    }

    return (
        <div className='admin-login'>
            <h1>Admin Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Email'
                    required
                />
                <input
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Password'
                    required
                />
                <button type='submit'>Login</button>
                {error && <p className='admin-login__error'>{error}</p>}
            </form>
        </div>
    )
}

export default AdminLogin
