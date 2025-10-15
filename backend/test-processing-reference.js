import { supabaseAdmin } from './src/config/supabaseClient.js'

async function testProcessingReference() {
    try {
        console.log('Testing visa_processings table structure...')
        
        // Try to select processing_reference column
        const { data, error } = await supabaseAdmin
            .from('visa_processings')
            .select('id, processing_reference')
            .limit(1)
        
        if (error) {
            console.error('Error accessing processing_reference column:', error)
            console.log('The column might not exist yet. Please run the SQL commands in Supabase first!')
        } else {
            console.log('✅ processing_reference column exists!')
            console.log('Sample data:', data)
        }
        
    } catch (error) {
        console.error('Test failed:', error)
    }
}

testProcessingReference()
