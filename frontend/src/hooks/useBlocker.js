import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Custom hook for blocking React Router navigation when there are unsaved changes
 * @param {boolean} shouldBlock - Whether to block navigation
 * @param {Function} onBlock - Callback when navigation is blocked
 * @returns {Object} - { isBlocked, proceed, reset }
 */
const useBlocker = (shouldBlock, onBlock) => {
    const navigate = useNavigate()
    const isBlockedRef = useRef(false)
    const pendingNavigationRef = useRef(null)

    useEffect(() => {
        if (!shouldBlock) {
            // If we were blocked and now shouldn't be, proceed with pending navigation
            if (isBlockedRef.current && pendingNavigationRef.current) {
                const { to, options } = pendingNavigationRef.current
                pendingNavigationRef.current = null
                isBlockedRef.current = false
                navigate(to, options)
            }
            return
        }

        // Note: This is a simplified approach. In a real implementation,
        // you might need to use a different strategy depending on React Router version
        return () => {
            isBlockedRef.current = false
            pendingNavigationRef.current = null
        }
    }, [shouldBlock, onBlock, navigate])

    const proceed = () => {
        if (pendingNavigationRef.current) {
            const { to, options } = pendingNavigationRef.current
            pendingNavigationRef.current = null
            isBlockedRef.current = false
            navigate(to, options)
        }
    }

    const reset = () => {
        isBlockedRef.current = false
        pendingNavigationRef.current = null
    }

    return {
        isBlocked: isBlockedRef.current,
        proceed,
        reset
    }
}

export default useBlocker
