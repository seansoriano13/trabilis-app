import { supabase } from '../config/supabaseClient.js'
import Pusher from 'pusher'

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
    useTLS: true,
})

/**
 * Error types for categorization
 */
export const ERROR_TYPES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    CONFLICT_ERROR: 'CONFLICT_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
    EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    PAYMENT_ERROR: 'PAYMENT_ERROR',
    EMAIL_ERROR: 'EMAIL_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    CAPACITY_ERROR: 'CAPACITY_ERROR'
}

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
}

/**
 * Custom error class with additional context
 */
export class AppError extends Error {
    constructor(message, statusCode, errorType, severity = ERROR_SEVERITY.MEDIUM, context = {}) {
        super(message)
        this.name = 'AppError'
        this.statusCode = statusCode
        this.errorType = errorType
        this.severity = severity
        this.context = context
        this.timestamp = new Date().toISOString()
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
    }
}

/**
 * Log error to database
 */
async function logErrorToDatabase(error, req, additionalContext = {}) {
    try {
        const errorLog = {
            message: error.message,
            stack: error.stack,
            error_type: error.errorType || ERROR_TYPES.INTERNAL_ERROR,
            severity: error.severity || ERROR_SEVERITY.MEDIUM,
            status_code: error.statusCode || 500,
            user_agent: req?.headers?.['user-agent'] || null,
            ip_address: req?.ip || req?.connection?.remoteAddress || null,
            url: req?.originalUrl || null,
            method: req?.method || null,
            user_id: req?.user?.id || null,
            booking_reference: additionalContext.bookingReference || null,
            amadeus_order_id: additionalContext.amadeusOrderId || null,
            stripe_session_id: additionalContext.stripeSessionId || null,
            context: JSON.stringify({
                ...error.context,
                ...additionalContext,
                headers: req?.headers || {},
                body: req?.body ? JSON.stringify(req.body).substring(0, 1000) : null
            }),
            created_at: new Date().toISOString()
        }

        await supabase
            .from('error_logs')
            .insert([errorLog])

        console.log(`[ERROR LOG] Error logged to database: ${error.errorType}`)
    } catch (logError) {
        console.error('[ERROR LOG] Failed to log error to database:', logError)
    }
}

/**
 * Send error alert to admin team
 */
async function sendErrorAlert(error, req, additionalContext = {}) {
    try {
        // Only send alerts for high/critical severity errors
        if (error.severity !== ERROR_SEVERITY.HIGH && error.severity !== ERROR_SEVERITY.CRITICAL) {
            return
        }

        const alertMessage = `🚨 ${error.severity} ERROR: ${error.errorType}\n\n` +
            `Message: ${error.message}\n` +
            `Status: ${error.statusCode}\n` +
            `URL: ${req?.method} ${req?.originalUrl}\n` +
            `Time: ${new Date().toLocaleString()}\n` +
            `User: ${req?.user?.id || 'Anonymous'}`

        // Send Pusher notification
        await pusher.trigger('admin-notifications', 'error-alert', {
            type: 'error_alert',
            severity: error.severity,
            errorType: error.errorType,
            message: alertMessage,
            timestamp: new Date().toISOString(),
            context: additionalContext
        })

        // Log admin notification
        await supabase
            .from('admin_notifications')
            .insert([
                {
                    type: 'error_alert',
                    message: alertMessage,
                    created_at: new Date().toISOString(),
                    priority: error.severity === ERROR_SEVERITY.CRITICAL ? 'high' : 'medium',
                    metadata: {
                        errorType: error.errorType,
                        severity: error.severity,
                        statusCode: error.statusCode
                    }
                }
            ])

        console.log(`[ERROR ALERT] Alert sent for ${error.severity} error: ${error.errorType}`)
    } catch (alertError) {
        console.error('[ERROR ALERT] Failed to send error alert:', alertError)
    }
}

/**
 * Format error response for client
 */
function formatErrorResponse(error, isDevelopment = false) {
    const baseResponse = {
        success: false,
        error: error.message,
        errorType: error.errorType || ERROR_TYPES.INTERNAL_ERROR,
        timestamp: new Date().toISOString()
    }

    // Add additional context in development
    if (isDevelopment) {
        baseResponse.stack = error.stack
        baseResponse.context = error.context
    }

    // Add specific error details based on type
    switch (error.errorType) {
        case ERROR_TYPES.VALIDATION_ERROR:
            baseResponse.details = error.context?.validationErrors || null
            break
        case ERROR_TYPES.RATE_LIMIT_ERROR:
            baseResponse.retryAfter = error.context?.retryAfter || null
            break
        case ERROR_TYPES.CAPACITY_ERROR:
            baseResponse.capacityDetails = error.context?.capacityDetails || null
            break
        case ERROR_TYPES.EXTERNAL_API_ERROR:
            baseResponse.externalService = error.context?.service || null
            break
    }

    return baseResponse
}

