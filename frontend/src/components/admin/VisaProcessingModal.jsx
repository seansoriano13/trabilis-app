import React, { useState, useEffect, useCallback } from 'react'
import { 
    FiX, 
    FiUser, 
    FiMail, 
    FiPhone, 
    FiCalendar,
    FiMapPin,
    FiFileText,
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
    FiEdit,
    FiSave,
    FiUserPlus
} from 'react-icons/fi'
import Select from 'react-select'
import adminClient from '../../api/adminClient'
import './VisaProcessingModal.css'

const VisaProcessingModal = ({ 
    isOpen, 
    onClose, 
    passenger, 
    bookingId, 
    onStatusUpdate 
}) => {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [visaProcessing, setVisaProcessing] = useState(null)
    const [adminOptions, setAdminOptions] = useState([])
    const [loadingAdmins, setLoadingAdmins] = useState(false)
    
    // Form state
    const [formData, setFormData] = useState({
        status: 'PENDING',
        visa_type: 'tourist',
        requirements_status: {},
        notes: '',
        assigned_to: null,
        assignment_status: 'pending'
    })

    // Visa status options
    const visaStatusOptions = [
        { value: 'PENDING', label: 'Pending', color: '#f59e0b' },
        { value: 'IN_PROGRESS', label: 'In Progress', color: '#3b82f6' },
        { value: 'APPROVED', label: 'Approved', color: '#10b981' },
        { value: 'REJECTED', label: 'Rejected', color: '#ef4444' },
        { value: 'CANCELLED', label: 'Cancelled', color: '#6b7280' }
    ]

    const visaTypeOptions = [
        { value: 'tourist', label: 'Tourist Visa' },
        { value: 'business', label: 'Business Visa' },
        { value: 'student', label: 'Student Visa' },
        { value: 'fiancee', label: 'Fiancee Visa' },
        { value: 'spousal', label: 'Spousal Visa' }
    ]

    const assignmentStatusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' }
    ]

    const createVisaProcessing = useCallback(async () => {
        try {
            const passengerName = `${passenger.name?.firstName || ''} ${passenger.name?.lastName || ''}`.trim()
            const passengerEmail = passenger.contact?.emailAddress || ''
            
            const response = await adminClient.post(`/bookings/${bookingId}/visa-processings`, {
                visa_statuses: [{
                    passenger_index: 0, // This would need to be passed from parent
                    passenger_name: passengerName,
                    passenger_email: passengerEmail,
                    status: 'needs_processing',
                    visa_type: 'tourist',
                    existing_visa_status: passenger.existing_visa_status || 'not_specified',
                    visa_expiry_date: passenger.visa_expiry_date || null
                }]
            }, {
                baseURL: import.meta.env.VITE_BACKEND_URL + '/api/v1/visa-processing'
            })
            
            if (response.data.success) {
                setVisaProcessing(response.data.data[0])
            }
        } catch (error) {
            console.error('Error creating visa processing:', error)
            setError('Failed to create visa processing')
        }
    }, [bookingId, passenger])

    const loadVisaProcessing = useCallback(async () => {
        setLoading(true)
        setError(null)
        
        try {
            console.log('Loading visa processing for booking:', bookingId, 'passenger:', passenger.name)
            
            // Get visa processings for this booking
            const response = await adminClient.get(`/bookings/${bookingId}/visa-processings`, {
                baseURL: import.meta.env.VITE_BACKEND_URL + '/api/v1/visa-processing'
            })
            
            console.log('Visa processing response:', response.data)
            
            if (response.data.success) {
                // Find the visa processing for this passenger
                const passengerName = `${passenger.name?.firstName || ''} ${passenger.name?.lastName || ''}`.trim()
                console.log('Looking for passenger:', passengerName)
                
                const passengerProcessing = response.data.data.find(
                    vp => vp.passenger_name === passengerName
                )
                
                console.log('Found passenger processing:', passengerProcessing)
                
                if (passengerProcessing) {
                    setVisaProcessing(passengerProcessing)
                    setFormData({
                        status: passengerProcessing.status,
                        visa_type: passengerProcessing.visa_type,
                        requirements_status: passengerProcessing.requirements_status || {},
                        notes: passengerProcessing.notes || '',
                        assigned_to: passengerProcessing.assigned_to,
                        assignment_status: passengerProcessing.assignment_status || 'pending'
                    })
                    console.log('Updated form data:', {
                        status: passengerProcessing.status,
                        assignment_status: passengerProcessing.assignment_status
                    })
                } else {
                    // Create new visa processing if it doesn't exist
                    console.log('No visa processing found, creating new one...')
                    await createVisaProcessing()
                }
            }
        } catch (error) {
            console.error('Error loading visa processing:', error)
            console.error('Error details:', error.response?.data)
            setError('Failed to load visa processing data')
        } finally {
            setLoading(false)
        }
    }, [bookingId, passenger, createVisaProcessing])

    // Load visa processing data
    useEffect(() => {
        if (isOpen && passenger && bookingId) {
            loadVisaProcessing()
            loadAdminOptions()
        }
    }, [isOpen, passenger, bookingId, loadVisaProcessing])

    const loadAdminOptions = async () => {
        setLoadingAdmins(true)
        try {
            const response = await adminClient.get('/appointments/all-staff')
            if (response.data.success) {
                setAdminOptions(response.data.data.map(admin => ({
                    value: admin.id,
                    label: `${admin.first_name} ${admin.last_name}`,
                    email: admin.email
                })))
            }
        } catch (error) {
            console.error('Error loading admins:', error)
        } finally {
            setLoadingAdmins(false)
        }
    }

    const handleStatusChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleRequirementsChange = (requirement, checked) => {
        setFormData(prev => ({
            ...prev,
            requirements_status: {
                ...prev.requirements_status,
                [requirement]: checked
            }
        }))
    }

    const handleSave = async () => {
        if (!visaProcessing) return
        
        setSaving(true)
        setError(null)
        
        try {
            console.log('Saving visa processing with data:', formData)
            
            // Update visa status
            const statusResponse = await adminClient.put(`/processings/${visaProcessing.id}/status`, {
                status: formData.status,
                notes: formData.notes
            }, {
                baseURL: import.meta.env.VITE_BACKEND_URL + '/api/v1/visa-processing'
            })
            console.log('Status update response:', statusResponse.data)
            
            // Update local state with the returned data
            if (statusResponse.data.success && statusResponse.data.data) {
                setVisaProcessing(statusResponse.data.data)
                setFormData(prev => ({
                    ...prev,
                    status: statusResponse.data.data.status,
                    notes: statusResponse.data.data.notes || ''
                }))
            }

            // Update requirements status
            const requirementsResponse = await adminClient.put(`/processings/${visaProcessing.id}/requirements`, {
                requirements_status: formData.requirements_status
            }, {
                baseURL: import.meta.env.VITE_BACKEND_URL + '/api/v1/visa-processing'
            })
            console.log('Requirements update response:', requirementsResponse.data)

            // Assign if assigned_to is set
            if (formData.assigned_to) {
                const assignResponse = await adminClient.post(`/processings/${visaProcessing.id}/assign`, {
                    assignedTo: formData.assigned_to,
                    assignedBy: localStorage.getItem('admin_email')
                }, {
                    baseURL: import.meta.env.VITE_BACKEND_URL + '/api/v1/visa-processing'
                })
                console.log('Assignment response:', assignResponse.data)

                // Update assignment status
                const assignmentStatusResponse = await adminClient.put(`/processings/${visaProcessing.id}/assignment-status`, {
                    assignment_status: formData.assignment_status
                }, {
                    baseURL: import.meta.env.VITE_BACKEND_URL + '/api/v1/visa-processing'
                })
                console.log('Assignment status response:', assignmentStatusResponse.data)
                
                // Update local state with the returned data
                if (assignmentStatusResponse.data.success && assignmentStatusResponse.data.data) {
                    setVisaProcessing(assignmentStatusResponse.data.data)
                    setFormData(prev => ({
                        ...prev,
                        assignment_status: assignmentStatusResponse.data.data.assignment_status,
                        status: assignmentStatusResponse.data.data.status
                    }))
                }
            }

            // Notify parent component
            if (onStatusUpdate) {
                onStatusUpdate(formData)
            }
            
            alert('Visa processing updated successfully!')
        } catch (error) {
            console.error('Error saving visa processing:', error)
            console.error('Error details:', error.response?.data)
            setError(`Failed to save changes: ${error.response?.data?.message || error.message}`)
        } finally {
            setSaving(false)
        }
    }


    if (!isOpen) return null

    return (
        <div className="visa-processing-modal-overlay" onClick={onClose}>
            <div className="visa-processing-modal" onClick={(e) => e.stopPropagation()}>
                <div className="visa-processing-modal__header">
                    <div className="visa-processing-modal__title">
                        <FiUser className="modal-icon" />
                        <h3>Visa Processing - {passenger?.name?.firstName} {passenger?.name?.lastName}</h3>
                    </div>
                    <button className="visa-processing-modal__close" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className="visa-processing-modal__content">
                    {loading ? (
                        <div className="visa-processing-modal__loading">
                            <div className="loading-spinner"></div>
                            <p>Loading visa processing data...</p>
                        </div>
                    ) : error ? (
                        <div className="visa-processing-modal__error">
                            <FiAlertCircle className="error-icon" />
                            <p>{error}</p>
                        </div>
                    ) : (
                        <>
                            {/* Passenger Information */}
                            <div className="visa-processing-modal__section">
                                <h4 className="section-title">
                                    <FiUser className="section-icon" />
                                    Passenger Information
                                </h4>
                                <div className="passenger-info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Name:</span>
                                        <span className="info-value">
                                            {passenger?.name?.firstName} {passenger?.name?.lastName}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Email:</span>
                                        <span className="info-value">
                                            <FiMail size={14} />
                                            {passenger?.contact?.emailAddress || 'Not provided'}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Phone:</span>
                                        <span className="info-value">
                                            <FiPhone size={14} />
                                            {passenger?.contact?.phones?.[0]?.number || 'Not provided'}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Country:</span>
                                        <span className="info-value">
                                            <FiMapPin size={14} />
                                            {visaProcessing?.country || 'Not specified'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Visa Status */}
                            <div className="visa-processing-modal__section">
                                <h4 className="section-title">
                                    <FiFileText className="section-icon" />
                                    Visa Status
                                </h4>
                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Status</label>
                                        <Select
                                            options={visaStatusOptions}
                                            value={visaStatusOptions.find(opt => opt.value === formData.status)}
                                            onChange={(selected) => handleStatusChange('status', selected.value)}
                                            styles={{
                                                control: (provided) => ({
                                                    ...provided,
                                                    minHeight: '40px'
                                                })
                                            }}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Visa Type</label>
                                        <Select
                                            options={visaTypeOptions}
                                            value={visaTypeOptions.find(opt => opt.value === formData.visa_type)}
                                            onChange={(selected) => handleStatusChange('visa_type', selected.value)}
                                            styles={{
                                                control: (provided) => ({
                                                    ...provided,
                                                    minHeight: '40px'
                                                })
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Requirements Checklist */}
                            <div className="visa-processing-modal__section">
                                <h4 className="section-title">
                                    <FiCheckCircle className="section-icon" />
                                    Requirements Checklist
                                </h4>
                                <div className="requirements-grid">
                                    {[
                                        'passport',
                                        'photos',
                                        'application_form',
                                        'travel_insurance',
                                        'bank_statement',
                                        'hotel_booking',
                                        'flight_reservation',
                                        'cover_letter',
                                        'biometrics'
                                    ].map(requirement => (
                                        <div key={requirement} className="requirement-item">
                                            <label className="requirement-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.requirements_status[requirement] || false}
                                                    onChange={(e) => handleRequirementsChange(requirement, e.target.checked)}
                                                />
                                                <span className="requirement-label">
                                                    {requirement.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Assignment */}
                            <div className="visa-processing-modal__section">
                                <h4 className="section-title">
                                    <FiUserPlus className="section-icon" />
                                    Assignment
                                </h4>
                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Assign To</label>
                                        <Select
                                            options={adminOptions}
                                            value={adminOptions.find(opt => opt.value === formData.assigned_to)}
                                            onChange={(selected) => handleStatusChange('assigned_to', selected?.value || null)}
                                            isLoading={loadingAdmins}
                                            placeholder="Select staff member..."
                                            styles={{
                                                control: (provided) => ({
                                                    ...provided,
                                                    minHeight: '40px'
                                                })
                                            }}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Assignment Status</label>
                                        <Select
                                            options={assignmentStatusOptions}
                                            value={assignmentStatusOptions.find(opt => opt.value === formData.assignment_status)}
                                            onChange={(selected) => handleStatusChange('assignment_status', selected.value)}
                                            styles={{
                                                control: (provided) => ({
                                                    ...provided,
                                                    minHeight: '40px'
                                                })
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="visa-processing-modal__section">
                                <h4 className="section-title">
                                    <FiEdit className="section-icon" />
                                    Notes
                                </h4>
                                <textarea
                                    className="notes-textarea"
                                    value={formData.notes}
                                    onChange={(e) => handleStatusChange('notes', e.target.value)}
                                    placeholder="Add notes about visa processing..."
                                    rows={4}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="visa-processing-modal__footer">
                    <button 
                        className="btn btn--secondary" 
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button 
                        className="btn btn--primary" 
                        onClick={handleSave}
                        disabled={saving || loading}
                    >
                        {saving ? (
                            <>
                                <div className="btn-spinner"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <FiSave size={16} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VisaProcessingModal
