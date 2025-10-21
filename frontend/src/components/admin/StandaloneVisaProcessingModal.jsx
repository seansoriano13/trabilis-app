import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSnackbar } from '../../context/SnackbarContext'
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiEdit,
  FiSave,
  FiUserPlus,
  FiCreditCard,
  FiDollarSign,
  FiGlobe,
  FiMessageSquare,
} from 'react-icons/fi'
import Select from 'react-select'
import adminClient from '../../api/adminClient'
import { getVisaRequiredCountryOptions } from '../../utils/countryOptionsLoader'
import countryCodes from '../../data/CountryCodes.json'
import './StandaloneVisaProcessingModal.css'
import useUnsavedChanges from '../../hooks/useUnsavedChanges'
import UnsavedChangesModal from '../UnsavedChangesModal'
import '../../styles/unsaved-changes.css'

const StandaloneVisaProcessingModal = ({
  isOpen,
  onClose,
  processing,
  onStatusUpdate,
}) => {
  const { showSuccess } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [visaProcessing, setVisaProcessing] = useState(null)
  const [adminOptions, setAdminOptions] = useState([])
  const [loadingAdmins, setLoadingAdmins] = useState(false)
  const [requirements, setRequirements] = useState([])
  const [loadingRequirements, setLoadingRequirements] = useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)

  // Ref to store the actual initial form data when modal opens
  const initialFormDataRef = useRef(null)

  // Country options for mobile number (matching PassengerDetails pattern)
  const countryOptions = countryCodes.map((c) => ({
    value: c.dial_code.replace('+', ''), // "63"
    label: `${c.name} (${c.dial_code})`,
    code: c.code,
  }))

  // Form state
  const [formData, setFormData] = useState({
    passenger_name: '',
    passenger_email: '',
    mobile_country_code: '63', // Just the digits, e.g. "63"
    mobile_number: '',
    passport_number: '',
    country: '',
    visa_type: 'tourist',
    status: 'PENDING',
    requirements_status: {},
    notes: '',
    assigned_to: null,
    assignment_status: 'pending',
  })

  // Unsaved changes hook
  const { hasUnsavedChanges, resetUnsavedChanges } = useUnsavedChanges(
    initialFormDataRef.current,
    formData,
    {
      enabled: isOpen,
      trackBeforeUnload: false, // Don't track browser close for modals
    }
  )

  // Visa status options
  const visaStatusOptions = [
    { value: 'PENDING', label: 'Pending', color: '#f59e0b' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: '#3b82f6' },
    { value: 'APPROVED', label: 'Approved', color: '#10b981' },
    { value: 'REJECTED', label: 'Rejected', color: '#ef4444' },
    { value: 'CANCELLED', label: 'Cancelled', color: '#6b7280' },
  ]

  const visaTypeOptions = [
    { value: 'Tourist Visa', label: 'Tourist Visa' },
    { value: 'Business Visa', label: 'Business Visa' },
    { value: 'Student Visa', label: 'Student Visa' },
    { value: 'Fiancee Visa', label: 'Fiancee Visa' },
    { value: 'Spousal Visa', label: 'Spousal Visa' },
  ]

  const assignmentStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ]

  const loadVisaProcessing = useCallback(async () => {
    if (!processing?.id) return

    setLoading(true)
    setError(null)

    try {
      const response = await adminClient.get(`/processings/${processing.id}`, {
        baseURL: import.meta.env.VITE_BACKEND_URL + '/api/v1/visa-processing',
      })

      if (response.data.success) {
        const data = response.data.data
        setVisaProcessing(data)

        // Extract mobile number from JSON or set default
        const mobileData = data.mobile_number || {
          countryCallingCode: '+63',
          number: '',
        }

        const initialFormData = {
          passenger_name: data.passenger_name || '',
          passenger_email: data.passenger_email || '',
          mobile_country_code:
            mobileData.countryCallingCode?.replace('+', '') || '63',
          mobile_number: mobileData.number || '',
          passport_number: data.passport_number || '',
          country: data.country || '',
          visa_type: data.visa_type || 'Tourist Visa',
          status: data.status || 'PENDING',
          requirements_status: data.requirements_status || {},
          notes: data.notes || '',
          assigned_to: data.assigned_to,
          assignment_status: data.assignment_status || 'pending',
        }
        setFormData(initialFormData)
        // Store the actual initial data for comparison
        initialFormDataRef.current = initialFormData

        // Load requirements for this country
        if (data.country) {
          loadRequirements(data.country)
        }
      }
    } catch (error) {
      console.error('Error loading visa processing:', error)
      setError('Failed to load visa processing data')
    } finally {
      setLoading(false)
    }
  }, [processing])

  const loadRequirements = async (country) => {
    if (!country) {
      setRequirements([])
      return
    }

    setLoadingRequirements(true)
    setRequirements([]) // Clear previous requirements

    try {
      const response = await adminClient.get(
        `/requirements?country=${encodeURIComponent(country)}`,
        {
          baseURL: import.meta.env.VITE_BACKEND_URL + '/api/v1/visa-processing',
        }
      )

      if (response.data.success && response.data.data.length > 0) {
        const countryRequirements = response.data.data[0]

        // More robust parsing that handles multiple formats
        let requirementsList = []
        const requirementsText = countryRequirements.requirements

        // Try comma/semicolon separated first
        let items = requirementsText.split(/[,;]/)

        // If only 1 item, try newline-separated
        if (items.length === 1) {
          items = requirementsText.split(/\n/)
        }

        // Clean up each item
        requirementsList = items
          .map((req) => req.trim())
          .filter((req) => req.length > 0)
          .map((req) => {
            // Clean up common prefixes and formatting
            return req
              .replace(/^[-•*]\s*/, '') // Remove bullet points
              .replace(/^\d+\.\s*/, '') // Remove numbers
              .trim()
          })
          .filter((req) => req.length > 0) // Remove empty after cleaning

        console.log(`Requirements for ${country}:`, requirementsList)
        setRequirements(requirementsList)
      } else {
        console.warn(`No requirements found for country: ${country}`)
        setRequirements([]) // No fallback, show empty state
      }
    } catch (error) {
      console.error('Error loading requirements:', error)
      setRequirements([]) // No fallback, show error state
    } finally {
      setLoadingRequirements(false)
    }
  }

  // Load visa processing data
  useEffect(() => {
    if (isOpen && processing) {
      loadVisaProcessing()
      loadAdminOptions()
    }
  }, [isOpen, processing, loadVisaProcessing])

  const loadAdminOptions = async () => {
    setLoadingAdmins(true)
    try {
      const response = await adminClient.get('/appointments/all-staff')
      if (response.data.success) {
        setAdminOptions(
          response.data.data.map((admin) => ({
            value: admin.id,
            label: `${admin.first_name} ${admin.last_name}`,
            email: admin.email,
          }))
        )
      }
    } catch (error) {
      console.error('Error loading admins:', error)
    } finally {
      setLoadingAdmins(false)
    }
  }

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCountryChange = async (newCountry) => {
    // Update country
    setFormData((prev) => ({
      ...prev,
      country: newCountry,
      requirements_status: {}, // Clear checked requirements when country changes
    }))

    // Reload requirements for new country
    await loadRequirements(newCountry)
  }

  const handleRequirementsChange = (requirement, checked) => {
    setFormData((prev) => ({
      ...prev,
      requirements_status: {
        ...prev.requirements_status,
        [requirement]: checked,
      },
    }))
  }

  const handleCloseModal = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true)
      return
    }
    onClose()
  }

  const handleConfirmClose = () => {
    setShowUnsavedModal(false)
    onClose()
  }

  const handleCancelClose = () => {
    setShowUnsavedModal(false)
  }

  const handleSave = async () => {
    if (!visaProcessing) return

    setSaving(true)
    setError(null)

    try {
      // Update visa processing details
      await adminClient.put(
        `/processings/${visaProcessing.id}/details`,
        {
          passenger_name: formData.passenger_name,
          passenger_email: formData.passenger_email,
          passport_number: formData.passport_number,
          country: formData.country,
          visa_type: formData.visa_type,
          notes: formData.notes,
          mobile_number: {
            countryCallingCode: `+${formData.mobile_country_code}`,
            number: formData.mobile_number,
          },
        },
        {
          baseURL: import.meta.env.VITE_BACKEND_URL + '/api/v1/visa-processing',
        }
      )

      // Update visa status
      await adminClient.put(
        `/processings/${visaProcessing.id}/status`,
        {
          status: formData.status,
          notes: formData.notes,
        },
        {
          baseURL: import.meta.env.VITE_BACKEND_URL + '/api/v1/visa-processing',
        }
      )

      // Update requirements status
      await adminClient.put(
        `/processings/${visaProcessing.id}/requirements`,
        {
          requirements_status: formData.requirements_status,
        },
        {
          baseURL: import.meta.env.VITE_BACKEND_URL + '/api/v1/visa-processing',
        }
      )

      // Assign if assigned_to is set
      if (formData.assigned_to) {
        await adminClient.post(
          `/processings/${visaProcessing.id}/assign`,
          {
            assignedTo: formData.assigned_to,
            assignedBy: localStorage.getItem('admin_email'),
          },
          {
            baseURL:
              import.meta.env.VITE_BACKEND_URL + '/api/v1/visa-processing',
          }
        )

        // Update assignment status
        await adminClient.put(
          `/processings/${visaProcessing.id}/assignment-status`,
          {
            assignment_status: formData.assignment_status,
          },
          {
            baseURL:
              import.meta.env.VITE_BACKEND_URL + '/api/v1/visa-processing',
          }
        )
      }

      // Notify parent component
      if (onStatusUpdate) {
        onStatusUpdate(formData)
      }

      resetUnsavedChanges()
      showSuccess('Visa processing updated successfully!')
    } catch (error) {
      console.error('Error saving visa processing:', error)
      setError(
        `Failed to save changes: ${error.response?.data?.message || error.message}`
      )
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className='standalone-visa-modal-overlay'
      onClick={handleCloseModal}
    >
      <div
        className='standalone-visa-modal'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='standalone-visa-modal__header'>
          <div className='standalone-visa-modal__title'>
            <FiUser className='modal-icon' />
            <h3>
              Standalone Visa Processing -{' '}
              {formData.passenger_name || 'Loading...'}
              {hasUnsavedChanges && (
                <span className='unsaved-indicator'>•</span>
              )}
            </h3>
          </div>
          <button
            className='standalone-visa-modal__close'
            onClick={handleCloseModal}
          >
            <FiX size={20} />
          </button>
        </div>

        <div className='standalone-visa-modal__content'>
          {loading ? (
            <div className='standalone-visa-modal__loading'>
              <div className='loading-spinner'></div>
              <p>Loading visa processing data...</p>
            </div>
          ) : error ? (
            <div className='standalone-visa-modal__error'>
              <FiAlertCircle className='error-icon' />
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Client Information */}
              <div className='standalone-visa-modal__section'>
                <h4 className='section-title'>
                  <FiUser className='section-icon' />
                  Client Information
                </h4>
                <div className='client-info-grid'>
                  <div className='form-field'>
                    <label>Full Name *</label>
                    <input
                      type='text'
                      value={formData.passenger_name}
                      onChange={(e) =>
                        handleFieldChange('passenger_name', e.target.value)
                      }
                      className='form-input'
                    />
                  </div>
                  <div className='form-field'>
                    <label>Email</label>
                    <input
                      type='email'
                      value={formData.passenger_email}
                      onChange={(e) =>
                        handleFieldChange('passenger_email', e.target.value)
                      }
                      className='form-input'
                    />
                  </div>
                  <div className='form-field'>
                    <label>Country Calling Code (e.g., 63)</label>
                    <Select
                      className='standalone-visa-modal__country-select'
                      options={countryOptions}
                      value={
                        countryOptions.find(
                          (opt) => opt.value === formData.mobile_country_code
                        ) || null
                      }
                      onChange={(selected) =>
                        handleFieldChange(
                          'mobile_country_code',
                          selected?.value || '63'
                        )
                      }
                      placeholder='Select country code'
                      isSearchable
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          minHeight: '43px',
                          height: '100%',
                          fontSize: '0.875rem',
                          padding: '0 8px',
                        }),
                        valueContainer: (provided) => ({
                          ...provided,
                          height: '30px',
                          padding: '0 4px',
                        }),
                        input: (provided) => ({
                          ...provided,
                          margin: '0',
                          padding: '0',
                        }),
                        indicatorsContainer: (provided) => ({
                          ...provided,
                          height: '30px',
                        }),
                        dropdownIndicator: (provided) => ({
                          ...provided,
                          padding: '4px',
                        }),
                      }}
                    />
                  </div>
                  <div className='form-field'>
                    <label>Phone Number</label>
                    <input
                      type='tel'
                      value={formData.mobile_number}
                      onChange={(e) =>
                        handleFieldChange('mobile_number', e.target.value)
                      }
                      className='form-input'
                      placeholder='912-345-6789'
                    />
                  </div>
                  <div className='form-field'>
                    <label>Passport Number</label>
                    <input
                      type='text'
                      value={formData.passport_number}
                      onChange={(e) =>
                        handleFieldChange('passport_number', e.target.value)
                      }
                      className='form-input'
                      placeholder='P1234567'
                    />
                  </div>
                  <div className='form-field'>
                    <label>Destination Country *</label>
                    <Select
                      options={getVisaRequiredCountryOptions()}
                      value={getVisaRequiredCountryOptions().find(
                        (opt) => opt.value === formData.country
                      )}
                      onChange={(selected) =>
                        handleCountryChange(selected?.value || '')
                      }
                      placeholder='Select destination country'
                      isClearable
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          minHeight: '40px',
                        }),
                      }}
                    />
                  </div>
                  <div className='form-field'>
                    <label>Visa Type *</label>
                    <Select
                      options={visaTypeOptions}
                      value={visaTypeOptions.find(
                        (opt) => opt.value === formData.visa_type
                      )}
                      onChange={(selected) =>
                        handleFieldChange('visa_type', selected.value)
                      }
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          minHeight: '40px',
                        }),
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Processing Status */}
              <div className='standalone-visa-modal__section'>
                <h4 className='section-title'>
                  <FiFileText className='section-icon' />
                  Processing Status
                </h4>
                <div className='form-row'>
                  <div className='form-field'>
                    <label>Status</label>
                    <Select
                      options={visaStatusOptions}
                      value={visaStatusOptions.find(
                        (opt) => opt.value === formData.status
                      )}
                      onChange={(selected) =>
                        handleFieldChange('status', selected.value)
                      }
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          minHeight: '40px',
                        }),
                      }}
                    />
                  </div>
                  <div className='form-field'>
                    <label>Assignment Status</label>
                    <Select
                      options={assignmentStatusOptions}
                      value={assignmentStatusOptions.find(
                        (opt) => opt.value === formData.assignment_status
                      )}
                      onChange={(selected) =>
                        handleFieldChange('assignment_status', selected.value)
                      }
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          minHeight: '40px',
                        }),
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Requirements Checklist */}
              <div className='standalone-visa-modal__section'>
                <h4 className='section-title'>
                  <FiCheckCircle className='section-icon' />
                  Requirements Checklist
                </h4>
                {loadingRequirements ? (
                  <div className='loading-requirements'>
                    <div className='loading-spinner-small'></div>
                    <span>Loading requirements...</span>
                  </div>
                ) : !formData.country ? (
                  <div className='empty-requirements'>
                    <FiAlertCircle className='empty-icon' />
                    <p>
                      Please select a destination country to view requirements
                    </p>
                  </div>
                ) : requirements.length === 0 ? (
                  <div className='empty-requirements'>
                    <FiAlertCircle className='empty-icon' />
                    <p>No requirements found for {formData.country}</p>
                    <p className='empty-hint'>
                      Requirements data may need to be added in the system
                    </p>
                  </div>
                ) : (
                  <div className='requirements-grid'>
                    {requirements.map((requirement, index) => (
                      <div
                        key={index}
                        className='requirement-item'
                      >
                        <label className='requirement-checkbox'>
                          <input
                            type='checkbox'
                            checked={
                              formData.requirements_status[requirement] || false
                            }
                            onChange={(e) =>
                              handleRequirementsChange(
                                requirement,
                                e.target.checked
                              )
                            }
                          />
                          <span className='requirement-label'>
                            {requirement}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignment */}
              <div className='standalone-visa-modal__section'>
                <h4 className='section-title'>
                  <FiUserPlus className='section-icon' />
                  Assignment
                </h4>
                <div className='form-field'>
                  <label>Assign To</label>
                  <Select
                    options={adminOptions}
                    value={adminOptions.find(
                      (opt) => opt.value === formData.assigned_to
                    )}
                    onChange={(selected) =>
                      handleFieldChange('assigned_to', selected?.value || null)
                    }
                    isLoading={loadingAdmins}
                    placeholder='Select staff member...'
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        minHeight: '40px',
                      }),
                    }}
                  />
                </div>
              </div>

              {/* Payment Information (Read-only) */}
              {visaProcessing?.source_type === 'VISA_INQUIRY' && (
                <div className='standalone-visa-modal__section'>
                  <h4 className='section-title'>
                    <FiCreditCard className='section-icon' />
                    Payment Information
                  </h4>
                  <div className='payment-info-grid'>
                    <div className='info-item'>
                      <span className='info-label'>Amount Paid:</span>
                      <span className='info-value'>
                        ₱{visaProcessing.amount_paid?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className='info-item'>
                      <span className='info-label'>Payment Status:</span>
                      <span
                        className={`info-value status-${visaProcessing.payment_status?.toLowerCase()}`}
                      >
                        {visaProcessing.payment_status || 'PENDING'}
                      </span>
                    </div>
                    <div className='info-item'>
                      <span className='info-label'>Processing Reference:</span>
                      <span className='info-value'>
                        {visaProcessing.processing_reference || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className='standalone-visa-modal__section'>
                <h4 className='section-title'>
                  <FiMessageSquare className='section-icon' />
                  Notes
                </h4>
                <textarea
                  className='notes-textarea'
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  placeholder='Add notes about visa processing...'
                  rows={4}
                />
              </div>
            </>
          )}
        </div>

        <div className='standalone-visa-modal__footer'>
          <button
            className='btn btn--secondary'
            onClick={handleCloseModal}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className='btn btn--primary'
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? (
              <>
                <div className='btn-spinner'></div>
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
    </div>
  )
}

export default StandaloneVisaProcessingModal
