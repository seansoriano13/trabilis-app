import { useState } from 'react'
import adminClient from '../../api/adminClient.js'

export default function AdminLogin() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleLogin = async () => {
        try {
            const res = await adminClient.post('login', {
                email: username,
                password,
            })

            const data = res.data

            if (data.token) {
                localStorage.setItem('admin_token', data.token)
                localStorage.setItem('admin_email', username)
                setError('')
                window.location.href = '/admin/dashboard'
            } else {
                setError(data.error || 'Login failed')
            }
        } catch (err) {
            console.error(err)
            setError('Server connection error')
        }
    }

    return (
        <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
            <h2>Admin Login</h2>
            <input
                type='text'
                placeholder='Username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ display: 'block', marginBottom: 10, width: '100%' }}
            />
            <input
                type='password'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ display: 'block', marginBottom: 10, width: '100%' }}
            />
            <button
                onClick={handleLogin}
                style={{ width: '100%' }}
            >
                Login
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    )
}
