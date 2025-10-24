import { useState, useEffect } from 'react'
import axios from 'axios'
import './VisaRequirements.css'
import VisaRequirementModal from '../../components/admin/VisaRequirementModal'
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiShield,
} from 'react-icons/fi'

const VisaRequirements = () => {
  const [requirements, setRequirements] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRequirement, setSelectedRequirement] = useState(null)
  const [modalMode, setModalMode] = useState('edit')
  const [expandedRow, setExpandedRow] = useState(null)

  const fetchRequirements = async (isSearching = false) => {
    if (isSearching) {
      setSearchLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams()

      if (search) params.append('search', search)

      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/admin/visa-requirements?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setRequirements(response.data.requirements || [])
    } catch (error) {
      console.error('Error fetching visa requirements:', error)
      alert('Failed to fetch visa requirements')
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }

  // Auto-fetch on mount
  useEffect(() => {
    fetchRequirements()
  }, [])

  // Auto-search when search term changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (loading) return // Don't search during initial load
      fetchRequirements(true)
    }, 500)

    return () => clearTimeout(delayDebounce)
  }, [search])

  const handleEdit = (requirement) => {
    setSelectedRequirement(requirement)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedRequirement(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken')

      if (modalMode === 'create') {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/visa-requirements`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      } else {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/visa-requirements/${
            formData.country_code
          }`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      }

      fetchRequirements()
    } catch (error) {
      console.error('Error saving requirement:', error)
      throw error
    }
  }

  const handleDelete = async (requirement) => {
    try {
      const token = localStorage.getItem('adminToken')

      // Check if deletion is allowed
      const checkResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/visa-requirements/${
          requirement.country_code
        }/can-delete`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!checkResponse.data.canDelete) {
        alert(
          `Cannot delete ${requirement.country_name} - currently used in ${checkResponse.data.activeTourCount} active tour(s):\n\n` +
            checkResponse.data.tours.map((t) => `• ${t.title}`).join('\n')
        )
        return
      }

      if (
        !confirm(
          `Are you sure you want to delete the visa requirement for ${requirement.country_name}?`
        )
      ) {
        return
      }

      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/visa-requirements/${
          requirement.country_code
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      alert('Visa requirement deleted successfully')
      fetchRequirements()
    } catch (error) {
      console.error('Error deleting requirement:', error)
      alert(error.response?.data?.error || 'Failed to delete requirement')
    }
  }

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  return (
    <div className='visa-requirements-container'>
      <div className='visa-requirements-header'>
        <div className='visa-requirements-header-content'>
          <div className='visa-requirements-header-icon'>
            <FiShield size={32} />
          </div>
          <div className='visa-requirements-header-text'>
            <h1>Visa Requirements</h1>
            <p>Manage visa requirements for tour packages</p>
          </div>
        </div>
        <div className='visa-requirements-header-actions'>
          <button
            className='visa-requirements-action-btn visa-requirements-action-btn--create'
            onClick={handleCreate}
          >
            <FiPlus size={16} />
            Add Country
          </button>
        </div>
      </div>

      <div className='search-section'>
        <div className='search-input-wrapper'>
          <FiSearch className='search-icon' />
          <input
            type='text'
            placeholder='Search by country name...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searchLoading && <div className='search-loading-spinner'></div>}
        </div>
        {search && (
          <button
            className='clear-search-button'
            onClick={() => setSearch('')}
            title='Clear search'
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className='loading'>Loading...</div>
      ) : (
        <div className='requirements-table-section'>
          <table className='requirements-table'>
            <thead>
              <tr>
                <th>Country</th>
                <th>Visa Required</th>
                <th>Documents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requirements.length > 0 ? (
                requirements.map((req) => (
                  <>
                    <tr
                      key={req.id}
                      onClick={() => toggleExpand(req.id)}
                    >
                      <td>
                        <div className='country-cell'>
                          <strong>{req.country_name}</strong>
                          <span className='country-code'>
                            {req.country_code}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`visa-badge ${
                            req.requires_visa ? 'required' : 'not-required'
                          }`}
                        >
                          {req.requires_visa ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <span className='doc-count'>
                          {req.required_documents.length} document(s)
                        </span>
                      </td>
                      <td
                        className='actions-cell'
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className='edit-button'
                          onClick={() => handleEdit(req)}
                          title='Edit'
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          className='delete-button'
                          onClick={() => handleDelete(req)}
                          title='Delete'
                        >
                          <FiTrash2 size={16} />
                        </button>
                        <button className='expand-button'>
                          {expandedRow === req.id ? (
                            <FiChevronUp size={16} />
                          ) : (
                            <FiChevronDown size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRow === req.id && (
                      <tr className='expanded-row'>
                        <td colSpan='4'>
                          <div className='expanded-content'>
                            <div className='detail-section'>
                              <strong>Required Documents:</strong>
                              <ul>
                                {req.required_documents.length > 0 ? (
                                  req.required_documents.map((doc, idx) => (
                                    <li key={idx}>{doc}</li>
                                  ))
                                ) : (
                                  <li className='no-data'>
                                    No documents specified
                                  </li>
                                )}
                              </ul>
                            </div>
                            {req.processing_time && (
                              <div className='detail-section'>
                                <strong>Processing Time:</strong>
                                <p>{req.processing_time}</p>
                              </div>
                            )}
                            {req.notes && (
                              <div className='detail-section'>
                                <strong>Notes:</strong>
                                <p>{req.notes}</p>
                              </div>
                            )}
                            <div className='detail-section'>
                              <small>
                                Last updated:{' '}
                                {new Date(req.updated_at).toLocaleString()}
                                {req.updatedByEmail &&
                                  ` by ${req.updatedByEmail}`}
                              </small>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td
                    colSpan='4'
                    className='no-data'
                  >
                    No visa requirements found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <VisaRequirementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requirement={selectedRequirement}
        onSave={handleSave}
        mode={modalMode}
      />
    </div>
  )
}

export default VisaRequirements
