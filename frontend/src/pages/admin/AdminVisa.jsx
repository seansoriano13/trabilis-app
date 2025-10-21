import React, { useState, useEffect, useCallback } from 'react'
import { useSnackbar } from '../../context/SnackbarContext'
import {
  formatMobileNumber,
  getMobileTelHref,
} from '../../utils/mobileNumberUtils'
import {
  FiShield,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiMapPin,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiUser,
  FiNavigation,
  FiUserPlus,
  FiFileText,
  FiDownload,
  FiMail,
  FiPhone,
  FiGlobe,
  FiMessageSquare,
  FiCheckCircle,
  FiXCircle,
  FiX,
  FiAlertCircle,
  FiClock as FiClockIcon,
  FiPackage,
  FiActivity,
} from 'react-icons/fi'
import ReactPaginate from 'react-paginate'
import './AdminVisa.css'
import adminClient from '../../api/adminClient'
import AssignmentModal from '../../components/admin/AssignmentModal'
import StandaloneVisaProcessingModal from '../../components/admin/StandaloneVisaProcessingModal'
import { getCurrentAdmin } from '../../utils/jwtUtils'

const AdminVisa = () => {
  const { showInfo, showSuccess, showError } = useSnackbar()
  // Tab state
  const [activeTab, setActiveTab] = useState('inquiries')

  // Inquiries state (existing functionality)
  const [inquiries, setInquiries] = useState([])
  const [inquiryPage, setInquiryPage] = useState(0)
  const [inquiryTotal, setInquiryTotal] = useState(0)
  const [inquiryLoading, setInquiryLoading] = useState(true)
  const [inquirySearchLoading, setInquirySearchLoading] = useState(false)
  const [inquiryError, setInquiryError] = useState(null)
  const [inquirySort, setInquirySort] = useState({
    key: 'created_at',
    direction: 'desc',
  })
  const [inquiryFilters, setInquiryFilters] = useState({
    status: 'ALL',
    visa_type: '',
    destination: '',
    search: '',
  })
  const [inquirySearchInput] = useState('')
  const [assignmentModal, setAssignmentModal] = useState({
    isOpen: false,
    bookingId: null,
    bookingReference: '',
    bookingType: 'visa-inquiry',
    currentAssignedStaffId: null,
  })
  const [inquiryDetailsModal, setInquiryDetailsModal] = useState({
    isOpen: false,
    inquiry: null,
  })
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    inquiry: null,
    paymentAmount: 5000,
  })

  // Standalone Visa Processing Modal state
  const [standaloneProcessingModal, setStandaloneProcessingModal] = useState({
    isOpen: false,
    processing: null,
  })

  // Visa Processing state (new functionality)
  const [visaProcessings, setVisaProcessings] = useState([])
  const [processingPage, setProcessingPage] = useState(0)
  const [processingTotal, setProcessingTotal] = useState(0)
  const [processingLoading, setProcessingLoading] = useState(false)
  const [processingSearchLoading, setProcessingSearchLoading] = useState(false)
  const [processingError, setProcessingError] = useState(null)
  const [processingSort, setProcessingSort] = useState({
    key: 'created_at',
    direction: 'desc',
  })
  const [processingFilters, setProcessingFilters] = useState({
    status: 'ALL',
    country: '',
    assigned_to: '',
    source_type: 'ALL',
    search: '',
    show_my_bookings: false,
  })
  const [processingSearchInput] = useState('')

  const pageSize = 20
  const jwt = localStorage.getItem('adminToken')
  const userRole = localStorage.getItem('admin_role')

  // Existing inquiries functions
  const fetchInquiries = useCallback(
    async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setInquiryLoading(true)
        } else {
          setInquirySearchLoading(true)
        }
        const params = new URLSearchParams({
          page: inquiryPage + 1,
          limit: pageSize,
          status: inquiryFilters.status,
          ...(inquiryFilters.search && {
            search: inquiryFilters.search,
          }),
        })

        const response = await adminClient.get(`/visa/inquiries?${params}`)

        if (response.data.success) {
          setInquiries(response.data.data)
          setInquiryTotal(response.data.pagination?.total || 0)
        } else {
          setInquiryError('Failed to fetch inquiries')
        }
      } catch (error) {
        console.error('Error fetching inquiries:', error)
        setInquiryError('Error loading inquiries')
      } finally {
        setInquiryLoading(false)
        setInquirySearchLoading(false)
      }
    },
    [inquiryPage, inquiryFilters, pageSize]
  )

  // New visa processing functions
  const fetchVisaProcessings = useCallback(
    async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setProcessingLoading(true)
        } else {
          setProcessingSearchLoading(true)
        }
        // Handle My Bookings filter
        let assignedToFilter = processingFilters.assigned_to
        if (processingFilters.show_my_bookings) {
          const currentUser = getCurrentAdmin()
          if (currentUser && currentUser.id) {
            assignedToFilter = currentUser.id
          }
        }

        const params = new URLSearchParams({
          page: processingPage + 1,
          limit: pageSize,
          status: processingFilters.status,
          country: processingFilters.country,
          assigned_to: assignedToFilter,
          source_type: processingFilters.source_type,
          ...(processingFilters.search && {
            search: processingFilters.search,
          }),
        })

        const response = await adminClient.get(`/processings?${params}`, {
          baseURL: import.meta.env.VITE_BACKEND_URL + '/api/v1/visa-processing',
        })

        if (response.data.success) {
          setVisaProcessings(response.data.data || [])
          setProcessingTotal(response.data.pagination?.total || 0)
        } else {
          setProcessingError('Failed to fetch visa processings')
        }
      } catch (error) {
        console.error('Error fetching visa processings:', error)
        setProcessingError('Error loading visa processings')
      } finally {
        setProcessingLoading(false)
        setProcessingSearchLoading(false)
      }
    },
    [processingPage, processingFilters, pageSize]
  )

  // Load data based on active tab
  useEffect(() => {
    if (!jwt) {
      window.location.href = '/admin/login'
      return
    }

    if (activeTab === 'inquiries') {
      fetchInquiries()
    } else if (activeTab === 'processing') {
      fetchVisaProcessings()
    }
  }, [
    activeTab,
    inquiryPage,
    inquiryFilters,
    inquirySort,
    processingPage,
    processingFilters,
    processingSort,
    fetchInquiries,
    fetchVisaProcessings,
    jwt,
  ])

  // Fetch counts for both tabs on initial load
  useEffect(() => {
    if (!jwt) return

    const fetchCounts = async () => {
      try {
        // Fetch inquiry count
        const inquiryParams = new URLSearchParams({
          page: 1,
          limit: 1,
          status: 'ALL',
        })
        const inquiryResponse = await adminClient.get(
          `/visa/inquiries?${inquiryParams}`
        )
        if (inquiryResponse.data.success) {
          setInquiryTotal(inquiryResponse.data.pagination?.total || 0)
        }

        // Fetch processing count
        const processingParams = new URLSearchParams({
          page: 1,
          limit: 1,
          status: 'ALL',
        })
        const processingResponse = await adminClient.get(
          `/processings?${processingParams}`,
          {
            baseURL:
              import.meta.env.VITE_BACKEND_URL + '/api/v1/visa-processing',
          }
        )
        if (processingResponse.data.success) {
          setProcessingTotal(processingResponse.data.pagination?.total || 0)
        }
      } catch (error) {
        console.error('Error fetching counts:', error)
      }
    }

    fetchCounts()
  }, [jwt])

  // Debounced search for inquiries
  useEffect(() => {
    const timer = setTimeout(() => {
      setInquiryFilters((prev) => ({
        ...prev,
        search: inquirySearchInput,
      }))
    }, 500)
    return () => clearTimeout(timer)
  }, [inquirySearchInput])

  // Debounced search for processing
  useEffect(() => {
    const timer = setTimeout(() => {
      setProcessingFilters((prev) => ({
        ...prev,
        search: processingSearchInput,
      }))
    }, 500)
    return () => clearTimeout(timer)
  }, [processingSearchInput])

  const handleInquirySort = (key) => {
    setInquirySort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const handleProcessingSort = (key) => {
    setProcessingSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const handleInquiryAssignment = (
    inquiryId,
    inquiryReference,
    currentAssignedStaffId
  ) => {
    setAssignmentModal({
      isOpen: true,
      bookingId: inquiryId,
      bookingReference: inquiryReference,
      bookingType: 'visa-inquiry',
      currentAssignedStaffId: currentAssignedStaffId,
    })
  }

  const handleProcessingAssignment = (
    processingId,
    processingReference,
    currentAssignedStaffId
  ) => {
    setAssignmentModal({
      isOpen: true,
      bookingId: processingId,
      bookingReference: processingReference,
      bookingType: 'visa-processing',
      currentAssignedStaffId: currentAssignedStaffId,
    })
  }

  const handleAssignmentSuccess = () => {
    if (activeTab === 'inquiries') {
      // Always refresh to get updated assigned staff information
      fetchInquiries()
    } else if (activeTab === 'processing') {
      // Always refresh to get updated assigned staff information
      fetchVisaProcessings()
    }
  }

  const handleViewInquiry = (inquiry) => {
    setInquiryDetailsModal({
      isOpen: true,
      inquiry: inquiry,
    })
  }

  const handleMarkReadyForPayment = (inquiry) => {
    setPaymentModal({
      isOpen: true,
      inquiry: inquiry,
      paymentAmount: inquiry.payment_amount || 5000,
    })
  }

  const handlePaymentAmountChange = (amount) => {
    setPaymentModal((prev) => ({
      ...prev,
      paymentAmount: parseFloat(amount) || 0,
    }))
  }

  const handleConfirmPayment = async () => {
    if (!paymentModal.inquiry || paymentModal.paymentAmount <= 0) {
      showError('Please enter a valid payment amount')
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/visa/inquiries/${paymentModal.inquiry.id}/mark-ready-for-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
          body: JSON.stringify({
            payment_amount: paymentModal.paymentAmount,
          }),
        }
      )

      const data = await response.json()

      if (data.success) {
        showSuccess('Inquiry marked as ready for payment!')
        setPaymentModal({
          isOpen: false,
          inquiry: null,
          paymentAmount: 5000,
        })
        fetchInquiries() // Refresh the list
      } else {
        showError(data.message || 'Failed to mark inquiry as ready for payment')
      }
    } catch (error) {
      console.error('Error marking inquiry as ready for payment:', error)
      showError('Failed to mark inquiry as ready for payment')
    }
  }

  const handleRevertPayment = async (inquiry) => {
    if (
      !confirm(
        'Are you sure you want to revert this inquiry back to "Not Converted" status? This will remove the payment amount and allow the client to track their inquiry normally.'
      )
    ) {
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/visa/inquiries/${inquiry.id}/revert-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      )

      const data = await response.json()

      if (data.success) {
        showSuccess('Inquiry reverted to "Not Converted" status!')
        fetchInquiries() // Refresh the list
      } else {
        showError(data.message || 'Failed to revert inquiry status')
      }
    } catch (error) {
      console.error('Error reverting inquiry status:', error)
      showError('Failed to revert inquiry status')
    }
  }

  // Standalone processing modal handlers
  const handleManageProcessing = (processing) => {
    if (processing.source_type === 'TOUR_BOOKING') {
      // For tour-based processings, show info that they should use tour booking detail page
      showInfo(
        'Tour-based visa processings are managed through the Tour Booking Details page'
      )
    } else {
      // For standalone processings, open the standalone modal
      setStandaloneProcessingModal({
        isOpen: true,
        processing: processing,
      })
    }
  }

  const handleStandaloneProcessingClose = () => {
    setStandaloneProcessingModal({
      isOpen: false,
      processing: null,
    })
  }

  const handleStandaloneProcessingUpdate = () => {
    // Refresh the processing list
    fetchVisaProcessings()
  }

  const getStatusBadge = (status) => {
    return (
      <span className={`visa__status visa__status--${status.toLowerCase()}`}>
        {status}
      </span>
    )
  }

  const getAssignmentStatusBadge = (assignmentStatus) => {
    const statusConfig = {
      pending: { color: 'pending', label: 'Pending' },
      in_progress: { color: 'in-progress', label: 'In Progress' },
      completed: { color: 'completed', label: 'Approved' },
    }

    const config = statusConfig[assignmentStatus] || {
      color: 'default',
      label: assignmentStatus,
    }
    return (
      <span
        className={`assignment-status-badge assignment-status-badge--${config.color}`}
      >
        {config.label}
      </span>
    )
  }

  if (inquiryLoading && inquiries.length === 0 && activeTab === 'inquiries') {
    return (
      <div className='admin-visa'>
        <div className='visa__loading'>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='admin-visa'>
      <div className='admin-visa__header'>
        <div className='admin-visa__title'>
          <div className='admin-visa__header-icon'>
            <FiShield />
          </div>
          <div className='admin-visa__header-text'>
            <h1>Visa Management</h1>
            <p>Manage visa inquiries and processing</p>
          </div>
        </div>
        <button
          className='refresh-btn'
          onClick={() =>
            activeTab === 'inquiries'
              ? fetchInquiries()
              : fetchVisaProcessings()
          }
          disabled={
            activeTab === 'inquiries' ? inquiryLoading : processingLoading
          }
        >
          <FiRefreshCw
            className={
              (activeTab === 'inquiries' ? inquiryLoading : processingLoading)
                ? 'spinning'
                : ''
            }
          />
          Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className='visa-tabs'>
        <button
          className={`tab-button ${activeTab === 'inquiries' ? 'active' : ''}`}
          onClick={() => setActiveTab('inquiries')}
        >
          <FiMessageSquare className='tab-icon' />
          Visa Inquiries
          <span className='tab-count'>{inquiryTotal}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'processing' ? 'active' : ''}`}
          onClick={() => setActiveTab('processing')}
        >
          <FiPackage className='tab-icon' />
          Visa Processing
          <span className='tab-count'>{processingTotal}</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'inquiries' && (
        <div className='tab-content'>
          {/* Inquiries Stats */}
          <div className='visa__summary'>
            <div className='visa__summary-card visa__summary-card--total'>
              <div className='visa__summary-icon'>
                <FiUsers size={24} />
              </div>
              <div className='visa__summary-content'>
                <h3>Total Inquiries</h3>
                <p>{inquiryTotal}</p>
                <span className='visa__summary-label'>All inquiries</span>
              </div>
            </div>
            <div className='visa__summary-card visa__summary-card--pending'>
              <div className='visa__summary-icon'>
                <FiClockIcon size={24} />
              </div>
              <div className='visa__summary-content'>
                <h3>Pending</h3>
                <p>
                  {inquiries?.filter((i) => i.status === 'PENDING').length || 0}
                </p>
                <span className='visa__summary-label'>Awaiting review</span>
              </div>
            </div>
            <div className='visa__summary-card visa__summary-card--in-progress'>
              <div className='visa__summary-icon'>
                <FiAlertCircle size={24} />
              </div>
              <div className='visa__summary-content'>
                <h3>In Progress</h3>
                <p>
                  {inquiries?.filter((i) => i.status === 'IN_PROGRESS')
                    .length || 0}
                </p>
                <span className='visa__summary-label'>Being processed</span>
              </div>
            </div>
            <div className='visa__summary-card visa__summary-card--approved'>
              <div className='visa__summary-icon'>
                <FiCheckCircle size={24} />
              </div>
              <div className='visa__summary-content'>
                <h3>Approved</h3>
                <p>
                  {inquiries?.filter((i) => i.status === 'COMPLETED').length ||
                    0}
                </p>
                <span className='visa__summary-label'>Completed</span>
              </div>
            </div>
          </div>

          {/* Inquiries Table */}
          <div className='visa__section'>
            <div className='visa__section-header'>
              <div className='visa__section-title'>
                <FiMessageSquare size={24} />
                <h2>Visa Inquiries</h2>
                <span className='visa__section-count'>
                  ({inquiryTotal} inquiries)
                </span>
                {inquirySearchLoading && (
                  <div className='visa__search-loading'>
                    <div className='visa__search-spinner'></div>
                    <span>Searching...</span>
                  </div>
                )}
              </div>
            </div>

            {inquiryError && (
              <div className='visa__error-message'>
                <FiAlertCircle />
                {inquiryError}
              </div>
            )}

            <div className='visa__table-container'>
              <table className='visa__table'>
                <thead>
                  <tr>
                    <th onClick={() => handleInquirySort('reference')}>
                      Reference
                    </th>
                    <th onClick={() => handleInquirySort('created_at')}>
                      Date
                    </th>
                    <th onClick={() => handleInquirySort('status')}>Status</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Destination</th>
                    <th>Visa Type</th>
                    <th>Assignment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries?.map((inquiry) => (
                    <tr key={inquiry.id}>
                      <td className='reference-cell'>
                        <span className='reference-text'>
                          {inquiry.inquiry_reference}
                        </span>
                      </td>
                      <td>
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </td>
                      <td>{getStatusBadge(inquiry.status)}</td>
                      <td>
                        <div className='name-cell'>
                          <span className='name-text'>{inquiry.full_name}</span>
                        </div>
                      </td>
                      <td>
                        <a
                          href={`mailto:${inquiry.email_address}`}
                          className='email-link'
                        >
                          <FiMail size={14} />
                          {inquiry.email_address}
                        </a>
                      </td>
                      <td>
                        <a
                          href={getMobileTelHref(inquiry.mobile_number)}
                          className='phone-link'
                        >
                          <FiPhone size={14} />
                          {formatMobileNumber(inquiry.mobile_number)}
                        </a>
                      </td>
                      <td>
                        <span className='destination-text'>
                          {inquiry.destination}
                        </span>
                      </td>
                      <td>
                        <span className='visa-type-text'>
                          {inquiry.visa_type}
                        </span>
                      </td>
                      <td className='visa__table-cell visa__table-cell--assignment'>
                        <div className='visa__assignment'>
                          {inquiry.assigned_to ? (
                            <div className='visa__assignment-assigned'>
                              <div className='visa__assignment-staff'>
                                <span className='visa__assignment-staff-name'>
                                  {inquiry.assigned_staff_first_name}{' '}
                                  {inquiry.assigned_staff_last_name}
                                </span>
                                <span className='visa__assignment-staff-email'>
                                  {inquiry.assigned_staff_email}
                                </span>
                                {!inquiry.assigned_by && (
                                  <span className='visa__assignment-auto'>
                                    <FiActivity size={12} />
                                    Auto-assigned
                                  </span>
                                )}
                              </div>
                              <span
                                className={`visa__assignment-status visa__assignment-status--${inquiry.assignment_status}`}
                              >
                                {inquiry.assignment_status?.replace('_', ' ') ||
                                  'pending'}
                              </span>
                              <span className='visa__assignment-date'>
                                {inquiry.assigned_at
                                  ? new Date(
                                      inquiry.assigned_at
                                    ).toLocaleDateString()
                                  : '-'}
                              </span>
                            </div>
                          ) : (
                            <span className='visa__assignment-unassigned'>
                              Unassigned
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className='action-buttons'>
                          {/* Show conversion status */}
                          {inquiry.conversion_status === 'CONVERTED' && (
                            <span
                              className='badge badge--success'
                              title='Converted to Processing'
                            >
                              <FiCheckCircle size={14} />
                              Converted
                            </span>
                          )}
                          {inquiry.conversion_status === 'AWAITING_PAYMENT' && (
                            <span
                              className='badge badge--warning'
                              title='Awaiting Payment'
                            >
                              <FiClock size={24} />
                              Awaiting Payment
                            </span>
                          )}

                          <div className='flex gap-2 justify-center'>
                            {userRole === 'admin' && (
                              <button
                                className='action-btn assign-btn'
                                onClick={() =>
                                  handleInquiryAssignment(
                                    inquiry.id,
                                    inquiry.inquiry_reference,
                                    inquiry.assigned_to
                                  )
                                }
                                title='Assign Inquiry'
                              >
                                <FiUserPlus size={16} />
                              </button>
                            )}

                            {/* View Details - Now functional! */}
                            <button
                              className='action-btn view-btn'
                              onClick={() => handleViewInquiry(inquiry)}
                              title='View Details'
                            >
                              <FiEye size={16} />
                            </button>

                            {/* Mark as Ready for Payment */}
                            {inquiry.conversion_status === 'NOT_CONVERTED' &&
                              userRole === 'admin' && (
                                <button
                                  className='action-btn payment-btn'
                                  onClick={() =>
                                    handleMarkReadyForPayment(inquiry)
                                  }
                                  title='Mark as Ready for Payment'
                                >
                                  <FiDollarSign size={16} />
                                </button>
                              )}

                            {/* Revert from AWAITING_PAYMENT */}
                            {inquiry.conversion_status === 'AWAITING_PAYMENT' &&
                              userRole === 'admin' && (
                                <button
                                  className='action-btn revert-btn'
                                  onClick={() => handleRevertPayment(inquiry)}
                                  title='Revert to Not Converted'
                                >
                                  <FiX size={16} />
                                </button>
                              )}

                            {/* Link to processing if converted */}
                            {inquiry.converted_to_processing_id && (
                              <button
                                className='action-btn link-btn'
                                onClick={() => {
                                  setActiveTab('processing')
                                  // TODO: Filter/highlight the processing record
                                }}
                                title='View Processing'
                              >
                                <FiNavigation size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className='visa__pagination-container'>
              <ReactPaginate
                previousLabel={'← Previous'}
                nextLabel={'Next →'}
                pageCount={Math.ceil(inquiryTotal / pageSize)}
                onPageChange={({ selected }) => setInquiryPage(selected)}
                containerClassName={'visa__pagination'}
                activeClassName={'visa__pagination--active'}
                forcePage={inquiryPage}
                breakLabel={'...'}
                pageRangeDisplayed={3}
                marginPagesDisplayed={1}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'processing' && (
        <div className='tab-content'>
          {/* Processing Stats */}
          <div className='visa__summary'>
            <div className='visa__summary-card visa__summary-card--total'>
              <div className='visa__summary-icon'>
                <FiPackage size={24} />
              </div>
              <div className='visa__summary-content'>
                <h3>Total Processings</h3>
                <p>{processingTotal}</p>
                <span className='visa__summary-label'>All processings</span>
              </div>
            </div>
            <div className='visa__summary-card visa__summary-card--pending'>
              <div className='visa__summary-icon'>
                <FiClockIcon size={24} />
              </div>
              <div className='visa__summary-content'>
                <h3>Pending</h3>
                <p>
                  {visaProcessings?.filter((p) => p.status === 'PENDING')
                    .length || 0}
                </p>
                <span className='visa__summary-label'>Awaiting review</span>
              </div>
            </div>
            <div className='visa__summary-card visa__summary-card--in-progress'>
              <div className='visa__summary-icon'>
                <FiAlertCircle size={24} />
              </div>
              <div className='visa__summary-content'>
                <h3>In Progress</h3>
                <p>
                  {visaProcessings?.filter((p) => p.status === 'IN_PROGRESS')
                    .length || 0}
                </p>
                <span className='visa__summary-label'>Being processed</span>
              </div>
            </div>
            <div className='visa__summary-card visa__summary-card--approved'>
              <div className='visa__summary-icon'>
                <FiCheckCircle size={24} />
              </div>
              <div className='visa__summary-content'>
                <h3>Approved</h3>
                <p>
                  {visaProcessings?.filter((p) => p.status === 'APPROVED')
                    .length || 0}
                </p>
                <span className='visa__summary-label'>Completed</span>
              </div>
            </div>
          </div>

          {/* Processing Table */}
          <div className='visa__section'>
            <div className='visa__section-header'>
              <div className='visa__section-title'>
                <FiPackage size={24} />
                <h2>Visa Processing</h2>
                <span className='visa__section-count'>
                  ({processingTotal} processings)
                </span>
                {processingSearchLoading && (
                  <div className='visa__search-loading'>
                    <div className='visa__search-spinner'></div>
                    <span>Searching...</span>
                  </div>
                )}
              </div>
              <div className='visa__section-filters'>
                <select
                  value={processingFilters.source_type || 'ALL'}
                  onChange={(e) =>
                    setProcessingFilters((prev) => ({
                      ...prev,
                      source_type: e.target.value,
                    }))
                  }
                  className='filter-select'
                >
                  <option value='ALL'>All Sources</option>
                  <option value='TOUR_BOOKING'>Tour-based</option>
                  <option value='VISA_INQUIRY'>Standalone</option>
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '10px' }}>
                  <input
                    type='checkbox'
                    id='show_my_bookings_visa'
                    checked={processingFilters.show_my_bookings}
                    onChange={(e) =>
                      setProcessingFilters((prev) => ({
                        ...prev,
                        show_my_bookings: e.target.checked,
                      }))
                    }
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <label htmlFor='show_my_bookings_visa' style={{ margin: 0, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                    <FiUser style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    My Processings
                  </label>
                </div>
              </div>
            </div>

            {processingError && (
              <div className='visa__error-message'>
                <FiAlertCircle />
                {processingError}
              </div>
            )}

            <div className='visa__table-container'>
              <table className='visa__table'>
                <thead>
                  <tr>
                    <th onClick={() => handleProcessingSort('id')}>
                      Reference
                    </th>
                    <th onClick={() => handleProcessingSort('created_at')}>
                      Date
                    </th>
                    <th onClick={() => handleProcessingSort('status')}>
                      Status
                    </th>
                    <th>Passenger</th>
                    <th>Email</th>
                    <th>Country</th>
                    <th>Visa Type</th>
                    <th>Tour Booking</th>
                    <th>Assignment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visaProcessings?.map((processing) => (
                    <tr key={processing.id}>
                      <td className='reference-cell'>
                        <span className='reference-text'>
                          {processing.processing_reference}
                        </span>
                      </td>
                      <td>
                        {new Date(processing.created_at).toLocaleDateString()}
                      </td>
                      <td>{getStatusBadge(processing.status)}</td>
                      <td>
                        <div className='name-cell'>
                          <span className='name-text'>
                            {processing.passenger_name}
                          </span>
                        </div>
                      </td>
                      <td>
                        {processing.passenger_email ? (
                          <a
                            href={`mailto:${processing.passenger_email}`}
                            className='email-link'
                          >
                            <FiMail size={14} />
                            {processing.passenger_email}
                          </a>
                        ) : (
                          <span className='no-data'>-</span>
                        )}
                      </td>
                      <td>
                        <span className='country-text'>
                          {processing.country}
                        </span>
                      </td>
                      <td>
                        <span className='visa-type-text'>
                          {processing.visa_type}
                        </span>
                      </td>
                      <td>
                        {processing.source_type === 'TOUR_BOOKING' ? (
                          <a
                            href={`/admin/tour-sales/${processing.tour_booking_id}`}
                            className='booking-link'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <FiPackage size={26} />
                            View Tour Booking
                          </a>
                        ) : processing.source_type === 'VISA_INQUIRY' ? (
                          <div className='source-badge source-badge--standalone'>
                            <FiX size={14} />
                            No
                          </div>
                        ) : (
                          <span className='no-data'>-</span>
                        )}
                      </td>
                      <td className='visa__table-cell visa__table-cell--assignment'>
                        <div className='visa__assignment'>
                          {processing.assigned_to ? (
                            <div className='visa__assignment-assigned'>
                              <div className='visa__assignment-staff'>
                                <span className='visa__assignment-staff-name'>
                                  {processing.assigned_staff_first_name}{' '}
                                  {processing.assigned_staff_last_name}
                                </span>
                                <span className='visa__assignment-staff-email'>
                                  {processing.assigned_staff_email}
                                </span>
                                {!processing.assigned_by && (
                                  <span className='visa__assignment-auto'>
                                    <FiActivity size={12} />
                                    Auto-assigned
                                  </span>
                                )}
                              </div>
                              <span
                                className={`visa__assignment-status visa__assignment-status--${processing.assignment_status}`}
                              >
                                {processing.assignment_status?.replace(
                                  '_',
                                  ' '
                                ) || 'pending'}
                              </span>
                              <span className='visa__assignment-date'>
                                {processing.assigned_at
                                  ? new Date(
                                      processing.assigned_at
                                    ).toLocaleDateString()
                                  : '-'}
                              </span>
                            </div>
                          ) : (
                            <span className='visa__assignment-unassigned'>
                              Unassigned
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className='flex gap-2 justify-center'>
                          {userRole === 'admin' && (
                            <button
                              className='action-btn assign-btn'
                              onClick={() =>
                                handleProcessingAssignment(
                                  processing.id,
                                  processing.processing_reference,
                                  processing.assigned_to
                                )
                              }
                              title='Assign Processing'
                            >
                              <FiUserPlus size={16} />
                            </button>
                          )}
                          <button
                            className='action-btn manage-btn'
                            onClick={() => handleManageProcessing(processing)}
                            title='Manage Processing'
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            className='action-btn view-btn'
                            onClick={() => {
                              // TODO: Open processing details modal
                              showInfo(
                                `View processing details for ${processing.processing_reference}`
                              )
                            }}
                            title='View Details'
                          >
                            <FiEye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className='visa__pagination-container'>
              <ReactPaginate
                previousLabel={'← Previous'}
                nextLabel={'Next →'}
                pageCount={Math.ceil(processingTotal / pageSize)}
                onPageChange={({ selected }) => setProcessingPage(selected)}
                containerClassName={'visa__pagination'}
                activeClassName={'visa__pagination--active'}
                forcePage={processingPage}
                breakLabel={'...'}
                pageRangeDisplayed={3}
                marginPagesDisplayed={1}
              />
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={assignmentModal.isOpen}
        onClose={() =>
          setAssignmentModal({
            isOpen: false,
            bookingId: null,
            bookingReference: '',
            bookingType: 'visa-inquiry',
            currentAssignedStaffId: null,
          })
        }
        bookingId={assignmentModal.bookingId}
        bookingReference={assignmentModal.bookingReference}
        bookingType={assignmentModal.bookingType}
        currentAssignedStaffId={assignmentModal.currentAssignedStaffId}
        onSuccess={handleAssignmentSuccess}
      />

      {/* Inquiry Details Modal */}
      {inquiryDetailsModal.isOpen && (
        <div
          className='modal-overlay'
          onClick={() =>
            setInquiryDetailsModal({ isOpen: false, inquiry: null })
          }
        >
          <div
            className='modal-content'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='modal-header'>
              <h3>Inquiry Details</h3>
              <button
                className='modal-close'
                onClick={() =>
                  setInquiryDetailsModal({
                    isOpen: false,
                    inquiry: null,
                  })
                }
              >
                <FiX size={20} />
              </button>
            </div>
            <div className='modal-body'>
              {inquiryDetailsModal.inquiry && (
                <div className='inquiry-details'>
                  <div className='detail-row'>
                    <span className='detail-label'>Reference:</span>
                    <span className='detail-value'>
                      {inquiryDetailsModal.inquiry.inquiry_reference}
                    </span>
                  </div>
                  <div className='detail-row'>
                    <span className='detail-label'>Status:</span>
                    <span className='detail-value'>
                      {inquiryDetailsModal.inquiry.status}
                    </span>
                  </div>
                  <div className='detail-row'>
                    <span className='detail-label'>Conversion Status:</span>
                    <span className='detail-value'>
                      {inquiryDetailsModal.inquiry.conversion_status ===
                      'CONVERTED' ? (
                        <span
                          className='badge badge--success'
                          title='Converted to Processing'
                        >
                          <FiCheckCircle size={14} />
                          Converted
                        </span>
                      ) : inquiryDetailsModal.inquiry.conversion_status ===
                        'AWAITING_PAYMENT' ? (
                        <span
                          className='badge badge--warning'
                          title='Awaiting Payment'
                        >
                          <FiClock size={14} />
                          Awaiting Payment
                        </span>
                      ) : (
                        <span
                          className='badge badge--secondary'
                          title='Not Converted'
                        >
                          <FiFileText size={14} />
                          Not Converted
                        </span>
                      )}
                    </span>
                  </div>
                  <div className='detail-row'>
                    <span className='detail-label'>Full Name:</span>
                    <span className='detail-value'>
                      {inquiryDetailsModal.inquiry.full_name}
                    </span>
                  </div>
                  <div className='detail-row'>
                    <span className='detail-label'>Email:</span>
                    <span className='detail-value'>
                      {inquiryDetailsModal.inquiry.email_address}
                    </span>
                  </div>
                  <div className='detail-row'>
                    <span className='detail-label'>Mobile:</span>
                    <span className='detail-value'>
                      {formatMobileNumber(
                        inquiryDetailsModal.inquiry.mobile_number
                      )}
                    </span>
                  </div>
                  <div className='detail-row'>
                    <span className='detail-label'>Visa Type:</span>
                    <span className='detail-value'>
                      {inquiryDetailsModal.inquiry.visa_type}
                    </span>
                  </div>
                  <div className='detail-row'>
                    <span className='detail-label'>Destination:</span>
                    <span className='detail-value'>
                      {inquiryDetailsModal.inquiry.destination}
                    </span>
                  </div>
                  <div className='detail-row'>
                    <span className='detail-label'>Submitted:</span>
                    <span className='detail-value'>
                      {new Date(
                        inquiryDetailsModal.inquiry.created_at
                      ).toLocaleString()}
                    </span>
                  </div>
                  {inquiryDetailsModal.inquiry.message && (
                    <div className='detail-row'>
                      <span className='detail-label'>Message:</span>
                      <div className='detail-value message-content'>
                        {inquiryDetailsModal.inquiry.message}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <div
          className='modal-overlay'
          onClick={() =>
            setPaymentModal({
              isOpen: false,
              inquiry: null,
              paymentAmount: 5000,
            })
          }
        >
          <div
            className='modal-content'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='modal-header'>
              <h3>Mark as Ready for Payment</h3>
              <button
                className='modal-close'
                onClick={() =>
                  setPaymentModal({
                    isOpen: false,
                    inquiry: null,
                    paymentAmount: 5000,
                  })
                }
              >
                <FiX size={20} />
              </button>
            </div>
            <div className='modal-body'>
              {paymentModal.inquiry && (
                <div className='payment-modal-content'>
                  <div className='inquiry-summary'>
                    <h4>Inquiry Details</h4>
                    <p>
                      <strong>Reference:</strong>{' '}
                      {paymentModal.inquiry.inquiry_reference}
                    </p>
                    <p>
                      <strong>Client:</strong> {paymentModal.inquiry.full_name}
                    </p>
                    <p>
                      <strong>Email:</strong>{' '}
                      {paymentModal.inquiry.email_address}
                    </p>
                    <p>
                      <strong>Visa Type:</strong>{' '}
                      {paymentModal.inquiry.visa_type}
                    </p>
                    <p>
                      <strong>Destination:</strong>{' '}
                      {paymentModal.inquiry.destination}
                    </p>
                  </div>

                  <div className='payment-amount-section'>
                    <h4>Set Payment Amount</h4>
                    <div className='amount-input-group'>
                      <span className='currency-symbol'>₱</span>
                      <input
                        type='number'
                        value={paymentModal.paymentAmount}
                        onChange={(e) =>
                          handlePaymentAmountChange(e.target.value)
                        }
                        className='amount-input'
                        placeholder='5000'
                        min='0'
                        step='100'
                      />
                    </div>
                    <p className='amount-help-text'>
                      This amount will be shown to the client when they track
                      their inquiry.
                    </p>
                  </div>

                  <div className='modal-actions'>
                    <button
                      className='btn btn-secondary'
                      onClick={() =>
                        setPaymentModal({
                          isOpen: false,
                          inquiry: null,
                          paymentAmount: 5000,
                        })
                      }
                    >
                      Cancel
                    </button>
                    <button
                      className='btn btn-primary'
                      onClick={handleConfirmPayment}
                      disabled={paymentModal.paymentAmount <= 0}
                    >
                      <FiDollarSign size={16} />
                      Mark as Ready for Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Standalone Visa Processing Modal */}
      <StandaloneVisaProcessingModal
        isOpen={standaloneProcessingModal.isOpen}
        onClose={handleStandaloneProcessingClose}
        processing={standaloneProcessingModal.processing}
        onStatusUpdate={handleStandaloneProcessingUpdate}
      />
    </div>
  )
}

export default AdminVisa
