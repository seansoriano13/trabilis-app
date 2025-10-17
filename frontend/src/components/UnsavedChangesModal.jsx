import React from 'react'
import { FiAlertTriangle, FiX } from 'react-icons/fi'
import './UnsavedChangesModal.css'

const UnsavedChangesModal = ({ 
    isOpen, 
    onConfirm, 
    onCancel, 
    title = "Unsaved Changes",
    message = "You have unsaved changes. Are you sure you want to leave without saving?",
    confirmText = "Leave Without Saving",
    cancelText = "Stay on Page"
}) => {
    if (!isOpen) return null

    return (
        <div className="unsaved-changes-modal-overlay" onClick={onCancel}>
            <div className="unsaved-changes-modal" onClick={(e) => e.stopPropagation()}>
                <div className="unsaved-changes-modal__header">
                    <div className="unsaved-changes-modal__title">
                        <FiAlertTriangle className="unsaved-changes-modal__icon" />
                        <h3>{title}</h3>
                    </div>
                    <button 
                        className="unsaved-changes-modal__close" 
                        onClick={onCancel}
                        aria-label="Close modal"
                    >
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="unsaved-changes-modal__content">
                    <p className="unsaved-changes-modal__message">{message}</p>
                </div>
                
                <div className="unsaved-changes-modal__actions">
                    <button 
                        className="unsaved-changes-modal__button unsaved-changes-modal__button--cancel"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className="unsaved-changes-modal__button unsaved-changes-modal__button--confirm"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UnsavedChangesModal
