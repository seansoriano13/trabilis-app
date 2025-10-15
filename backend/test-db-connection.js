import { supabaseAdmin } from './src/config/supabaseClient.js'

async function testConnection() {
    try {
        console.log('Testing database connection...')
        
        // Simple test query
        const { data, error } = await supabaseAdmin
            .from('visa_processings')
            .select('count')
            .limit(1)
        
        if (error) {
            console.error('Database connection failed:', error)
        } else {
            console.log('✅ Database connection successful!')
        }
        
        // Test actual data fetch
        const { data: processings, error: fetchError } = await supabaseAdmin
            .from('visa_processings')
            .select('id, processing_reference')
            .limit(3)
        
        if (fetchError) {
            console.error('Data fetch failed:', fetchError)
        } else {
            console.log('✅ Data fetch successful!')
            console.log('Sample data:', processings)
        }
        
    } catch (error) {
        console.error('Test failed:', error)
    }
}

testConnection()
