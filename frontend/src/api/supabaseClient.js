import { createClient } from '@supabase/supabase-js'

// Debug environment variables
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)

// Validate environment variables
if (!import.meta.env.VITE_SUPABASE_URL) {
    throw new Error('VITE_SUPABASE_URL is required but not set')
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('VITE_SUPABASE_ANON_KEY is required but not set')
}

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
)
