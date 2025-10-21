import { useState, useCallback } from 'react'

/**
 * Custom hook for managing snackbar state
 *
 * @returns {Object} Snackbar state and methods
 *
 * @example
 * const { snackbar, showSnackbar, hideSnackbar } = useSnackbar()
 *
 * // Show success message
 * showSnackbar('Changes saved successfully!', 'success')
 *
 * // Show error with action
 * showSnackbar('Failed to save', 'error', {
 *   actionText: 'Retry',
 *   onAction: () => handleSave()
 * })
 *
 * // In JSX:
 * <Snackbar {...snackbar} onClose={hideSnackbar} />
 */
export const useSnackbar = () => {
  const [snackbar, setSnackbar] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    duration: 5000,
    position: 'top-right',
    actionText: undefined,
    onAction: undefined,
  })

  /**
   * Show a snackbar notification
   * @param {string} message - Message to display
   * @param {('success'|'error'|'warning'|'info')} type - Type of notification
   * @param {Object} options - Additional options
   * @param {number} options.duration - Auto-close duration (0 = no auto-close)
   * @param {string} options.position - Position on screen
   * @param {string} options.actionText - Action button text
   * @param {function} options.onAction - Action button callback
   */
  const showSnackbar = useCallback((message, type = 'info', options = {}) => {
    setSnackbar({
      isOpen: true,
      message,
      type,
      duration: options.duration ?? 5000,
      position: options.position ?? 'top-right',
      actionText: options.actionText,
      onAction: options.onAction,
    })
  }, [])

  /**
   * Hide the snackbar
   */
  const hideSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, isOpen: false }))
  }, [])

  /**
   * Shorthand methods for common use cases
   */
  const showSuccess = useCallback(
    (message, options) => {
      showSnackbar(message, 'success', options)
    },
    [showSnackbar]
  )

  const showError = useCallback(
    (message, options) => {
      showSnackbar(message, 'error', options)
    },
    [showSnackbar]
  )

  const showWarning = useCallback(
    (message, options) => {
      showSnackbar(message, 'warning', options)
    },
    [showSnackbar]
  )

  const showInfo = useCallback(
    (message, options) => {
      showSnackbar(message, 'info', options)
    },
    [showSnackbar]
  )

  return {
    snackbar,
    showSnackbar,
    hideSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}

export default useSnackbar
