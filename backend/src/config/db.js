import { supabase } from './supabaseClient.js'

console.log('Using Supabase for all database operations.')

/**
 * Legacy query function for backward compatibility
 * Converts SQL queries to Supabase operations
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Object} Result object with rows property
 */
export async function query(sql, params = []) {
    const startTime = process.hrtime.bigint()
    let success = true

    try {
        // Convert SQL to lowercase for easier parsing
        const sqlLower = sql.toLowerCase().trim()

        let result

        // Handle SELECT queries
        if (sqlLower.startsWith('select')) {
            result = await handleSelectQuery(sql, params)
        }
        // Handle INSERT queries
        else if (sqlLower.startsWith('insert')) {
            result = await handleInsertQuery(sql, params)
        }
        // Handle UPDATE queries
        else if (sqlLower.startsWith('update')) {
            result = await handleUpdateQuery(sql, params)
        }
        // Handle DELETE queries
        else if (sqlLower.startsWith('delete')) {
            result = await handleDeleteQuery(sql, params)
        } else {
            throw new Error(`Unsupported SQL operation: ${sql}`)
        }

        return result
    } catch (error) {
        success = false
        console.error('Database query error:', error)
        throw error
    } finally {
        // Record query performance
        const duration = Number(process.hrtime.bigint() - startTime) / 1000000 // Convert to milliseconds

        try {
            const { logDatabaseQuery } = await import(
                '../services/loggingService.js'
            )
            await logDatabaseQuery(sql, params, duration, !success)
        } catch (logError) {
            console.error('[DB] Failed to log query performance:', logError)
        }
    }
}

/**
 * Handle SELECT queries by converting to Supabase select
 */
async function handleSelectQuery(sql, params) {
    // Extract table name and conditions from SQL
    const tableMatch = sql.match(/from\s+(\w+)/i)
    if (!tableMatch) {
        throw new Error('Could not extract table name from SELECT query')
    }

    const tableName = tableMatch[1]

    // Extract WHERE conditions
    const whereMatch = sql.match(/where\s+(.+?)(?:\s+order\s+by|\s+limit|$)/i)
    let whereClause = whereMatch ? whereMatch[1] : null

    // Extract ORDER BY
    const orderMatch = sql.match(/order\s+by\s+(.+?)(?:\s+limit|$)/i)
    let orderBy = orderMatch ? orderMatch[1] : null

    // Extract LIMIT
    const limitMatch = sql.match(/limit\s+(\d+)/i)
    let limit = limitMatch ? parseInt(limitMatch[1]) : null

    // Extract columns (SELECT part)
    const selectMatch = sql.match(/select\s+(.+?)\s+from/i)
    let columns = selectMatch ? selectMatch[1] : '*'

    // Convert columns to array if needed
    if (columns === '*') {
        columns = '*'
    } else {
        // Handle specific columns - for now, just use all
        columns = '*'
    }

    // Build Supabase query
    let query = supabase.from(tableName).select(columns)

    // Apply WHERE conditions
    if (whereClause && params.length > 0) {
        // Simple parameter replacement for common patterns
        whereClause = whereClause.replace(/\?/g, () => {
            const param = params.shift()
            return typeof param === 'string' ? `'${param}'` : param
        })

        // Parse simple WHERE conditions
        const conditions = parseWhereClause(whereClause)
        conditions.forEach((condition) => {
            if (condition.operator === '=') {
                query = query.eq(condition.column, condition.value)
            } else if (condition.operator === 'IN') {
                query = query.in(condition.column, condition.value)
            } else if (condition.operator === 'LIKE') {
                query = query.like(condition.column, condition.value)
            }
        })
    }

    // Apply ORDER BY
    if (orderBy) {
        const orderParts = orderBy.split(' ')
        const column = orderParts[0]
        const direction =
            orderParts[1]?.toLowerCase() === 'desc'
                ? { ascending: false }
                : { ascending: true }
        query = query.order(column, direction)
    }

    // Apply LIMIT
    if (limit) {
        query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
        throw new Error(`Supabase query error: ${error.message}`)
    }

    return {
        rows: data || [],
        rowCount: data ? data.length : 0,
    }
}

/**
 * Handle INSERT queries by converting to Supabase insert
 */
async function handleInsertQuery(sql, params) {
    const tableMatch = sql.match(/insert\s+into\s+(\w+)/i)
    if (!tableMatch) {
        throw new Error('Could not extract table name from INSERT query')
    }

    const tableName = tableMatch[1]

    // Extract column names and values from INSERT statement
    const valuesMatch = sql.match(/values\s*\((.+)\)/i)
    if (!valuesMatch) {
        throw new Error('Could not extract values from INSERT query')
    }

    // For now, we'll need to manually map the columns to values
    // This is a simplified approach - in production, you might want more sophisticated parsing
    const { data, error } = await supabase
        .from(tableName)
        .insert(params[0] || {})

    if (error) {
        throw new Error(`Supabase insert error: ${error.message}`)
    }

    return {
        rows: data || [],
        rowCount: data ? data.length : 0,
    }
}

