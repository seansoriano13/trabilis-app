// AdminUsers.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    FiUsers, 
    FiUserPlus, 
    FiEdit3, 
    FiTrash2, 
    FiRefreshCw,
    FiShield,
    FiUserCheck,
    FiUserX,
    FiMail,
    FiUser,
    FiKey,
    FiFilter,
    FiSearch,
    FiEye,
    FiSave,
    FiX,
    FiNavigation
} from 'react-icons/fi'
import ReactPaginate from 'react-paginate'
import './AdminUsers.css'
import adminClient from '../../api/adminClient.js'
import useUnsavedChanges from '../../hooks/useUnsavedChanges'
import useBlocker from '../../hooks/useBlocker'
import UnsavedChangesModal from '../../components/UnsavedChangesModal'
import '../../styles/unsaved-changes.css'

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

    // Initial empty form data for comparison
    const initialFormData = {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'admin',
    }

    // Unsaved changes hook
    const {
        hasUnsavedChanges,
        resetUnsavedChanges
    } = useUnsavedChanges(initialFormData, formData, {
        enabled: true,
        trackBeforeUnload: true
    })

    // Navigation blocker
    useBlocker(hasUnsavedChanges, () => {
        setShowUnsavedModal(true)
    })

    const [formError, setFormError] = useState(null)
    const [editingUser, setEditingUser] = useState(null)
    const [showUnsavedModal, setShowUnsavedModal] = useState(false)
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
            resetUnsavedChanges()
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
            resetUnsavedChanges()
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
                <div className='users__header-content'>
                    <div className='users__header-icon'>
                        <FiUsers size={32} />
                    </div>
                    <div className='users__header-text'>
                        <h1>User Management</h1>
                        <p>Manage admin and accounting user accounts</p>
                    </div>
                </div>
                <div className='users__header-actions'>
                    <button className='users__action-btn users__action-btn--refresh'>
                        <FiRefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className='users__summary'>
                <div className='users__summary-card users__summary-card--total'>
                    <div className='users__summary-icon'>
                        <FiUsers size={24} />
                    </div>
                    <div className='users__summary-content'>
                        <h3>Total Users</h3>
                        <p>{userStats.total_users || 0}</p>
                        <span className='users__summary-label'>All accounts</span>
                    </div>
                </div>
                <div className='users__summary-card users__summary-card--admin'>
                    <div className='users__summary-icon'>
                        <FiShield size={24} />
                    </div>
                    <div className='users__summary-content'>
                        <h3>Admin Users</h3>
                        <p>{userStats.admin_count || 0}</p>
                        <span className='users__summary-label'>Full access</span>
                    </div>
                </div>
                <div className='users__summary-card users__summary-card--accounting'>
                    <div className='users__summary-icon'>
                        <FiUserCheck size={24} />
                    </div>
                    <div className='users__summary-content'>
                        <h3>Accounting Users</h3>
                        <p>{userStats.accounting_count || 0}</p>
                        <span className='users__summary-label'>Limited access</span>
                    </div>
                </div>
            </div>

            <div className='users__form-container'>
                <div className='users__form-header'>
                    <div className='users__form-title'>
                        <FiUserPlus size={24} />
                        <h2>Create New User</h2>
                    </div>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className='users__form'
                >
                    <div className='users__form-grid'>
                        <div className='users__form-group'>
                            <label className='users__form-label'>
                                <FiUser size={16} />
                                First Name
                            </label>
                            <input
                                type='text'
                                name='first_name'
                                value={formData.first_name}
                                onChange={handleFormChange}
                                placeholder='Enter first name'
                                required
                                className='users__form-input'
                            />
                        </div>

                        <div className='users__form-group'>
                            <label className='users__form-label'>
                                <FiUser size={16} />
                                Last Name
                            </label>
                            <input
                                type='text'
                                name='last_name'
                                value={formData.last_name}
                                onChange={handleFormChange}
                                placeholder='Enter last name'
                                required
                                className='users__form-input'
                            />
                        </div>

                        <div className='users__form-group'>
                            <label className='users__form-label'>
                                <FiMail size={16} />
                                Email Address
                            </label>
                            <input
                                type='email'
                                name='email'
                                value={formData.email}
                                onChange={handleFormChange}
                                placeholder='Enter email address'
                                required
                                className='users__form-input'
                            />
                        </div>

                        <div className='users__form-group'>
                            <label className='users__form-label'>
                                <FiKey size={16} />
                                Password
                            </label>
                            <input
                                type='password'
                                name='password'
                                value={formData.password}
                                onChange={handleFormChange}
                                placeholder='Enter password (min 8 characters)'
                                required
                                className='users__form-input'
                            />
                        </div>

                        <div className='users__form-group'>
                            <label className='users__form-label'>
                                <FiShield size={16} />
                                User Role
                            </label>
                            <select
                                name='role'
                                value={formData.role}
                                onChange={handleFormChange}
                                required
                                className='users__form-select'
                            >
                                <option value='admin'>Admin - Full Access</option>
                                <option value='accounting'>Accounting - Limited Access</option>
                                <option value='travel_consultant'>Travel Consultant - Visa & Tours</option>
                            </select>
                        </div>
                    </div>

                    <div className='users__form-actions'>
                        <button
                            type='submit'
                            className='users__form-submit'
                        >
                            <FiUserPlus size={16} />
                            Create User
                            {hasUnsavedChanges && (
                                <span className='unsaved-indicator'>•</span>
                            )}
                        </button>
                    </div>
                    {formError && (
                        <div className='users__form-error'>
                            <FiX size={16} />
                            {formError}
                        </div>
                    )}
                </form>
            </div>

            {editingUser && (
                <div className='users__modal'>
                    <div className='users__modal-content'>
                        <div className='users__modal-header'>
                            <div className='users__modal-title'>
                                <FiEdit3 size={24} />
                                <h2>Edit User Role</h2>
                            </div>
                            <button
                                className='users__modal-close'
                                onClick={() => setEditingUser(null)}
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className='users__modal-form'>
                            <div className='users__modal-user-info'>
                                <div className='users__modal-user-email'>
                                    <FiMail size={16} />
                                    <span>{editingUser.email}</span>
                                </div>
                                <div className='users__modal-user-name'>
                                    <FiUser size={16} />
                                    <span>{editingUser.first_name} {editingUser.last_name}</span>
                                </div>
                            </div>
                            <div className='users__modal-form-group'>
                                <label className='users__modal-label'>
                                    <FiShield size={16} />
                                    User Role
                                </label>
                                <select
                                    name='role'
                                    value={editingUser.role}
                                    onChange={(e) =>
                                        setEditingUser({
                                            ...editingUser,
                                            role: e.target.value,
                                        })
                                    }
                                    className='users__modal-select'
                                >
                                    <option value='admin'>Admin - Full Access</option>
                                    <option value='accounting'>Accounting - Limited Access</option>
                                    <option value='travel_consultant'>Travel Consultant - Visa & Tours</option>
                                </select>
                            </div>
                            <div className='users__modal-actions'>
                                <button
                                    type='submit'
                                    className='users__modal-save'
                                >
                                    <FiSave size={16} />
                                    Update Role
                                </button>
                                <button
                                    type='button'
                                    className='users__modal-cancel'
                                    onClick={() => setEditingUser(null)}
                                >
                                    <FiX size={16} />
                                    Cancel
                                </button>
                            </div>
                            {formError && (
                                <div className='users__modal-error'>
                                    <FiX size={16} />
                                    {formError}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            <div className='users__filter'>
                <div className='users__filter-header'>
                    <div className='users__filter-title'>
                        <FiFilter size={20} />
                        <h3>Filter Users</h3>
                    </div>
                </div>
                <div className='users__filter-content'>
                    <div className='users__filter-group'>
                        <label className='users__filter-label'>
                            <FiShield size={16} />
                            User Role
                        </label>
                        <select
                            name='role'
                            value={filters.role}
                            onChange={handleFilterChange}
                            className='users__filter-select'
                        >
                            <option value='All'>All Roles</option>
                            <option value='admin'>Admin Users</option>
                            <option value='accounting'>Accounting Users</option>
                            <option value='travel_consultant'>Travel Consultants</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className='users__section'>
                <div className='users__section-header'>
                    <div className='users__section-title'>
                        <FiUsers size={24} />
                        <h2>User Accounts</h2>
                        <span className='users__section-count'>({total} total)</span>
                    </div>
                </div>
                
                <div className='users__table-container'>
                    <table className='users__table'>
                        <thead>
                            <tr>
                                <th className='users__table-header users__table-header--sortable'>
                                    <div className='users__table-header-content'>
                                        <span>User ID</span>
                                    </div>
                                </th>
                                <th className='users__table-header users__table-header--sortable'>
                                    <div className='users__table-header-content'>
                                        <span>Name</span>
                                    </div>
                                </th>
                                <th 
                                    onClick={() => handleSort('email')}
                                    className='users__table-header users__table-header--sortable'
                                >
                                    <div className='users__table-header-content'>
                                        <span>Email</span>
                                        {sort.key === 'email' && (
                                            <span className='users__sort-indicator'>
                                                {sort.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th 
                                    onClick={() => handleSort('role')}
                                    className='users__table-header users__table-header--sortable'
                                >
                                    <div className='users__table-header-content'>
                                        <span>Role</span>
                                        {sort.key === 'role' && (
                                            <span className='users__sort-indicator'>
                                                {sort.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className='users__table-header'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUsers.map((user) => (
                                <tr key={user.id} className='users__table-row'>
                                    <td className='users__table-cell users__table-cell--id'>
                                        <div className='users__user-id'>
                                            <span>{user.id.slice(0, 8)}...</span>
                                        </div>
                                    </td>
                                    <td className='users__table-cell'>
                                        <div className='users__user-info'>
                                            <div className='users__user-avatar'>
                                                <FiUser size={16} />
                                            </div>
                                            <div className='users__user-details'>
                                                <span className='users__user-name'>
                                                    {user.first_name || '-'} {user.last_name || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='users__table-cell'>
                                        <div className='users__user-email'>
                                            <FiMail size={16} />
                                            <span>{user.email}</span>
                                        </div>
                                    </td>
                                    <td className='users__table-cell'>
                                        <span className={`users__user-role users__user-role--${user.role}`}>
                                            {user.role === 'admin' ? (
                                                <>
                                                    <FiShield size={14} />
                                                    Admin
                                                </>
                                            ) : user.role === 'accounting' ? (
                                                <>
                                                    <FiUserCheck size={14} />
                                                    Accounting
                                                </>
                                            ) : (
                                                <>
                                                    <FiNavigation size={14} />
                                                    Travel Consultant
                                                </>
                                            )}
                                        </span>
                                    </td>
                                    <td className='users__table-cell users__table-cell--actions'>
                                        <div className='users__actions'>
                                            <button
                                                className='users__action-btn users__action-btn--edit'
                                                onClick={() => handleEdit(user)}
                                                title='Edit User Role'
                                            >
                                                <FiEdit3 size={16} />
                                            </button>
                                            <button
                                                className='users__action-btn users__action-btn--delete'
                                                onClick={() => handleDelete(user.id)}
                                                title='Delete User'
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className='users__pagination-container'>
                    <ReactPaginate
                        previousLabel={'← Previous'}
                        nextLabel={'Next →'}
                        pageCount={Math.ceil(total / pageSize)}
                        onPageChange={({ selected }) => setPage(selected)}
                        containerClassName={'users__pagination'}
                        activeClassName={'users__pagination--active'}
                        forcePage={page}
                        breakLabel={'...'}
                        pageRangeDisplayed={3}
                        marginPagesDisplayed={1}
                    />
                </div>
            </div>

            {/* Unsaved Changes Modal */}
            <UnsavedChangesModal
                isOpen={showUnsavedModal}
                onConfirm={() => {
                    setShowUnsavedModal(false)
                    // Allow navigation to proceed
                }}
                onCancel={() => setShowUnsavedModal(false)}
                title="Unsaved Changes"
                message="You have unsaved changes. Are you sure you want to leave without saving?"
                confirmText="Leave Without Saving"
                cancelText="Stay on Page"
            />
        </div>
    )
}

export default AdminUsers
