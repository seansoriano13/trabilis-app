/**
 * Frontend Configuration
 * Auto-detects environment and provides correct URLs
 */

// Check if we're in production build
const isProduction = import.meta.env.PROD

// Backend URL - auto-detect based on environment
export const BACKEND_URL = isProduction
    ? import.meta.env.VITE_BACKEND_URL || 'https://trabilis.onrender.com'
    : 'http://localhost:3001'

// Supabase configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// OpenWeather API
export const OPEN_WEATHER_API_KEY = import.meta.env.VITE_OPEN_WEATHER_API_KEY

// Environment info
export const ENV = {
    isProduction,
    isDevelopment: !isProduction,
    backendUrl: BACKEND_URL,
}

// Log configuration on app start (development only)
if (!isProduction) {
    console.log('🔧 Frontend Configuration:')
    console.log(`   Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`)
    console.log(`   Backend URL: ${BACKEND_URL}`)
    console.log(`   Supabase: ${SUPABASE_URL}`)
}

