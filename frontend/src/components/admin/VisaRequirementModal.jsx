import { useState, useEffect } from 'react'
import Modal from 'react-modal'
import './VisaRequirementModal.css'
import { FiX, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi'

const VisaRequirementModal = ({
  isOpen,
  onClose,
  requirement,
  onSave,
  mode = 'edit',
}) => {
  const [formData, setFormData] = useState({
    country_code: '',
    country_name: '',
    requires_visa: false,
    required_documents: [],
    processing_time: '',
    notes: '',
  })

  const [newDocument, setNewDocument] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (requirement && mode === 'edit') {
      setFormData({
        country_code: requirement.country_code || '',
        country_name: requirement.country_name || '',
        requires_visa: requirement.requires_visa || false,
        required_documents: requirement.required_documents || [],
        processing_time: requirement.processing_time || '',
        notes: requirement.notes || '',
      })
    } else if (mode === 'create') {
      setFormData({
        country_code: '',
        country_name: '',
        requires_visa: false,
        required_documents: [],
        processing_time: '',
        notes: '',
      })
    }
  }, [requirement, mode, isOpen])

  const handleAddDocument = () => {
    if (!newDocument.trim()) return

    setFormData({
      ...formData,
      required_documents: [...formData.required_documents, newDocument.trim()],
    })
    setNewDocument('')
  }

  const handleRemoveDocument = (index) => {
    setFormData({
      ...formData,
      required_documents: formData.required_documents.filter(
        (_, i) => i !== index
      ),
    })
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.country_code || !formData.country_code.trim()) {
      alert('Please enter a Country Code')
      return
    }

    if (!formData.country_name || !formData.country_name.trim()) {
      alert('Please enter a Country Name')
      return
    }

    setSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving requirement:', error)
      alert('Failed to save requirement')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className='visa-requirement-modal'
      overlayClassName='visa-requirement-modal-overlay'
    >
      <div className='modal-header'>
        <h2>
          {mode === 'create' ? 'Add Visa Requirement' : 'Edit Visa Requirement'}
        </h2>
        <button
          className='close-button'
          onClick={onClose}
        >
          <FiX size={24} />
        </button>
      </div>

      <div className='modal-content'>
        <div className='form-group'>
          <label>Country Code *</label>
          <input
            type='text'
            maxLength='3'
            value={formData.country_code}
            onChange={(e) =>
              setFormData({
                ...formData,
                country_code: e.target.value.toUpperCase(),
              })
            }
            disabled={mode === 'edit'}
            placeholder='e.g., US, JP, SG'
          />
        </div>

        <div className='form-group'>
          <label>Country Name *</label>
          <input
            type='text'
            value={formData.country_name}
            onChange={(e) =>
              setFormData({ ...formData, country_name: e.target.value })
            }
            placeholder='e.g., United States'
          />
        </div>

        <div className='form-group'>
          <label className='checkbox-label'>
            <input
              type='checkbox'
              checked={formData.requires_visa}
              onChange={(e) =>
                setFormData({ ...formData, requires_visa: e.target.checked })
              }
            />
            <span>Requires Visa</span>
          </label>
        </div>

        <div className='form-group'>
          <label>Required Documents</label>
          <div className='documents-list'>
            {formData.required_documents.map((doc, index) => (
              <div
                key={index}
                className='document-item'
              >
                <span>{doc}</span>
                <button
                  type='button'
                  className='remove-doc-button'
                  onClick={() => handleRemoveDocument(index)}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className='add-document-section'>
            <input
              type='text'
              value={newDocument}
              onChange={(e) => setNewDocument(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDocument()}
              placeholder='Enter document name'
            />
            <button
              type='button'
              className='add-doc-button'
              onClick={handleAddDocument}
            >
              <FiPlus size={16} />
              Add
            </button>
          </div>
        </div>

        <div className='form-group'>
          <label>Processing Time</label>
          <input
            type='text'
            value={formData.processing_time}
            onChange={(e) =>
              setFormData({ ...formData, processing_time: e.target.value })
            }
            placeholder='e.g., 2-3 weeks'
          />
        </div>

        <div className='form-group'>
          <label>Notes</label>
          <textarea
            rows='4'
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder='Additional information...'
          />
        </div>

        {mode === 'edit' && requirement && (
          <div className='last-updated'>
            Last updated: {new Date(requirement.updated_at).toLocaleString()}
            {requirement.updatedByEmail && ` by ${requirement.updatedByEmail}`}
          </div>
        )}
      </div>

      <div className='modal-footer'>
        <button
          className='modal-button modal-button--cancel'
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          className='modal-button modal-button--save'
          onClick={handleSubmit}
          disabled={
            saving ||
            !formData.country_code?.trim() ||
            !formData.country_name?.trim()
          }
        >
          {saving ? (
            <>
              <div className='modal-button-spinner'></div>
              Saving...
            </>
          ) : (
            <>
              <FiCheck size={16} />
              {mode === 'create' ? 'Create' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </Modal>
  )
}

export default VisaRequirementModal
