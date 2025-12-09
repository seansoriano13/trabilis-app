import { useState, useEffect } from 'react'
import axios from 'axios'
import './Settings.css'
import AdminPrimaryButton from '../../components/admin/AdminPrimaryButton'
import { useSnackbar } from '../../context/SnackbarContext'
import { BACKEND_URL } from '../../config'

const Settings = () => {
  const { showSuccess, showError } = useSnackbar()
  const [activeTab, setActiveTab] = useState('email-settings')
  const [deletedTours, setDeletedTours] = useState([])
  const [loading, setLoading] = useState(false)

  // Navigate function for Visa Requirements
  const navigate = (path) => {
    window.location.href = path
  }

  // Email settings state
  const [emailDelay, setEmailDelay] = useState(1)
  const [newEmailDelay, setNewEmailDelay] = useState(1)
  const [updating, setUpdating] = useState(false)

  // Itinerary settings state
  const [itineraryImageLimit, setItineraryImageLimit] = useState(10)
  const [newItineraryImageLimit, setNewItineraryImageLimit] = useState(10)
  const [updatingItineraryLimit, setUpdatingItineraryLimit] = useState(false)

  const fetchDeletedTours = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/settings/recycle-bin`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setDeletedTours(response.data.tours || [])
    } catch (error) {
      console.error('Error fetching deleted tours:', error)
      showError('Failed to fetch deleted tours')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmailDelay = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/ratings/email-delay`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setEmailDelay(response.data.days)
      setNewEmailDelay(response.data.days)
    } catch (error) {
      console.error('Error fetching email delay:', error)
    }
  }

  const handleUpdateEmailDelay = async () => {
    setUpdating(true)
    try {
      const token = localStorage.getItem('adminToken')
      await axios.put(
        `${BACKEND_URL}/api/v1/ratings/email-delay`,
        { days: newEmailDelay },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setEmailDelay(newEmailDelay)
      showSuccess('Email delay updated successfully')
    } catch (error) {
      console.error('Error updating email delay:', error)
      showError('Failed to update email delay')
    } finally {
      setUpdating(false)
    }
  }

  const handleDryRunEmails = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      await axios.post(
        `${BACKEND_URL}/api/v1/admin/send-rating-emails/dry-run`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      showSuccess(
        'Dry run completed! Check your server console logs to see which emails would be sent.'
      )
    } catch (error) {
      console.error('Error in dry run:', error)
      showError(error.response?.data?.error || 'Failed to run dry run test')
    } finally {
      setLoading(false)
    }
  }

  const handleSendRatingEmails = async () => {
    if (
      !confirm(
        'This will send rating request emails to all eligible customers. Continue?'
      )
    ) {
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      await axios.post(
        `${BACKEND_URL}/api/v1/admin/send-rating-emails`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      showSuccess('Rating emails sent successfully!')
    } catch (error) {
      console.error('Error sending rating emails:', error)
      showError(error.response?.data?.error || 'Failed to send rating emails')
    } finally {
      setLoading(false)
    }
  }

  const handleCleanupRecycleBin = async () => {
    if (
      !confirm(
        '⚠️ This will permanently delete all tours that have been in the recycle bin for more than 30 days. This action CANNOT be undone! Continue?'
      )
    ) {
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      await axios.post(
        `${BACKEND_URL}/api/v1/admin/cleanup-recycle-bin`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      showSuccess('Recycle bin cleanup completed successfully!')
      // Refresh the deleted tours list
      if (activeTab === 'recycle-bin') {
        fetchDeletedTours()
      }
    } catch (error) {
      console.error('Error cleaning recycle bin:', error)
      showError(error.response?.data?.error || 'Failed to cleanup recycle bin')
    } finally {
      setLoading(false)
    }
  }

  const fetchItineraryImageLimit = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/admin/settings/itinerary-image-limit`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setItineraryImageLimit(response.data.max)
      setNewItineraryImageLimit(response.data.max)
    } catch (error) {
      console.error('Error fetching itinerary image limit:', error)
    }
  }

  const handleUpdateItineraryImageLimit = async () => {
    setUpdatingItineraryLimit(true)
    try {
      const token = localStorage.getItem('adminToken')
      await axios.put(
        `${BACKEND_URL}/api/v1/admin/settings/itinerary-image-limit`,
        { max: newItineraryImageLimit },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setItineraryImageLimit(newItineraryImageLimit)
      showSuccess('Itinerary image limit updated successfully')
    } catch (error) {
      console.error('Error updating itinerary image limit:', error)
      showError(error.response?.data?.error || 'Failed to update itinerary image limit')
    } finally {
      setUpdatingItineraryLimit(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'recycle-bin') {
      fetchDeletedTours()
    } else if (activeTab === 'email-settings') {
      fetchEmailDelay()
    } else if (activeTab === 'general') {
      fetchItineraryImageLimit()
    }
  }, [activeTab])

  const handleRestore = async (tourId) => {
    if (!confirm('Are you sure you want to restore this tour?')) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/admin/settings/recycle-bin/${tourId}/restore`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      showSuccess('Tour restored successfully')
      fetchDeletedTours()
    } catch (error) {
      console.error('Error restoring tour:', error)
      showError('Failed to restore tour')
    }
  }

  const handlePermanentDelete = async (tourId) => {
    if (
      !confirm(
        '⚠️ WARNING: This will PERMANENTLY delete the tour and all related data. This action CANNOT be undone! Are you sure?'
      )
    ) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      await axios.delete(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/admin/settings/recycle-bin/${tourId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      showSuccess('Tour permanently deleted')
      fetchDeletedTours()
    } catch (error) {
      console.error('Error permanently deleting tour:', error)
      showError('Failed to permanently delete tour')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className='settings-container'>
      <div className='settings-header'>
        <h1>Settings</h1>
      </div>

      <div className='settings-tabs'>
        <button
          className={`tab-button ${
            activeTab === 'email-settings' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('email-settings')}
        >
          <span>Email Settings</span>
        </button>
        <button
          className={`tab-button ${
            activeTab === 'recycle-bin' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('recycle-bin')}
        >
          <span>Recycle Bin</span>
        </button>
        <button
          className={`tab-button ${
            activeTab === 'visa-requirements' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('visa-requirements')}
        >
          <span>Visa Requirements</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <span>General Settings</span>
        </button>
      </div>

      <div className='settings-content'>
        {activeTab === 'email-settings' && (
          <div className='email-settings-section'>
            <div className='section-header'>
              <h2>Rating Email Settings</h2>
              <p className='section-description'>
                Configure when to send rating request emails to customers after
                their tour ends
              </p>
            </div>

            <div className='setting-item'>
              <label className='setting-label'>
                Send rating request email (days after tour ends):
              </label>
              <div className='setting-controls'>
                <input
                  type='number'
                  min='0'
                  value={newEmailDelay}
                  onChange={(e) => setNewEmailDelay(parseInt(e.target.value))}
                  className='setting-input'
                />
                <AdminPrimaryButton
                  buttonText={updating ? 'Updating...' : 'Update'}
                  onClick={handleUpdateEmailDelay}
                  disabled={updating || newEmailDelay === emailDelay}
                  loading={updating}
                />
              </div>
              <p className='setting-help-text'>
                Current setting: Emails are sent <strong>{emailDelay}</strong>{' '}
                day(s) after the tour ends
              </p>
            </div>

            <div className='divider'></div>

            <div className='section-header'>
              <h2>Manual Email Triggers</h2>
              <p className='section-description'>
                Manually send rating request emails to customers whose tours
                have ended
              </p>
            </div>

            <div className='setting-item'>
              <label className='setting-label'>
                Send Rating Request Emails:
              </label>
              <p
                className='setting-help-text'
                style={{ marginBottom: '15px' }}
              >
                This will check for all completed tours and send rating request
                emails to eligible customers (based on the delay setting above).
                Customers who already received an email will be skipped.
              </p>
              <div className='button-group'>
                <AdminPrimaryButton
                  buttonText='🔍 Test (Dry Run)'
                  onClick={handleDryRunEmails}
                  disabled={loading}
                  loading={loading}
                  variant='secondary'
                  style={{
                    background: '#6c757d',
                    marginRight: '10px',
                  }}
                />
                <AdminPrimaryButton
                  buttonText='✉️ Send Rating Emails'
                  onClick={handleSendRatingEmails}
                  disabled={loading}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recycle-bin' && (
          <div className='recycle-bin-section'>
            <div className='section-header'>
              <h2>Deleted Tours</h2>
              <p className='info-text'>
                ⚠️ Tours in the recycle bin for more than 30 days can be
                permanently deleted using the cleanup button below
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <AdminPrimaryButton
                buttonText='🗑️ Cleanup Expired Tours'
                onClick={handleCleanupRecycleBin}
                disabled={loading}
                loading={loading}
                style={{
                  background: '#dc3545',
                }}
              />
            </div>

            {loading ? (
              <div className='loading'>Loading...</div>
            ) : deletedTours.length > 0 ? (
              <table className='recycle-bin-table'>
                <thead>
                  <tr>
                    <th>Tour Title</th>
                    <th>Deleted Date</th>
                    <th>Deleted By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedTours.map((tour) => (
                    <tr key={tour.id}>
                      <td>{tour.title}</td>
                      <td>{formatDate(tour.deleted_at)}</td>
                      <td>{tour.deletedByEmail}</td>
                      <td className='actions-cell'>
                        <button
                          className='restore-button'
                          onClick={() => handleRestore(tour.id)}
                        >
                          Restore
                        </button>
                        <button
                          className='permanent-delete-button'
                          onClick={() => handlePermanentDelete(tour.id)}
                        >
                          Permanent Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className='no-data'>
                <p>Recycle bin is empty</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'visa-requirements' && (
          <div className='visa-requirements-section'>
            <div className='section-header'>
              <h2>Visa Requirements Management</h2>
              <p className='section-description'>
                Manage visa requirements for different countries
              </p>
            </div>
            <div className='visa-requirements-redirect'>
              <p>
                Click the button below to manage visa requirements for tour
                packages
              </p>
              <button
                className='redirect-button'
                onClick={() => navigate('/admin/visa-requirements')}
              >
                <span>Go to Visa Requirements</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className='general-settings-section'>
            <div className='section-header'>
              <h2>Itinerary Settings</h2>
              <p className='section-description'>
                Configure settings for tour itinerary management
              </p>
            </div>

            <div className='setting-item'>
              <label className='setting-label'>
                Maximum images per itinerary day:
              </label>
              <div className='setting-controls'>
                <input
                  type='number'
                  min='1'
                  max='50'
                  value={newItineraryImageLimit}
                  onChange={(e) =>
                    setNewItineraryImageLimit(parseInt(e.target.value) || 10)
                  }
                  className='setting-input'
                />
                <AdminPrimaryButton
                  buttonText={
                    updatingItineraryLimit ? 'Updating...' : 'Update'
                  }
                  onClick={handleUpdateItineraryImageLimit}
                  disabled={
                    updatingItineraryLimit ||
                    newItineraryImageLimit === itineraryImageLimit
                  }
                  loading={updatingItineraryLimit}
                />
              </div>
              <p className='setting-help-text'>
                Current setting: Maximum <strong>{itineraryImageLimit}</strong>{' '}
                image(s) per itinerary day (range: 1-50)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings
