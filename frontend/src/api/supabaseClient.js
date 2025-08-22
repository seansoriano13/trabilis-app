import { createClient } from '@supabase/supabase-js'

// Debug environment variables
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
console.log('ImgBB API URL:', import.meta.env.VITE_IMG_BB_API_URL)
console.log('ImgBB API Key:', import.meta.env.VITE_IMG_BB_API_KEY)
    
// Fallback values for development (these won't work in production but prevent crashes)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bjktzqaoxnylrnxxnqdi.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3R6cWFveG55bHJueHhucWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTczNjgsImV4cCI6MjA3MDQ3MzM2OH0.LE4IP3aVdiN_8re8JD9VR7zj2cY9g_nojZO1tUlXXLQ'

// Validate environment variables
if (!import.meta.env.VITE_SUPABASE_URL) {
    console.warn('VITE_SUPABASE_URL not found, using fallback URL')
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('VITE_SUPABASE_ANON_KEY not found, using fallback key')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
