import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

const SnackbarContext = createContext()

export const useSnackbar = () => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }
  return context
}

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
    isOpen: false,
    duration: 5000
  })
  const [queue, setQueue] = useState([])
  const timeoutRef = useRef(null)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Process queue when current notification closes
  useEffect(() => {
    if (!snackbar.isOpen && queue.length > 0) {
      const nextNotification = queue[0]
      setQueue(prev => prev.slice(1))
      setSnackbar({
        message: nextNotification.message,
        type: nextNotification.type,
        isOpen: true,
        duration: nextNotification.duration
      })
    }
  }, [snackbar.isOpen, queue.length])

  const showSnackbar = useCallback((message, type = 'info', duration = 5000) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Check for duplicates in current notification and queue
    const isDuplicate = (snackbar.isOpen && snackbar.message === message) ||
                       queue.some(item => item.message === message)

    if (isDuplicate) {
      return // Prevent duplicate messages
    }

    if (snackbar.isOpen) {
      // Add to queue if notification is already showing
      setQueue(prev => [...prev, { message, type, duration }])
    } else {
      // Show immediately
      setSnackbar({
        message,
        type,
        isOpen: true,
        duration
      })
    }

    // Auto-dismiss after duration
    timeoutRef.current = setTimeout(() => {
      setSnackbar(prev => ({ ...prev, isOpen: false }))
    }, duration)
  }, [snackbar.isOpen, snackbar.message, queue])

  const hideSnackbar = useCallback(() => {
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setSnackbar(prev => ({ ...prev, isOpen: false }))
  }, [])

  // Convenience methods
  const showSuccess = useCallback((message, duration) => {
    showSnackbar(message, 'success', duration)
  }, [showSnackbar])

  const showError = useCallback((message, duration) => {
    showSnackbar(message, 'error', duration)
  }, [showSnackbar])

  const showWarning = useCallback((message, duration) => {
    showSnackbar(message, 'warning', duration)
  }, [showSnackbar])

  const showInfo = useCallback((message, duration) => {
    showSnackbar(message, 'info', duration)
  }, [showSnackbar])

  const value = {
    snackbar,
    showSnackbar,
    hideSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return (
    <SnackbarContext.Provider value={value}>
      {children}
    </SnackbarContext.Provider>
  )
}
