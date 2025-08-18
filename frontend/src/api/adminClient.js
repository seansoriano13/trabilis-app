import axios from 'axios'

const adminClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL + '/api/v1/admin',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Attach token automatically
adminClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

adminClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('admin_token')
            window.location.href = '/admin/login'
        }
        return Promise.reject(error)
    }
)

export default adminClient
