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
    // Legacy props for visa inquiries
    inquiryId,
    inquiryReference,
    inquiryType,
    onSuccess 
}) => {
    // Use legacy props if new props are not provided
    const actualBookingId = bookingId || inquiryId
    const actualBookingType = bookingType || inquiryType
    const actualBookingReference = bookingReference || inquiryReference
    const [staff, setStaff] = useState([])
    const [selectedStaff, setSelectedStaff] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            fetchAccountingStaff()
        }
    }, [isOpen, actualBookingType])

    const fetchAccountingStaff = async () => {
        try {
            // Use different endpoints based on booking type
            const endpoint = actualBookingType === 'visa' ? '/appointments/all-staff' : '/appointments/staff'
            const response = await adminClient.get(endpoint)

            
            if (response.data.success) {
                // Filter for travel consultants only when booking type is visa
                if (actualBookingType === 'visa') {
                   
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
            setError(`Please select a ${actualBookingType === 'visa-inquiry' || actualBookingType === 'visa-processing' ? 'travel consultant' : 'staff member'}`)
            return
        }

        setLoading(true)
        setError('')

        try {
            // Get current admin user from localStorage
            const adminEmail = localStorage.getItem('admin_email')
            const adminToken = localStorage.getItem('adminToken')
            
            if (!adminEmail || !adminToken) {
                setError('Admin session not found. Please login again.')
                setLoading(false)
                return
            }

            // Unified endpoint for all booking types
            const endpoint = '/assignments/assign'
            
            // Unified request payload
            const requestData = {
                bookingType: actualBookingType, // 'tour', 'flight', 'visa-inquiry', 'visa-processing'
                bookingId: actualBookingId,
                assignedTo: selectedStaff.value,
                assignedBy: adminEmail
            }

            const response = await adminClient.post(endpoint, requestData, {
                headers: { Authorization: `Bearer ${adminToken}` }
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
                        <h3>Assign {actualBookingType === 'visa-processing' ? 'Visa Processing' : actualBookingType === 'visa-inquiry' ? 'Visa Inquiry' : 'Booking'}</h3>
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
                        <p><strong>{actualBookingType === 'visa-processing' ? 'Processing ID' : actualBookingType === 'visa-inquiry' ? 'Inquiry Reference' : 'Booking Reference'}:</strong> {actualBookingReference}</p>
                        <p><strong>Type:</strong> {actualBookingType === 'tour' ? 'Tour' : actualBookingType === 'flight' ? 'Flight' : actualBookingType === 'visa-processing' ? 'Visa Processing' : 'Visa Inquiry'}</p>
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
                            {actualBookingType === 'visa' ? 'Select Travel Consultant' : actualBookingType === 'visa-processing' ? 'Select Travel Consultant' : 'Select Staff Member'}
                        </label>
                        <Select
                            value={selectedStaff}
                            onChange={setSelectedStaff}
                            options={staff.map(member => ({
                                // Prefer UUID if available; fallback to numeric id
                                value: member.user_id || member.id,
                                label: `${member.first_name} ${member.last_name} (${member.email})`,
                                role: member.role
                            }))}
                            placeholder={bookingType === 'visa' ? 'Choose travel consultant...' : 'Choose staff member...'}
                            className="assignment-modal-select"
                            classNamePrefix="assignment-select"
                            isSearchable
                            isClearable
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            menuPlacement="auto"
                            menuShouldScrollIntoView={false}
                            styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                menu: base => ({ ...base, zIndex: 9999 })
                            }}
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