/**
 * Handle UPDATE queries by converting to Supabase update
 */
async function handleUpdateQuery(sql, params) {
    const tableMatch = sql.match(/update\s+(\w+)/i)
    if (!tableMatch) {
        throw new Error('Could not extract table name from UPDATE query')
    }

    const tableName = tableMatch[1]

    // Extract SET clause
    const setMatch = sql.match(/set\s+(.+?)(?:\s+where|$)/i)
    if (!setMatch) {
        throw new Error('Could not extract SET clause from UPDATE query')
    }

    // Extract WHERE clause
    const whereMatch = sql.match(/where\s+(.+)/i)
    let whereClause = whereMatch ? whereMatch[1] : null

    // Parse SET clause to get update data
    const updateData = parseSetClause(setMatch[1], params)

    // Parse WHERE clause for conditions
    let whereConditions = {}
    if (whereClause && params.length > 0) {
        whereClause = whereClause.replace(/\?/g, () => {
            const param = params.shift()
            return typeof param === 'string' ? `'${param}'` : param
        })
        whereConditions = parseWhereClause(whereClause)
    }

    // Build Supabase query
    let query = supabase.from(tableName).update(updateData)

    // Apply WHERE conditions
    whereConditions.forEach((condition) => {
        if (condition.operator === '=') {
            query = query.eq(condition.column, condition.value)
        }
    })

    const { data, error } = await query

    if (error) {
        throw new Error(`Supabase update error: ${error.message}`)
    }

    return {
        rows: data || [],
        rowCount: data ? data.length : 0,
    }
}

/**
 * Handle DELETE queries by converting to Supabase delete
 */
async function handleDeleteQuery(sql, params) {
    const tableMatch = sql.match(/delete\s+from\s+(\w+)/i)
    if (!tableMatch) {
        throw new Error('Could not extract table name from DELETE query')
    }

    const tableName = tableMatch[1]

    // Extract WHERE clause
    const whereMatch = sql.match(/where\s+(.+)/i)
    if (!whereMatch) {
        throw new Error('DELETE queries must have WHERE clause')
    }

    let whereClause = whereMatch[1]

    // Apply parameters
    if (params.length > 0) {
        whereClause = whereClause.replace(/\?/g, () => {
            const param = params.shift()
            return typeof param === 'string' ? `'${param}'` : param
        })
    }

    // Parse WHERE conditions
    const whereConditions = parseWhereClause(whereClause)

    // Build Supabase query
    let query = supabase.from(tableName).delete()

    // Apply WHERE conditions
    whereConditions.forEach((condition) => {
        if (condition.operator === '=') {
            query = query.eq(condition.column, condition.value)
        } else if (condition.operator === 'AND') {
            // Handle AND conditions
            if (condition.left && condition.right) {
                query = query.eq(condition.left.column, condition.left.value)
                query = query.eq(condition.right.column, condition.right.value)
            }
        }
    })

    const { data, error } = await query

    if (error) {
        throw new Error(`Supabase delete error: ${error.message}`)
    }

    return {
        rows: data || [],
        rowCount: data ? data.length : 0,
    }
}

/**
 * Parse WHERE clause into conditions
 */
function parseWhereClause(whereClause) {
    const conditions = []

    // Handle simple equality conditions
    const eqMatch = whereClause.match(/(\w+)\s*=\s*([^'\s]+|'[^']*')/)
    if (eqMatch) {
        conditions.push({
            column: eqMatch[1],
            operator: '=',
            value: eqMatch[2].replace(/'/g, ''),
        })
    }

    // Handle AND conditions
    if (whereClause.includes(' AND ')) {
        const parts = whereClause.split(' AND ')
        if (parts.length === 2) {
            const left = parseWhereClause(parts[0])[0]
            const right = parseWhereClause(parts[1])[0]
            conditions.push({
                operator: 'AND',
                left,
                right,
            })
        }
    }

    return conditions
}

/**
 * Parse SET clause into update data object
 */
function parseSetClause(setClause, params) {
    const updateData = {}

    // Simple parsing for common patterns like "column = ?"
    const setMatches = setClause.match(/(\w+)\s*=\s*\?/g)
    if (setMatches) {
        setMatches.forEach((match, index) => {
            const column = match.split('=')[0].trim()
            updateData[column] = params[index]
        })
    }

    return updateData
}
