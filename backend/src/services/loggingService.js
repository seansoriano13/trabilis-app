import { supabase } from '../config/supabaseClient.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Log levels
 */
export const LOG_LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG',
    TRACE: 'TRACE',
}

/**
 * Log categories
 */
export const LOG_CATEGORIES = {
    AUTH: 'AUTH',
    BOOKING: 'BOOKING',
    PAYMENT: 'PAYMENT',
    AMADEUS: 'AMADEUS',
    STRIPE: 'STRIPE',
    EMAIL: 'EMAIL',
    CAPACITY: 'CAPACITY',
    TICKETING: 'TICKETING',
    CANCELLATION: 'CANCELLATION',
    API: 'API',
    DATABASE: 'DATABASE',
    SYSTEM: 'SYSTEM',
}

/**
 * Logger class for structured logging
 */
class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../../logs')
        this.ensureLogDirectory()
    }

    async ensureLogDirectory() {
        try {
            await fs.mkdir(this.logDir, { recursive: true })
        } catch (error) {
            console.error('Failed to create logs directory:', error)
        }
    }

    /**
     * Format log entry
     */
    formatLogEntry(level, category, message, context = {}) {
        const timestamp = new Date().toISOString()
        const logEntry = {
            timestamp,
            level,
            category,
            message,
            context: {
                ...context,
                pid: process.pid,
                memory: process.memoryUsage(),
                uptime: process.uptime(),
            },
        }
        return logEntry
    }

    /**
     * Write to console
     */
    writeToConsole(level, category, message, context) {
        const timestamp = new Date().toISOString()
        const contextStr =
            Object.keys(context).length > 0
                ? ` | ${JSON.stringify(context)}`
                : ''

        switch (level) {
            case LOG_LEVELS.ERROR:
                console.error(
                    `[${timestamp}] [${level}] [${category}] ${message}${contextStr}`
                )
                break
            case LOG_LEVELS.WARN:
                console.warn(
                    `[${timestamp}] [${level}] [${category}] ${message}${contextStr}`
                )
                break
            case LOG_LEVELS.INFO:
                console.info(
                    `[${timestamp}] [${level}] [${category}] ${message}${contextStr}`
                )
                break
            case LOG_LEVELS.DEBUG:
                console.debug(
                    `[${timestamp}] [${level}] [${category}] ${message}${contextStr}`
                )
                break
            default:
                console.log(
                    `[${timestamp}] [${level}] [${category}] ${message}${contextStr}`
                )
        }
    }

    /**
     * Write to file
     */
    async writeToFile(level, category, message, context) {
        try {
            const logEntry = this.formatLogEntry(
                level,
                category,
                message,
                context
            )
            const logFile = path.join(
                this.logDir,
                `${new Date().toISOString().split('T')[0]}.log`
            )
            const logLine = JSON.stringify(logEntry) + '\n'

            await fs.appendFile(logFile, logLine)
        } catch (error) {
            console.error('Failed to write to log file:', error)
        }
    }

    /**
     * Write to database
     */
    async writeToDatabase(level, category, message, context) {
        try {
            const logEntry = this.formatLogEntry(
                level,
                category,
                message,
                context
            )

            await supabase.from('application_logs').insert([
                {
                    level,
                    category,
                    message,
                    context: JSON.stringify(context),
                    created_at: logEntry.timestamp,
                },
            ])
        } catch (error) {
            console.error('Failed to write to database:', error)
        }
    }

    /**
     * Main log method
     */
    async log(level, category, message, context = {}) {
        // Always write to console
        this.writeToConsole(level, category, message, context)

        // Write to file for all levels
        await this.writeToFile(level, category, message, context)

        // Write to database for ERROR and WARN levels
        if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.WARN) {
            await this.writeToDatabase(level, category, message, context)
        }
    }

    /**
     * Convenience methods
     */
    async error(category, message, context = {}) {
        await this.log(LOG_LEVELS.ERROR, category, message, context)
    }

    async warn(category, message, context = {}) {
        await this.log(LOG_LEVELS.WARN, category, message, context)
    }

    async info(category, message, context = {}) {
        await this.log(LOG_LEVELS.INFO, category, message, context)
    }

    async debug(category, message, context = {}) {
        await this.log(LOG_LEVELS.DEBUG, category, message, context)
    }

    async trace(category, message, context = {}) {
        await this.log(LOG_LEVELS.TRACE, category, message, context)
    }
}

// Create singleton instance
export const logger = new Logger()

