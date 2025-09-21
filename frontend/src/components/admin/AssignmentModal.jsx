import React, { useState, useEffect } from 'react'
import { FiX, FiUser, FiCheck, FiAlertCircle } from 'react-icons/fi'
import adminClient from '../../api/adminClient'
import './AssignmentModal.css'

const AssignmentModal = ({ 
    isOpen, 
    onClose, 
    bookingId, 
    bookingType, 
    bookingReference,
    onSuccess 
}) => {
    const [staff, setStaff] = useState([])
    const [selectedStaff, setSelectedStaff] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            fetchAccountingStaff()
        }
    }, [isOpen])

    const fetchAccountingStaff = async () => {
        try {
            const response = await adminClient.get('/appointments/staff')
            if (response.data.success) {
                setStaff(response.data.data)
            }
        } catch (err) {
            console.error('Error fetching staff:', err)
            setError('Failed to load accounting staff')
        }
    }

    const handleAssign = async () => {
        if (!selectedStaff) {
            setError('Please select an accounting staff member')
            return
        }

        setLoading(true)
        setError('')

        try {            // Get current admin user from localStorage
            const adminEmail = localStorage.getItem('admin_email')
            const adminToken = localStorage.getItem('adminToken')
            
            if (!adminEmail || !adminToken) {
                setError('Admin session not found. Please login again.')
                setLoading(false)
                return
            }

            // Get admin user details from the token or use email as fallback
            const assignedBy = adminEmail // Using email as identifier for now

            const endpoint = bookingType === 'tour' 
                ? '/appointments/assign-tour' 
                : '/appointments/assign-flight'

            const response = await adminClient.post(endpoint, {
                bookingId,
                assignedTo: selectedStaff,
                assignedBy: assignedBy
            })

            if (response.data.success) {
                onSuccess(response.data.data)
                onClose()
            } else {
                setError(response.data.message || 'Failed to assign booking')
            }
        } catch (err) {
            console.error('Error assigning booking:', err)
            setError(err.response?.data?.message || 'Failed to assign booking')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setSelectedStaff('')
        setError('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="assignment-modal-overlay">
            <div className="assignment-modal">
                <div className="assignment-modal-header">
                    <div className="assignment-modal-title">
                        <FiUser size={20} />
                        <h3>Assign Booking</h3>
                    </div>
                    <button 
                        className="assignment-modal-close"
                        onClick={handleClose}
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <div className="assignment-modal-content">
                    <div className="assignment-modal-info">
                        <p><strong>Booking Reference:</strong> {bookingReference}</p>
                        <p><strong>Type:</strong> {bookingType === 'tour' ? 'Tour' : 'Flight'} Booking</p>
                    </div>

                    {error && (
                        <div className="assignment-modal-error">
                            <FiAlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="assignment-modal-form">
                        <label className="assignment-modal-label">
                            <FiUser size={16} />
                            Select Accounting Staff
                        </label>
                        <select
                            value={selectedStaff}
                            onChange={(e) => setSelectedStaff(e.target.value)}
                            className="assignment-modal-select"
                        >
                            <option value="">Choose accounting staff...</option>
                            {staff.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.first_name} {member.last_name} ({member.email})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="assignment-modal-footer">
                    <button 
                        className="assignment-modal-cancel"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button 
                        className="assignment-modal-assign"
                        onClick={handleAssign}
                        disabled={loading || !selectedStaff}
                    >
                        {loading ? (
                            <>
                                <div className="assignment-modal-spinner"></div>
                                Assigning...
                            </>
                        ) : (
                            <>
                                <FiCheck size={16} />
                                Assign Booking
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AssignmentModal