/**
 * Main error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
    let error = err

    // Convert non-AppError to AppError
    if (!(error instanceof AppError)) {
        error = new AppError(
            error.message || 'Internal Server Error',
            error.statusCode || 500,
            ERROR_TYPES.INTERNAL_ERROR,
            ERROR_SEVERITY.MEDIUM,
            { originalError: error.name }
        )
    }

    // Log error
    console.error(`[ERROR] ${error.errorType}: ${error.message}`, {
        stack: error.stack,
        context: error.context,
        url: req.originalUrl,
        method: req.method,
        user: req.user?.id
    })

    // Log to database (async, don't wait)
    logErrorToDatabase(error, req).catch(console.error)

    // Send alert for high/critical errors (async, don't wait)
    sendErrorAlert(error, req).catch(console.error)

    // Send response
    const isDevelopment = process.env.NODE_ENV === 'development'
    const response = formatErrorResponse(error, isDevelopment)
    
    res.status(error.statusCode || 500).json(response)
}

/**
 * 404 handler for unmatched routes
 */
export const notFoundHandler = (req, res, next) => {
    const error = new AppError(
        `Route ${req.originalUrl} not found`,
        404,
        ERROR_TYPES.NOT_FOUND_ERROR,
        ERROR_SEVERITY.LOW,
        { method: req.method, url: req.originalUrl }
    )
    next(error)
}

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}

/**
 * Create specific error types
 */
export const createValidationError = (message, validationErrors = {}) => {
    return new AppError(
        message,
        400,
        ERROR_TYPES.VALIDATION_ERROR,
        ERROR_SEVERITY.LOW,
        { validationErrors }
    )
}

export const createAuthenticationError = (message = 'Authentication required') => {
    return new AppError(
        message,
        401,
        ERROR_TYPES.AUTHENTICATION_ERROR,
        ERROR_SEVERITY.MEDIUM
    )
}

export const createAuthorizationError = (message = 'Insufficient permissions') => {
    return new AppError(
        message,
        403,
        ERROR_TYPES.AUTHORIZATION_ERROR,
        ERROR_SEVERITY.MEDIUM
    )
}

export const createNotFoundError = (resource = 'Resource') => {
    return new AppError(
        `${resource} not found`,
        404,
        ERROR_TYPES.NOT_FOUND_ERROR,
        ERROR_SEVERITY.LOW
    )
}

export const createConflictError = (message) => {
    return new AppError(
        message,
        409,
        ERROR_TYPES.CONFLICT_ERROR,
        ERROR_SEVERITY.MEDIUM
    )
}

export const createRateLimitError = (message, retryAfter = null) => {
    return new AppError(
        message,
        429,
        ERROR_TYPES.RATE_LIMIT_ERROR,
        ERROR_SEVERITY.MEDIUM,
        { retryAfter }
    )
}

export const createExternalApiError = (service, message, originalError = null) => {
    return new AppError(
        message,
        502,
        ERROR_TYPES.EXTERNAL_API_ERROR,
        ERROR_SEVERITY.HIGH,
        { service, originalError: originalError?.message }
    )
}

export const createDatabaseError = (message, originalError = null) => {
    return new AppError(
        message,
        500,
        ERROR_TYPES.DATABASE_ERROR,
        ERROR_SEVERITY.HIGH,
        { originalError: originalError?.message }
    )
}

export const createPaymentError = (message, stripeError = null) => {
    return new AppError(
        message,
        402,
        ERROR_TYPES.PAYMENT_ERROR,
        ERROR_SEVERITY.HIGH,
        { stripeError: stripeError?.message }
    )
}

export const createCapacityError = (message, capacityDetails = {}) => {
    return new AppError(
        message,
        429,
        ERROR_TYPES.CAPACITY_ERROR,
        ERROR_SEVERITY.MEDIUM,
        { capacityDetails }
    )
}

/**
 * Get error statistics for monitoring
 */
export async function getErrorStats(timeframe = '24h') {
    try {
        let timeFilter
        const now = new Date()
        
        switch (timeframe) {
            case '1h':
                timeFilter = new Date(now.getTime() - 60 * 60 * 1000).toISOString()
                break
            case '24h':
                timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
                break
            case '7d':
                timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
                break
            case '30d':
                timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
                break
            default:
                timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
        }

        const { data: errors, error } = await supabase
            .from('error_logs')
            .select('error_type, severity, status_code, created_at')
            .gte('created_at', timeFilter)

        if (error) {
            throw new Error(`Database query failed: ${error.message}`)
        }

        // Group by error type and severity
        const stats = {
            total: errors.length,
            byType: {},
            bySeverity: {},
            byStatusCode: {},
            recent: errors.slice(-10) // Last 10 errors
        }

        errors.forEach(error => {
            // Count by type
            stats.byType[error.error_type] = (stats.byType[error.error_type] || 0) + 1
            
            // Count by severity
            stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1
            
            // Count by status code
            stats.byStatusCode[error.status_code] = (stats.byStatusCode[error.status_code] || 0) + 1
        })

        return stats
    } catch (error) {
        console.error('[ERROR STATS] Failed to get error statistics:', error)
        throw error
    }
}