/**
 * Request logging middleware
 */
export const requestLogger = (req, res, next) => {
    const startTime = Date.now()

    // Log request
    logger.info(LOG_CATEGORIES.API, 'Request received', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        userId: req.user?.id,
        body: req.method !== 'GET' ? req.body : undefined,
    })

    // Override res.end to log response
    const originalEnd = res.end
    res.end = function (chunk, encoding) {
        const duration = Date.now() - startTime

        logger.info(LOG_CATEGORIES.API, 'Response sent', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user?.id,
        })

        originalEnd.call(this, chunk, encoding)
    }

    next()
}

/**
 * Performance logging middleware
 */
export const performanceLogger = (req, res, next) => {
    const startTime = process.hrtime.bigint()

    res.on('finish', async () => {
        const duration = Number(process.hrtime.bigint() - startTime) / 1000000 // Convert to milliseconds

        // Basic performance logging (simplified)

        // Log slow requests (> 1 second)
        if (duration > 1000) {
            logger.warn(LOG_CATEGORIES.API, 'Slow request detected', {
                method: req.method,
                url: req.originalUrl,
                duration: `${duration.toFixed(2)}ms`,
                statusCode: res.statusCode,
                userId: req.user?.id,
            })
        }
    })

    next()
}

/**
 * Database query logger
 */
export const logDatabaseQuery = async (
    query,
    params,
    duration,
    error = null
) => {
    // Basic database query logging (simplified)
    const context = {
        query: query.substring(0, 200), // Truncate long queries
        params: params ? JSON.stringify(params).substring(0, 200) : null,
        duration: `${duration}ms`,
    }

    if (error) {
        logger.error(LOG_CATEGORIES.DATABASE, 'Database query failed', {
            ...context,
            error: error.message,
        })
    } else {
        logger.debug(
            LOG_CATEGORIES.DATABASE,
            'Database query executed',
            context
        )
    }
}

/**
 * External API logger
 */
export const logExternalApi = (
    service,
    endpoint,
    method,
    statusCode,
    duration,
    error = null
) => {
    const context = {
        service,
        endpoint,
        method,
        statusCode,
        duration: `${duration}ms`,
    }

    if (error) {
        logger.error(LOG_CATEGORIES.API, 'External API call failed', {
            ...context,
            error: error.message,
        })
    } else {
        logger.info(LOG_CATEGORIES.API, 'External API call completed', context)
    }
}

/**
 * Business logic logger
 */
export const logBusinessEvent = (event, category, data = {}) => {
    logger.info(category, event, data)
}

/**
 * Security logger
 */
export const logSecurityEvent = (event, severity, data = {}) => {
    const level = severity === 'HIGH' ? LOG_LEVELS.ERROR : LOG_LEVELS.WARN
    logger.log(level, LOG_CATEGORIES.AUTH, `Security: ${event}`, data)
}

/**
 * Get log statistics
 */
export async function getLogStats(timeframe = '24h') {
    try {
        let timeFilter
        const now = new Date()

        switch (timeframe) {
            case '1h':
                timeFilter = new Date(
                    now.getTime() - 60 * 60 * 1000
                ).toISOString()
                break
            case '24h':
                timeFilter = new Date(
                    now.getTime() - 24 * 60 * 60 * 1000
                ).toISOString()
                break
            case '7d':
                timeFilter = new Date(
                    now.getTime() - 7 * 24 * 60 * 60 * 1000
                ).toISOString()
                break
            case '30d':
                timeFilter = new Date(
                    now.getTime() - 30 * 24 * 60 * 60 * 1000
                ).toISOString()
                break
            default:
                timeFilter = new Date(
                    now.getTime() - 24 * 60 * 60 * 1000
                ).toISOString()
        }

        const { data: logs, error } = await supabase
            .from('application_logs')
            .select('level, category, created_at')
            .gte('created_at', timeFilter)

        if (error) {
            throw new Error(`Database query failed: ${error.message}`)
        }

        // Group by level and category
        const stats = {
            total: logs.length,
            byLevel: {},
            byCategory: {},
            recent: logs.slice(-20), // Last 20 logs
        }

        logs.forEach((log) => {
            // Count by level
            stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1

            // Count by category
            stats.byCategory[log.category] =
                (stats.byCategory[log.category] || 0) + 1
        })

        return stats
    } catch (error) {
        console.error('[LOG STATS] Failed to get log statistics:', error)
        throw error
    }
}
