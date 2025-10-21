import React, { createContext, useContext } from 'react'
import { useSnackbar as useSnackbarHook } from '../hooks/useSnackbar'

const SnackbarContext = createContext(null)

/**
 * Snackbar Provider Component
 * Wrap your app with this to enable global snackbar notifications
 *
 * @example
 * <SnackbarProvider>
 *   <App />
 * </SnackbarProvider>
 */
export const SnackbarProvider = ({ children }) => {
  const snackbarMethods = useSnackbarHook()

  return (
    <SnackbarContext.Provider value={snackbarMethods}>
      {children}
    </SnackbarContext.Provider>
  )
}

/**
 * Hook to use snackbar from any component
 * Can be imported as `useSnackbar` or `useSnackbarContext`
 *
 * @returns {Object} Snackbar methods
 *
 * @example
 * const { showSuccess, showError } = useSnackbar()
 *
 * const handleSave = async () => {
 *   try {
 *     await saveData()
 *     showSuccess('Saved successfully!')
 *   } catch (error) {
 *     showError('Failed to save')
 *   }
 * }
 */
export const useSnackbar = () => {
  const context = useContext(SnackbarContext)

  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }

  return context
}

// Alias for backward compatibility
export const useSnackbarContext = useSnackbar

export default SnackbarContext
