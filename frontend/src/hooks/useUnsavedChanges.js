import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for tracking unsaved changes in forms
 * @param {Object} originalData - The original/initial form data
 * @param {Object} currentData - The current form data
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to track changes (default: true)
 * @param {Function} options.comparisonFn - Custom comparison function (default: JSON.stringify)
 * @param {boolean} options.trackBeforeUnload - Whether to add beforeunload listener (default: true)
 * @returns {Object} - { hasUnsavedChanges, resetUnsavedChanges, confirmNavigation }
 */
const useUnsavedChanges = (originalData, currentData, options = {}) => {
    const {
        enabled = true,
        comparisonFn = (a, b) => JSON.stringify(a) === JSON.stringify(b),
        trackBeforeUnload = true
    } = options

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [isNavigating, setIsNavigating] = useState(false)
    const confirmNavigationRef = useRef(null)

    // Track changes by comparing original and current data
    useEffect(() => {
        if (!enabled || !originalData || !currentData) {
            setHasUnsavedChanges(false)
            return
        }

        const hasChanges = !comparisonFn(originalData, currentData)
        setHasUnsavedChanges(hasChanges)
    }, [originalData, currentData, enabled, comparisonFn])

    // Handle beforeunload event (browser close/refresh)
    useEffect(() => {
        if (!enabled || !trackBeforeUnload || !hasUnsavedChanges) return

        const handleBeforeUnload = (event) => {
            event.preventDefault()
            event.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
            return event.returnValue
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [enabled, trackBeforeUnload, hasUnsavedChanges])

    // Reset unsaved changes state
    const resetUnsavedChanges = useCallback(() => {
        setHasUnsavedChanges(false)
        setIsNavigating(false)
    }, [])

    // Confirm navigation with custom modal
    const confirmNavigation = useCallback(() => {
        return new Promise((resolve) => {
            if (!hasUnsavedChanges) {
                resolve(true)
                return
            }

            setIsNavigating(true)
            confirmNavigationRef.current = resolve
        })
    }, [hasUnsavedChanges])

    // Handle navigation confirmation
    const handleNavigationConfirm = useCallback(() => {
        if (confirmNavigationRef.current) {
            confirmNavigationRef.current(true)
            confirmNavigationRef.current = null
        }
        setIsNavigating(false)
    }, [])

    // Handle navigation cancellation
    const handleNavigationCancel = useCallback(() => {
        if (confirmNavigationRef.current) {
            confirmNavigationRef.current(false)
            confirmNavigationRef.current = null
        }
        setIsNavigating(false)
    }, [])

    return {
        hasUnsavedChanges,
        resetUnsavedChanges,
        confirmNavigation,
        isNavigating,
        handleNavigationConfirm,
        handleNavigationCancel
    }
}

export default useUnsavedChanges
