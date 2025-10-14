/**
 * Airport Search Service
 * Handles airport and city search with localStorage caching
 */

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

/**
 * Get cache key for a search term
 */
const getCacheKey = (keyword) => `airport_search_${keyword.toLowerCase().trim()}`

/**
 * Check if cached data is still valid
 */
const isCacheValid = (cachedData) => {
    if (!cachedData || !cachedData.timestamp) return false
    return (Date.now() - cachedData.timestamp) < CACHE_TTL
}

/**
 * Store data in localStorage cache
 */
const setCache = (keyword, data) => {
    try {
        const cacheKey = getCacheKey(keyword)
        const cacheData = {
            data,
            timestamp: Date.now()
        }
        localStorage.setItem(cacheKey, JSON.stringify(cacheData))
        console.log('[AIRPORT SERVICE] Cached search result', { keyword, resultCount: data.length })
    } catch (error) {
        console.warn('[AIRPORT SERVICE] Failed to cache data', { keyword, error: error.message })
    }
}

/**
 * Get data from localStorage cache
 */
const getCache = (keyword) => {
    try {
        const cacheKey = getCacheKey(keyword)
        const cached = localStorage.getItem(cacheKey)
        if (!cached) return null
        
        const parsed = JSON.parse(cached)
        if (isCacheValid(parsed)) {
            console.log('[AIRPORT SERVICE] Cache hit', { keyword, resultCount: parsed.data.length })
            return parsed.data
        } else {
            // Remove expired cache
            localStorage.removeItem(cacheKey)
            console.log('[AIRPORT SERVICE] Cache expired, removed', { keyword })
            return null
        }
    } catch (error) {
        console.warn('[AIRPORT SERVICE] Failed to read cache', { keyword, error: error.message })
        return null
    }
}

/**
 * Search airports using Amadeus API via backend
 */
const searchAirportsAPI = async (keyword) => {
    try {
        console.log('[AIRPORT SERVICE] Making API call', { keyword })
        
        const response = await fetch(`${BACKEND_URL}/api/v1/airports/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ keyword }),
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(10000) // 10 second timeout
        })
        
        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a moment.')
            }
            throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }
        
        const result = await response.json()
        
        if (!result.airports) {
            console.warn('[AIRPORT SERVICE] No airports in response', { keyword })
            return []
        }
        
        console.log('[AIRPORT SERVICE] API call successful', { 
            keyword, 
            resultCount: result.airports.length,
            cached: result.cached 
        })
        
        return result.airports
        
    } catch (error) {
        console.error('[AIRPORT SERVICE] API call failed', { keyword, error: error.message })
        throw error
    }
}

/**
 * Main search function with caching
 */
export const searchAirports = async (keyword) => {
    if (!keyword || typeof keyword !== 'string') {
        console.warn('[AIRPORT SERVICE] Invalid keyword', { keyword })
        return []
    }
    
    const trimmedKeyword = keyword.trim()
    if (trimmedKeyword.length < 2) {
        console.warn('[AIRPORT SERVICE] Keyword too short', { keyword: trimmedKeyword })
        return []
    }
    
    // Check cache first
    const cached = getCache(trimmedKeyword)
    if (cached) {
        return cached
    }
    
    // Make API call
    try {
        const results = await searchAirportsAPI(trimmedKeyword)
        
        // Cache the results
        setCache(trimmedKeyword, results)
        
        return results
        
    } catch (error) {
        console.error('[AIRPORT SERVICE] Search failed', { keyword: trimmedKeyword, error: error.message })
        
        // Return empty array on error (graceful degradation)
        return []
    }
}

/**
 * Pre-cache popular searches on app load
 */
export const preCachePopularSearches = async () => {
    const popularSearches = ['LON', 'NYC', 'PAR', 'DXB', 'LAX', 'JFK', 'LHR', 'CDG', 'FRA', 'AMS']
    
    console.log('[AIRPORT SERVICE] Pre-caching popular searches...')
    
    // Cache popular searches in background (don't await)
    Promise.allSettled(
        popularSearches.map(async (search) => {
            try {
                await searchAirports(search)
            } catch (error) {
                console.warn('[AIRPORT SERVICE] Failed to pre-cache', { search, error: error.message })
            }
        })
    ).then((results) => {
        const successful = results.filter(r => r.status === 'fulfilled').length
        console.log('[AIRPORT SERVICE] Pre-caching complete', { 
            successful, 
            total: popularSearches.length 
        })
    })
}

/**
 * Clear all cached airport searches
 */
export const clearAirportCache = () => {
    try {
        const keys = Object.keys(localStorage)
        const airportKeys = keys.filter(key => key.startsWith('airport_search_'))
        
        airportKeys.forEach(key => localStorage.removeItem(key))
        
        console.log('[AIRPORT SERVICE] Cleared cache', { clearedCount: airportKeys.length })
        return airportKeys.length
    } catch (error) {
        console.error('[AIRPORT SERVICE] Failed to clear cache', { error: error.message })
        return 0
    }
}

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
    try {
        const keys = Object.keys(localStorage)
        const airportKeys = keys.filter(key => key.startsWith('airport_search_'))
        
        let validEntries = 0
        let expiredEntries = 0
        
        airportKeys.forEach(key => {
            try {
                const cached = JSON.parse(localStorage.getItem(key))
                if (isCacheValid(cached)) {
                    validEntries++
                } else {
                    expiredEntries++
                }
            } catch {
                expiredEntries++
            }
        })
        
        return {
            totalEntries: airportKeys.length,
            validEntries,
            expiredEntries,
            cacheSize: airportKeys.reduce((size, key) => size + (localStorage.getItem(key)?.length || 0), 0)
        }
    } catch (error) {
        console.error('[AIRPORT SERVICE] Failed to get cache stats', { error: error.message })
        return { totalEntries: 0, validEntries: 0, expiredEntries: 0, cacheSize: 0 }
    }
}
