import React, { useState, useEffect, useCallback } from 'react'
import Select from 'react-select'
import { useSnackbar } from '../../context/SnackbarContext'
import adminClient from '../../api/adminClient'
import useUnsavedChanges from '../../hooks/useUnsavedChanges'
import UnsavedChangesModal from '../UnsavedChangesModal'
import '../../styles/unsaved-changes.css'

const TourBookingEditModal = ({ isOpen, booking, onClose, onSubmit }) => {
    const { showError } = useSnackbar()
    const [editLoading, setEditLoading] = useState(false)
    const [editForm, setEditForm] = useState({
        status: '',
        assigned_to: '',
        assignment_status: 'pending',
        flight_booking_reference: '',
    })
    const [, setDraftSaved] = useState(false)
    const [adminOptions, setAdminOptions] = useState([])
    const [loadingAdmins, setLoadingAdmins] = useState(false)
    const [showUnsavedModal, setShowUnsavedModal] = useState(false)

    // Initial form data for comparison
    const initialFormData = {
        status: '',
        assigned_to: '',
        assignment_status: 'pending',
        flight_booking_reference: '',
    }

    // Unsaved changes hook
    const { hasUnsavedChanges, resetUnsavedChanges } = useUnsavedChanges(
        initialFormData,
        editForm,
        {
            enabled: isOpen,
            trackBeforeUnload: false, // Don't track browser close for modals
        }
    )

    // Status options for tours
    const statusOptions = [
        { value: 'CONFIRMED', label: 'Confirmed', color: '#28a745' },
        {
            value: 'PENDING_PAYMENT',
            label: 'Pending Payment',
            color: '#fd7e14',
        },
        { value: 'CANCELLED', label: 'Cancelled', color: '#dc3545' },
    ]

    const assignmentStatusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Approved' },
    ]

    // Admin options for assignment
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

        // Always use fresh booking data instead of saved draft
        // This ensures the modal shows the current booking state
        const initialFormData = {
            status: booking.status,
            assigned_to: booking.assigned_to || '',
            assignment_status: booking.assignment_status || 'pending',
            flight_booking_reference: booking.flight_booking_reference || '',
        }

        setEditForm(initialFormData)

        // Clear any existing draft to prevent conflicts
        const draftKey = `tour_booking_draft_${booking.id}`
        localStorage.removeItem(draftKey)
    }, [booking, fetchAdminOptions])

    // Initialize modal when booking changes
    useEffect(() => {
        if (isOpen && booking) {
            initializeModal()
        }
    }, [isOpen, booking, initializeModal])

    // Save draft functionality
    const saveDraft = () => {
        if (!booking) return
        const draftKey = `tour_booking_draft_${booking.id}`
        const draftData = {
            ...editForm,
            savedAt: new Date().toISOString(),
        }
        localStorage.setItem(draftKey, JSON.stringify(draftData))
        setDraftSaved(true)

        setTimeout(() => setDraftSaved(false), 2000)
    }

    // Clear draft functionality

    // Handle form changes
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

        // Auto-save draft before closing
        saveDraft()

        setEditForm({
            status: '',
            assigned_to: '',
            assignment_status: 'pending',
            flight_booking_reference: '',
        })
        setDraftSaved(false)
        onClose()
    }

    const handleConfirmClose = () => {
        setShowUnsavedModal(false)
        // Auto-save draft before closing
        saveDraft()

        setEditForm({
            status: '',
            assigned_to: '',
            assignment_status: 'pending',
            flight_booking_reference: '',
        })
        setDraftSaved(false)
        onClose()
    }

    const handleCancelClose = () => {
        setShowUnsavedModal(false)
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        setEditLoading(true)
        try {
            const submitData = {
                status: editForm.status,
                assigned_to: editForm.assigned_to || null,
                assignment_status: editForm.assignment_status,
                flight_booking_reference:
                    editForm.flight_booking_reference || null,
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
        <div
            className='modal-overlay'
            onClick={handleCloseModal}
        >
            <div
                className='modal-content modal-wide'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='modal-header modal-header-sticky'>
                    <h3>
                        Edit Tour Booking
                        {hasUnsavedChanges && (
                            <span className='unsaved-indicator'>•</span>
                        )}
                    </h3>
                    <div className='modal-header-actions'>
                        <button
                            className='modal-close'
                            onClick={handleCloseModal}
                            disabled={editLoading}
                            aria-label='Close'
                        >
                            ×
                        </button>
                    </div>
                </div>

                <form
                    onSubmit={handleEditSubmit}
                    className='edit-form'
                >
                    <div className='form-group'>
                        <label htmlFor='status'>Status</label>
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
                            placeholder='Select status'
                            isSearchable={false}
                            className='react-select-container'
                            classNamePrefix='react-select'
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

                    <div className='form-group'>
                        <label htmlFor='assigned_to'>Assigned To</label>
                        <Select
                            value={adminOptions.find(
                                (option) =>
                                    option.value === editForm.assigned_to
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
                            className='react-select-container'
                            classNamePrefix='react-select'
                        />
                    </div>

                    <div className='form-group'>
                        <label htmlFor='assignment_status'>
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
                            placeholder='Select assignment status'
                            isSearchable={false}
                            className='react-select-container'
                            classNamePrefix='react-select'
                        />
                    </div>

                    <div className='form-group'>
                        <div className='form-group'>
                            <label htmlFor='flight_booking_reference'>
                                Flight Booking Reference
                            </label>
                            <input
                                type='text'
                                id='flight_booking_reference'
                                placeholder='TRB-FLT-12345'
                                value={editForm.flight_booking_reference || ''}
                                onChange={(e) =>
                                    handleFormChange(
                                        'flight_booking_reference',
                                        e.target.value
                                    )
                                }
                                className='form-input'
                            />
                            <small className='form-help-text'>
                                Enter the flight booking reference to link
                                flight details to this tour booking.
                            </small>
                        </div>
                    </div>

                    <div className='modal-actions modal-actions-sticky'>
                        <button
                            type='button'
                            className='btn btn-secondary'
                            onClick={handleCloseModal}
                            disabled={editLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            className='btn btn-primary'
                            disabled={editLoading}
                        >
                            {editLoading ? (
                                <>
                                    <div className='loading-spinner-small'></div>
                                    Updating...
                                </>
                            ) : (
                                <>Update Booking</>
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
                title='Unsaved Changes'
                message='You have unsaved changes. Are you sure you want to close without saving?'
                confirmText='Close Without Saving'
                cancelText='Stay in Modal'
            />
        </div>
    )
}

export default TourBookingEditModal
