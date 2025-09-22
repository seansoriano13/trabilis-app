import React, { useState, useEffect } from 'react'
import { FiX, FiUser, FiCheck, FiAlertCircle } from 'react-icons/fi'
import Select from 'react-select'
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
    const [selectedStaff, setSelectedStaff] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            fetchAccountingStaff()
        }
    }, [isOpen, bookingType])

    const fetchAccountingStaff = async () => {
        try {
            // Use different endpoints based on booking type
            const endpoint = bookingType === 'visa' ? '/appointments/all-staff' : '/appointments/staff'
            const response = await adminClient.get(endpoint)

            
            if (response.data.success) {
                // Filter for travel consultants only when booking type is visa
                if (bookingType === 'visa') {
                   
                    const travelConsultants = response.data.data.filter(member => 
                        member.role === 'travel_consultant'
                    )
                 
                    setStaff(travelConsultants)
                } else {
                    setStaff(response.data.data)
                }
            }
        } catch (err) {
            console.error('Error fetching staff:', err)
            setError('Failed to load staff members')
        }
    }

    const handleAssign = async () => {
        if (!selectedStaff) {
            setError(`Please select a ${bookingType === 'visa' ? 'travel consultant' : 'staff member'}`)
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
                : bookingType === 'flight'
                ? '/appointments/assign-flight'
                : '/visa/inquiries/assign'

            // Use different parameter names based on booking type
            const requestData = bookingType === 'visa' 
                ? {
                    inquiryId: bookingId,
                    assignedTo: selectedStaff.value,
                    assignedBy: assignedBy
                  }
                : {
                    bookingId: bookingId,
                    assignedTo: selectedStaff.value,
                    assignedBy: assignedBy
                  }

            const response = await adminClient.post(endpoint, requestData)

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
        setSelectedStaff(null)
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
                        <h3>Assign Inquiry</h3>
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
                        <p><strong>Inquiry Reference:</strong> {bookingReference}</p>
                        <p><strong>Type:</strong> {bookingType === 'tour' ? 'Tour' : bookingType === 'flight' ? 'Flight' : 'Visa'} {bookingType === 'visa' ? 'Inquiry' : 'Booking'}</p>
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
                            {bookingType === 'visa' ? 'Select Travel Consultant' : 'Select Staff Member'}
                        </label>
                        <Select
                            value={selectedStaff}
                            onChange={setSelectedStaff}
                            options={staff.map(member => ({
                                value: member.id,
                                label: `${member.first_name} ${member.last_name} (${member.email})`,
                                role: member.role
                            }))}
                            placeholder={bookingType === 'visa' ? 'Choose travel consultant...' : 'Choose staff member...'}
                            className="assignment-modal-select"
                            classNamePrefix="assignment-select"
                            isSearchable
                            isClearable
                            noOptionsMessage={() => "No staff members found"}
                        />
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
                                Assign Inquiry
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AssignmentModal
