import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSnackbar } from '../../context/SnackbarContext'
import {
  FiShield,
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiGlobe,
  FiFileText,
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiX,
  FiAlertCircle,
  FiActivity,
} from 'react-icons/fi'
import Select from 'react-select'
import adminClient from '../../api/adminClient'
import './VisaInquiryDetail.css'

const VisaInquiryDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showInfo, showSuccess, showError } = useSnackbar()

  const [inquiry, setInquiry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#f59e0b' },
    { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
    { value: 'completed', label: 'Completed', color: '#10b981' },
    { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
    { value: 'on_hold', label: 'On Hold', color: '#6b7280' },
  ]

  // Fetch inquiry details
  const fetchInquiry = async () => {
    try {
      setLoading(true)
      const response = await adminClient.get(`/visa-inquiries/${id}`)
      if (response.data.success) {
        setInquiry(response.data.data)
      } else {
        showError('Failed to fetch visa inquiry details')
        navigate('/admin/visa-inquiries')
      }
    } catch (error) {
      console.error('Error fetching visa inquiry:', error)
      showError('Failed to fetch visa inquiry details')
      navigate('/admin/visa-inquiries')
    } finally {
      setLoading(false)
    }
  }

  // Update inquiry status
  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true)
      const response = await adminClient.put(`/visa-inquiries/${id}/status`, {
        status: newStatus,
      })

      if (response.data.success) {
        setInquiry((prev) => ({ ...prev, status: newStatus }))
        showSuccess('Status updated successfully')
      } else {
        showError('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      showError('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  // Assign inquiry
  const assignInquiry = async (assignedTo) => {
    try {
      setUpdating(true)
      const response = await adminClient.put(`/visa-inquiries/${id}/assign`, {
        assigned_to: assignedTo,
      })

      if (response.data.success) {
        setInquiry((prev) => ({ ...prev, assigned_to: assignedTo }))
        showSuccess('Inquiry assigned successfully')
      } else {
        showError('Failed to assign inquiry')
      }
    } catch (error) {
      console.error('Error assigning inquiry:', error)
      showError('Failed to assign inquiry')
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchInquiry()
    }
  }, [id])

  if (loading) {
    return (
      <div className='visa-inquiry-detail'>
        <div className='visa-inquiry-detail__loading'>
          <div className='loading-spinner'></div>
          <p>Loading visa inquiry details...</p>
        </div>
      </div>
    )
  }

  if (!inquiry) {
    return (
      <div className='visa-inquiry-detail'>
        <div className='visa-inquiry-detail__error'>
          <FiAlertCircle size={48} />
          <h2>Visa Inquiry Not Found</h2>
          <p>The requested visa inquiry could not be found.</p>
          <Link
            to='/admin/visa-inquiries'
            className='btn btn-primary'
          >
            <FiArrowLeft size={16} />
            Back to Visa Inquiries
          </Link>
        </div>
      </div>
    )
  }

  const currentStatus = statusOptions.find(
    (option) => option.value === inquiry.status
  )
  const assignedStaff = inquiry.assigned_staff || 'Unassigned'

  return (
    <div className='visa-inquiry-detail'>
      {/* Header */}
      <div className='visa-inquiry-detail__header'>
        <div className='visa-inquiry-detail__header-left'>
          <Link
            to='/admin/visa-inquiries'
            className='visa-inquiry-detail__back-btn'
          >
            <FiArrowLeft size={20} />
            Back to Visa Inquiries
          </Link>
          <div className='visa-inquiry-detail__title'>
            <FiShield size={24} />
            <h1>Visa Inquiry #{inquiry.inquiry_reference}</h1>
          </div>
        </div>
        <div className='visa-inquiry-detail__header-right'>
          <button
            className='btn btn-secondary'
            onClick={() => setShowEditModal(true)}
            disabled={updating}
          >
            <FiEdit size={16} />
            Edit
          </button>
        </div>
      </div>

      {/* Status and Assignment */}
      <div className='visa-inquiry-detail__status-section'>
        <div className='visa-inquiry-detail__status'>
          <label>Status:</label>
          <Select
            value={currentStatus}
            onChange={(option) => updateStatus(option.value)}
            options={statusOptions}
            isDisabled={updating}
            className='visa-inquiry-detail__status-select'
          />
        </div>
        <div className='visa-inquiry-detail__assignment'>
          <label>Assigned to:</label>
          <span className='visa-inquiry-detail__assigned-staff'>
            {assignedStaff}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className='visa-inquiry-detail__content'>
        {/* Personal Information */}
        <div className='visa-inquiry-detail__section'>
          <h2>
            <FiUser size={20} />
            Personal Information
          </h2>
          <div className='visa-inquiry-detail__info-grid'>
            <div className='visa-inquiry-detail__info-item'>
              <label>Full Name:</label>
              <span>{inquiry.full_name}</span>
            </div>
            <div className='visa-inquiry-detail__info-item'>
              <label>Email:</label>
              <span>
                <FiMail size={16} />
                {inquiry.email}
              </span>
            </div>
            <div className='visa-inquiry-detail__info-item'>
              <label>Phone:</label>
              <span>
                <FiPhone size={16} />
                {inquiry.phone}
              </span>
            </div>
            <div className='visa-inquiry-detail__info-item'>
              <label>Date of Birth:</label>
              <span>
                <FiCalendar size={16} />
                {new Date(inquiry.date_of_birth).toLocaleDateString()}
              </span>
            </div>
            <div className='visa-inquiry-detail__info-item'>
              <label>Nationality:</label>
              <span>
                <FiGlobe size={16} />
                {inquiry.nationality}
              </span>
            </div>
            <div className='visa-inquiry-detail__info-item'>
              <label>Current Location:</label>
              <span>
                <FiMapPin size={16} />
                {inquiry.current_location}
              </span>
            </div>
          </div>
        </div>

        {/* Visa Information */}
        <div className='visa-inquiry-detail__section'>
          <h2>
            <FiShield size={20} />
            Visa Information
          </h2>
          <div className='visa-inquiry-detail__info-grid'>
            <div className='visa-inquiry-detail__info-item'>
              <label>Destination Country:</label>
              <span>{inquiry.destination_country}</span>
            </div>
            <div className='visa-inquiry-detail__info-item'>
              <label>Visa Type:</label>
              <span>{inquiry.visa_type}</span>
            </div>
            <div className='visa-inquiry-detail__info-item'>
              <label>Travel Purpose:</label>
              <span>{inquiry.travel_purpose}</span>
            </div>
            <div className='visa-inquiry-detail__info-item'>
              <label>Intended Travel Date:</label>
              <span>
                <FiCalendar size={16} />
                {new Date(inquiry.intended_travel_date).toLocaleDateString()}
              </span>
            </div>
            <div className='visa-inquiry-detail__info-item'>
              <label>Duration of Stay:</label>
              <span>{inquiry.duration_of_stay}</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {inquiry.additional_info && (
          <div className='visa-inquiry-detail__section'>
            <h2>
              <FiFileText size={20} />
              Additional Information
            </h2>
            <div className='visa-inquiry-detail__additional-info'>
              <p>{inquiry.additional_info}</p>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className='visa-inquiry-detail__section'>
          <h2>
            <FiActivity size={20} />
            Timeline
          </h2>
          <div className='visa-inquiry-detail__timeline'>
            <div className='visa-inquiry-detail__timeline-item'>
              <div className='visa-inquiry-detail__timeline-icon'>
                <FiClock size={16} />
              </div>
              <div className='visa-inquiry-detail__timeline-content'>
                <h4>Inquiry Submitted</h4>
                <p>{new Date(inquiry.created_at).toLocaleString()}</p>
              </div>
            </div>
            {inquiry.updated_at !== inquiry.created_at && (
              <div className='visa-inquiry-detail__timeline-item'>
                <div className='visa-inquiry-detail__timeline-icon'>
                  <FiEdit size={16} />
                </div>
                <div className='visa-inquiry-detail__timeline-content'>
                  <h4>Last Updated</h4>
                  <p>{new Date(inquiry.updated_at).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisaInquiryDetail
