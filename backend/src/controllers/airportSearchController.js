import { amadeus, logAmadeusError, logAmadeusSuccess } from '../config/amadeus.js'

// In-memory cache for duplicate requests (5 min TTL)
const searchCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Rate limiting tracking
let requestCount = 0
let windowStart = Date.now()
const RATE_LIMIT = 10 // requests per second
const WINDOW_SIZE = 1000 // 1 second

/**
 * Check if request is within rate limit
 */
const checkRateLimit = () => {
    const now = Date.now()
    
    // Reset window if more than 1 second has passed
    if (now - windowStart >= WINDOW_SIZE) {
        requestCount = 0
        windowStart = now
    }
    
    // Check if we're within rate limit
    if (requestCount >= RATE_LIMIT) {
        return false
    }
    
    requestCount++
    return true
}

/**
 * Transform Amadeus location data to match frontend format
 */
const transformLocationData = (location) => {
    return {
        value: location.iataCode,
        city: location.address?.cityName || location.name,
        name: location.name,
        label: `${location.name} (${location.iataCode}) - ${location.address?.cityName || 'Unknown'}, ${location.address?.countryCode || 'Unknown'}`,
        country: location.address?.countryCode,
        type: location.subType
    }
}

/**
 * Search airports and cities using Amadeus API
 */
export const searchAirports = async (req, res) => {
    const { keyword } = req.body
    
    // Validate input
    if (!keyword || typeof keyword !== 'string') {
        console.error('[AIRPORT SEARCH] Validation failed: Missing or invalid keyword', { keyword })
        return res.status(400).json({ 
            error: 'Keyword is required and must be a string' 
        })
    }
    
    const trimmedKeyword = keyword.trim()
    if (trimmedKeyword.length < 2) {
        console.error('[AIRPORT SEARCH] Validation failed: Keyword too short', { keyword: trimmedKeyword })
        return res.status(400).json({ 
            error: 'Keyword must be at least 2 characters long' 
        })
    }
    
    // Check rate limit
    if (!checkRateLimit()) {
        console.warn('[AIRPORT SEARCH] Rate limit exceeded', { keyword: trimmedKeyword })
        return res.status(429).json({ 
            error: 'Rate limit exceeded. Please try again in a moment.',
            retryAfter: 1
        })
    }
    
    // Check cache first
    const cacheKey = trimmedKeyword.toLowerCase()
    const cached = searchCache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        console.log('[AIRPORT SEARCH] Cache hit', { keyword: trimmedKeyword, resultCount: cached.data.length })
        return res.json({ 
            airports: cached.data,
            cached: true,
            timestamp: cached.timestamp
        })
    }
    
    try {
        console.log('[AIRPORT SEARCH] Making API call', { keyword: trimmedKeyword })
        
        // Call Amadeus API
        const response = await amadeus.referenceData.locations.get({
            keyword: trimmedKeyword,
            subType: 'AIRPORT,CITY' // Search both airports and cities
        })
        
        if (!response.data) {
            console.warn('[AIRPORT SEARCH] No data returned from Amadeus', { keyword: trimmedKeyword })
            return res.json({ 
                airports: [],
                cached: false,
                timestamp: Date.now()
            })
        }
        
        // Transform and filter results
        const transformedData = response.data
            .filter(location => location.iataCode) // Only include locations with IATA codes
            .map(transformLocationData)
            .sort((a, b) => {
                // Sort by relevance: exact matches first, then alphabetical
                const aExact = a.value.toLowerCase() === trimmedKeyword.toLowerCase()
                const bExact = b.value.toLowerCase() === trimmedKeyword.toLowerCase()
                if (aExact && !bExact) return -1
                if (!aExact && bExact) return 1
                return a.label.localeCompare(b.label)
            })
        
        // Cache the results
        searchCache.set(cacheKey, {
            data: transformedData,
            timestamp: Date.now()
        })
        
        // Log success
        logAmadeusSuccess('airport_search', response, { 
            keyword: trimmedKeyword, 
            resultCount: transformedData.length 
        })
        
        console.log('[AIRPORT SEARCH] Success', { 
            keyword: trimmedKeyword, 
            resultCount: transformedData.length 
        })
        
        res.json({ 
            airports: transformedData,
            cached: false,
            timestamp: Date.now()
        })
        
    } catch (error) {
        console.error('[AIRPORT SEARCH] API call failed', { 
            keyword: trimmedKeyword, 
            error: error.message 
        })
        
        logAmadeusError('airport_search', error, { keyword: trimmedKeyword })
        
        // Return empty results on error (graceful degradation)
        res.json({ 
            airports: [],
            cached: false,
            timestamp: Date.now(),
            error: 'Search temporarily unavailable'
        })
    }
}

/**
 * Get cache statistics for monitoring
 */
export const getCacheStats = (req, res) => {
    const now = Date.now()
    const cacheEntries = Array.from(searchCache.entries())
    
    const stats = {
        totalEntries: cacheEntries.length,
        expiredEntries: cacheEntries.filter(([, data]) => (now - data.timestamp) >= CACHE_TTL).length,
        activeEntries: cacheEntries.filter(([, data]) => (now - data.timestamp) < CACHE_TTL).length,
        rateLimitStatus: {
            requestsInWindow: requestCount,
            windowStart: windowStart,
            limit: RATE_LIMIT,
            windowSize: WINDOW_SIZE
        }
    }
    
    res.json(stats)
}

/**
 * Clear cache (for testing/admin purposes)
 */
export const clearCache = (req, res) => {
    searchCache.clear()
    requestCount = 0
    windowStart = Date.now()
    
    console.log('[AIRPORT SEARCH] Cache cleared')
    res.json({ message: 'Cache cleared successfully' })
}
