import React, { useState, useEffect, useCallback } from 'react'
import { BsX } from 'react-icons/bs'
import Select from 'react-select'
import adminClient from '../../api/adminClient'
import { useSnackbar } from '../../context/SnackbarContext'
import useUnsavedChanges from '../../hooks/useUnsavedChanges'
import UnsavedChangesModal from '../UnsavedChangesModal'
import '../../styles/unsaved-changes.css'

const FlightBookingEditModal = ({ 
    isOpen, 
    booking, 
    onClose, 
    onSubmit
}) => {
    const { showError } = useSnackbar()
    const [editLoading, setEditLoading] = useState(false)
    const [editForm, setEditForm] = useState({
        status: '',
        pnr: '',
        e_ticket_numbers: '',
        assigned_to: '',
        assignment_status: 'pending',
    })
    const [adminOptions, setAdminOptions] = useState([])
    const [loadingAdmins, setLoadingAdmins] = useState(false)
    const [showUnsavedModal, setShowUnsavedModal] = useState(false)

    // Initial form data for comparison
    const initialFormData = {
        status: '',
        pnr: '',
        e_ticket_numbers: '',
        assigned_to: '',
        assignment_status: 'pending',
    }

    // Unsaved changes hook
    const {
        hasUnsavedChanges,
        resetUnsavedChanges
    } = useUnsavedChanges(initialFormData, editForm, {
        enabled: isOpen,
        trackBeforeUnload: false // Don't track browser close for modals
    })

    // Status options for dropdown
    const statusOptions = [
        { value: 'PENDING', label: 'Pending', color: '#ffc107' },
        {
            value: 'PENDING_PAYMENT',
            label: 'Pending Payment',
            color: '#fd7e14',
        },
        { value: 'TICKETED', label: 'Confirmed', color: '#28a745' },
        { value: 'CANCELLED', label: 'Cancelled', color: '#dc3545' },
    ]

    // Assignment status options
    const assignmentStatusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Approved' },
    ]

    // Fetch admin options for assignment dropdown
    const fetchAdminOptions = useCallback(async () => {
        setLoadingAdmins(true)
        try {
            const response = await adminClient.get('/appointments/all-staff')
            if (response.data.success) {
                const options = response.data.data.map((admin) => ({
                    value: admin.id,
                    label: `${admin.first_name} ${admin.last_name} (${admin.email})`,
                    email: admin.email,
                    name: `${admin.first_name} ${admin.last_name}`,
                }))
                setAdminOptions(options)
            }
        } catch (error) {
            console.error('Error fetching admin options:', error)
        } finally {
            setLoadingAdmins(false)
        }
    }, [])

    const initializeModal = useCallback(async () => {
        await fetchAdminOptions()
        
        // Populate form with current booking data
        setEditForm({
            status: booking.status,
            pnr: booking.pnr || '',
            e_ticket_numbers: Array.isArray(booking.e_ticket_numbers)
                ? booking.e_ticket_numbers.join(', ')
                : booking.e_ticket_numbers || '',
            assigned_to: booking.assigned_to || '',
            assignment_status: booking.assignment_status || 'pending',
        })
    }, [booking, fetchAdminOptions])

    // Initialize modal when booking changes
    useEffect(() => {
        if (isOpen && booking) {
            initializeModal()
        }
    }, [isOpen, booking, initializeModal])

    const handleFormChange = (field, value) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleCloseModal = () => {
        if (hasUnsavedChanges) {
            setShowUnsavedModal(true)
            return
        }
        
        setEditForm({
            status: '',
            pnr: '',
            e_ticket_numbers: '',
            assigned_to: '',
            assignment_status: 'pending',
        })
        onClose()
    }

    const handleConfirmClose = () => {
        setShowUnsavedModal(false)
        setEditForm({
            status: '',
            pnr: '',
            e_ticket_numbers: '',
            assigned_to: '',
            assignment_status: 'pending',
        })
        onClose()
    }

    const handleCancelClose = () => {
        setShowUnsavedModal(false)
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        setEditLoading(true)

        try {
            // Prepare data for submission
            const submitData = {
                status: editForm.status,
                pnr: editForm.pnr || null,
                assigned_to: editForm.assigned_to || null,
                assignment_status: editForm.assignment_status,
            }

            // Handle e_ticket_numbers - convert string back to array if needed
            if (editForm.e_ticket_numbers) {
                submitData.e_ticket_numbers = editForm.e_ticket_numbers
                    .split(',')
                    .map((ticket) => ticket.trim())
                    .filter((ticket) => ticket.length > 0)
            }

            await onSubmit(submitData)
            resetUnsavedChanges()
            handleCloseModal()
        } catch (error) {
            console.error('Error updating booking:', error)
            showError('Error updating booking. Please try again.')
        } finally {
            setEditLoading(false)
        }
    }

    if (!isOpen || !booking) return null

    return (
        <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>
                        Edit Flight Booking
                        {hasUnsavedChanges && (
                            <span className='unsaved-indicator'>•</span>
                        )}
                    </h3>
                    <button
                        className="modal-close"
                        onClick={handleCloseModal}
                        disabled={editLoading}
                    >
                        <BsX />
                    </button>
                </div>

                <form onSubmit={handleEditSubmit} className="edit-form">
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <Select
                            value={statusOptions.find(
                                (option) => option.value === editForm.status
                            )}
                            onChange={(selectedOption) =>
                                handleFormChange(
                                    'status',
                                    selectedOption?.value || ''
                                )
                            }
                            options={statusOptions}
                            placeholder="Select status"
                            isSearchable={false}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            formatOptionLabel={(option) => (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            backgroundColor: option.color,
                                            marginRight: 8,
                                        }}
                                    />
                                    {option.label}
                                </div>
                            )}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="pnr">PNR</label>
                        <input
                            type="text"
                            id="pnr"
                            value={editForm.pnr}
                            onChange={(e) =>
                                handleFormChange('pnr', e.target.value)
                            }
                            placeholder="Enter PNR"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="e_ticket_numbers">
                            E-Ticket Numbers
                        </label>
                        <input
                            type="text"
                            id="e_ticket_numbers"
                            value={editForm.e_ticket_numbers}
                            onChange={(e) =>
                                handleFormChange(
                                    'e_ticket_numbers',
                                    e.target.value
                                )
                            }
                            placeholder="Enter ticket numbers (comma-separated)"
                            className="form-input"
                        />
                        <small className="form-help">
                            Separate multiple ticket numbers with commas
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="assigned_to">Assigned To</label>
                        <Select
                            value={adminOptions.find(
                                (option) => option.value === editForm.assigned_to
                            )}
                            onChange={(selectedOption) =>
                                handleFormChange(
                                    'assigned_to',
                                    selectedOption?.value || ''
                                )
                            }
                            options={adminOptions}
                            placeholder={
                                loadingAdmins
                                    ? 'Loading admins...'
                                    : 'Select admin'
                            }
                            isSearchable={true}
                            isLoading={loadingAdmins}
                            isClearable={true}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="assignment_status">
                            Assignment Status
                        </label>
                        <Select
                            value={assignmentStatusOptions.find(
                                (option) =>
                                    option.value === editForm.assignment_status
                            )}
                            onChange={(selectedOption) =>
                                handleFormChange(
                                    'assignment_status',
                                    selectedOption?.value || 'pending'
                                )
                            }
                            options={assignmentStatusOptions}
                            placeholder="Select assignment status"
                            isSearchable={false}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCloseModal}
                            disabled={editLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={editLoading}
                        >
                            {editLoading ? (
                                <>
                                    <div className="loading-spinner-small"></div>
                                    Updating...
                                </>
                            ) : (
                                'Update Booking'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Unsaved Changes Modal */}
            <UnsavedChangesModal
                isOpen={showUnsavedModal}
                onConfirm={handleConfirmClose}
                onCancel={handleCancelClose}
                title="Unsaved Changes"
                message="You have unsaved changes. Are you sure you want to close without saving?"
                confirmText="Close Without Saving"
                cancelText="Stay in Modal"
            />
        </div>
    )
}

export default FlightBookingEditModal
