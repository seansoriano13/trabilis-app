// AdminUsers.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUsers } from 'react-icons/fi'
import ReactPaginate from 'react-paginate'
import './AdminUsers.css'
import adminClient from '../../api/adminClient.js'

const AdminUsers = () => {
    const [users, setUsers] = useState([])
    const [userStats, setUserStats] = useState({})
    const [page, setPage] = useState(0)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [sort, setSort] = useState({ key: 'email', direction: 'asc' })
    const [filters, setFilters] = useState({ role: 'All' })
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'admin',
    })
    const [formError, setFormError] = useState(null)
    const [editingUser, setEditingUser] = useState(null)
    const navigate = useNavigate()

    const pageSize = 5
    const jwt = localStorage.getItem('adminToken')
    const userRole = localStorage.getItem('admin_role')

    useEffect(() => {
        if (!jwt) {
            setError('Please log in to view users.')
            setLoading(false)
            navigate('/admin/login')
            return
        }

        if (userRole !== 'admin') {
            navigate('/admin') // Redirect accounting users to dashboard
            setLoading(false)
            return
        }

        const fetchData = async () => {
            setLoading(true)
            try {
                const [usersRes, statsRes] = await Promise.all([
                    adminClient.get(
                        `/users?page=${page + 1}&role=${filters.role}`
                    ),
                    adminClient.get('/users/stats'),
                ])

                setUsers(usersRes.data.data)
                setTotal(usersRes.data.total)
                setUserStats(statsRes.data)
                setLoading(false)
            } catch (err) {
                setError(
                    err.response?.data?.error ||
                        'Failed to load users. Please try again.'
                )
                setLoading(false)
            }
        }

        fetchData()
    }, [page, filters, jwt, userRole, navigate])

    const sortData = (data, sort) => {
        return [...data].sort((a, b) => {
            const valA = a[sort.key] || ''
            const valB = b[sort.key] || ''
            if (valA === valB) return 0
            if (sort.direction === 'asc') {
                return valA > valB ? 1 : -1
            } else {
                return valA < valB ? 1 : -1
            }
        })
    }

    const handleSort = (key) => {
        setSort((prev) => ({
            key,
            direction:
                prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }))
        setPage(0)
    }

    const handleFilterChange = (e) => {
        setFilters({ role: e.target.value })
        setPage(0)
    }

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setFormError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.password.length < 8) {
            setFormError('Password must be at least 8 characters')
            return
        }

        try {
            await adminClient.post('/users/create', { ...formData })
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                role: 'admin',
            })
            // Refresh users
            const { data } = await adminClient.get(
                `/users?page=${page + 1}&role=${filters.role}`
            )
            setUsers(data.data)
            setTotal(data.total)
        } catch (err) {
            setFormError(err.response?.data?.error || 'Failed to create user')
        }
    }

    const handleEdit = (user) => {
        setEditingUser(user)
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        try {
            await adminClient.put(`/users/${editingUser.id}`, {
                role: editingUser.role,
            })
            setEditingUser(null)
            // Refresh users
            const { data } = await adminClient.get(
                `/users?page=${page + 1}&role=${filters.role}`
            )
            setUsers(data.data)
            setTotal(data.total)
        } catch (err) {
            setFormError(err.response?.data?.error || 'Failed to update user')
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await adminClient.delete(`/users/${id}`)
                // Refresh users
                const { data } = await adminClient.get(
                    `/users?page=${page + 1}&role=${filters.role}`
                )
                setUsers(data.data)
                setTotal(data.total)
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to delete user')
            }
        }
    }

    if (loading) {
        return <div className='users__loading'>Loading...</div>
    }

    if (error) {
        return (
            <div className='users__error'>
                <p>{error}</p>
                <button
                    className='users__retry'
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        )
    }

    const sortedUsers = sortData(users, sort)

    return (
        <div className='users'>
            <div className='users__header'>
                <FiUsers
                    size={32}
                    color='black'
                />
                <h1>User Management</h1>
            </div>

            <div className='users__summary'>
                <div className='users__summary-card'>
                    <h3>Total Users</h3>
                    <p>{userStats.total_users || 0}</p>
                </div>
                <div className='users__summary-card'>
                    <h3>Admin Users</h3>
                    <p>{userStats.admin_count || 0}</p>
                </div>
                <div className='users__summary-card'>
                    <h3>Accounting Users</h3>
                    <p>{userStats.accounting_count || 0}</p>
                </div>
            </div>

            <div className='users__form-container'>
                <h2>Create New User</h2>
                <form
                    onSubmit={handleSubmit}
                    className='users__form'
                >
                    <label className='flex items-center gap-4'>
                        <span className='w-1/3'>First Name</span>
                        <input
                            type='text'
                            name='first_name'
                            value={formData.first_name}
                            onChange={handleFormChange}
                            placeholder='First Name'
                            required
                            className='flex-1'
                        />
                    </label>

                    <label className='flex items-center gap-4'>
                        <span className='w-1/3'>Last Name</span>
                        <input
                            type='text'
                            name='last_name'
                            value={formData.last_name}
                            onChange={handleFormChange}
                            placeholder='Last Name'
                            required
                            className='flex-1'
                        />
                    </label>

                    <label className='flex items-center gap-4'>
                        <span className='w-1/3'>Email</span>
                        <input
                            type='email'
                            name='email'
                            value={formData.email}
                            onChange={handleFormChange}
                            placeholder='Email'
                            required
                            className='flex-1'
                        />
                    </label>

                    <label className='flex items-center gap-4'>
                        <span className='w-1/3'>Password</span>
                        <input
                            type='password'
                            name='password'
                            value={formData.password}
                            onChange={handleFormChange}
                            placeholder='Password'
                            required
                            className='flex-1'
                        />
                    </label>

                    <label className='flex items-center gap-4'>
                        <span className='w-1/3'>Role</span>
                        <select
                            name='role'
                            value={formData.role}
                            onChange={handleFormChange}
                            required
                            className='flex-1'
                        >
                            <option value='admin'>Admin</option>
                            <option value='accounting'>Accounting</option>
                        </select>
                    </label>

                    <button
                        type='submit'
                        className='users__form-submit'
                    >
                        Create User
                    </button>
                    {formError && (
                        <p className='users__form-error'>{formError}</p>
                    )}
                </form>
            </div>

            {editingUser && (
                <div className='users__modal'>
                    <div className='users__modal-content'>
                        <h2>Edit User</h2>
                        <form onSubmit={handleUpdate}>
                            <p>Email: {editingUser.email}</p>
                            <select
                                name='role'
                                value={editingUser.role}
                                onChange={(e) =>
                                    setEditingUser({
                                        ...editingUser,
                                        role: e.target.value,
                                    })
                                }
                            >
                                <option value='admin'>Admin</option>
                                <option value='accounting'>Accounting</option>
                            </select>
                            <div className='users__modal-buttons'>
                                <button
                                    type='submit'
                                    className='users__form-submit'
                                >
                                    Update
                                </button>
                                <button
                                    type='button'
                                    className='users__modal-cancel'
                                    onClick={() => setEditingUser(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                            {formError && (
                                <p className='users__form-error'>{formError}</p>
                            )}
                        </form>
                    </div>
                </div>
            )}

            <div className='users__filter'>
                <select
                    name='role'
                    value={filters.role}
                    onChange={handleFilterChange}
                >
                    <option value='All'>All Roles</option>
                    <option value='admin'>Admin</option>
                    <option value='accounting'>Accounting</option>
                </select>
            </div>

            <div className='users__section'>
                <h2>Users</h2>
                <div className='users__table-container'>
                    <table className='users__table'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th onClick={() => handleSort('email')}>
                                    Email{' '}
                                    {sort.key === 'email'
                                        ? sort.direction === 'asc'
                                            ? '↑'
                                            : '↓'
                                        : ''}
                                </th>
                                <th onClick={() => handleSort('role')}>
                                    Role{' '}
                                    {sort.key === 'role'
                                        ? sort.direction === 'asc'
                                            ? '↑'
                                            : '↓'
                                        : ''}
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id.slice(0, 8)}</td>
                                    <td>{user.first_name || '-'}</td>
                                    <td>{user.last_name || '-'}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        <button
                                            className='users__action-edit'
                                            onClick={() => handleEdit(user)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className='users__action-delete'
                                            onClick={() =>
                                                handleDelete(user.id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ReactPaginate
                    previousLabel={'←'}
                    nextLabel={'→'}
                    pageCount={Math.ceil(total / pageSize)}
                    onPageChange={({ selected }) => setPage(selected)}
                    containerClassName={'users__pagination'}
                    activeClassName={'users__pagination--active'}
                    forcePage={page}
                />
            </div>
        </div>
    )
}

export default AdminUsers
