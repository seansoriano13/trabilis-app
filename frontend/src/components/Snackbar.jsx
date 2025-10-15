import React, { useEffect } from 'react'
import { useSnackbar } from '../context/SnackbarContext'

const Snackbar = () => {
  const { snackbar, hideSnackbar } = useSnackbar()

  // Add keyboard listener for ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && snackbar.isOpen) {
        hideSnackbar()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [hideSnackbar, snackbar.isOpen])

  if (!snackbar.isOpen) return null

  const getIcon = () => {
    switch (snackbar.type) {
      case 'success':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <i className="bi bi-check-circle-fill text-green-600 text-xl"></i>
          </div>
        )
      case 'error':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <i className="bi bi-exclamation-triangle-fill text-red-600 text-xl"></i>
          </div>
        )
      case 'warning':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <i className="bi bi-exclamation-circle-fill text-yellow-600 text-xl"></i>
          </div>
        )
      case 'info':
      default:
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <i className="bi bi-info-circle-fill text-blue-600 text-xl"></i>
          </div>
        )
    }
  }

  const getStyles = () => {
    const baseStyles = "fixed top-20 right-4 z-40 max-w-sm w-full mx-4 bg-white rounded-xl shadow-2xl border border-gray-200 transform transition-all duration-500 ease-out animate-slideInRight"
    
    return baseStyles
  }

  const getBorderColor = () => {
    switch (snackbar.type) {
      case 'success':
        return 'border-l-4 border-l-green-500'
      case 'error':
        return 'border-l-4 border-l-red-500'
      case 'warning':
        return 'border-l-4 border-l-yellow-500'
      case 'info':
      default:
        return 'border-l-4 border-l-blue-500'
    }
  }

  return (
    <div 
      className={`${getStyles()} ${getBorderColor()}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-relaxed break-words">
              {snackbar.message}
            </p>
          </div>
          <button
            onClick={hideSnackbar}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close notification"
          >
            <i className="bi bi-x-lg text-lg"></i>
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-gray-200 rounded-b-xl overflow-hidden">
        <div 
          className={`h-full transition-all ease-linear ${
            snackbar.type === 'success' ? 'bg-green-500' :
            snackbar.type === 'error' ? 'bg-red-500' :
            snackbar.type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`}
          style={{
            animation: `shrink ${snackbar.duration || 5000}ms linear forwards`
          }}
        ></div>
      </div>
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Snackbar
