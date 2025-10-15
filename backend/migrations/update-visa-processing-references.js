import { supabaseAdmin } from '../src/config/supabaseClient.js'
import { v4 as uuidv4 } from 'uuid'

/**
 * Migration script to add processing_reference field and populate existing records
 */
async function updateVisaProcessingReferences() {
    try {
        console.log('Starting visa processing reference migration...')
        console.log('NOTE: Please run the SQL commands in Supabase first to add the processing_reference column!')
        
        // Get all visa processings
        const { data: processings, error: fetchError } = await supabaseAdmin
            .from('visa_processings')
            .select('id, processing_reference')
            .order('id')
        
        if (fetchError) {
            throw fetchError
        }
        
        console.log(`Found ${processings.length} visa processings`)
        
        // Filter for records that need updating (null or empty processing_reference)
        const processingsToUpdate = processings.filter(p => !p.processing_reference || p.processing_reference.trim() === '')
        
        console.log(`${processingsToUpdate.length} visa processings need updating`)
        
        if (processingsToUpdate.length === 0) {
            console.log('No visa processings need updating. Migration completed!')
            return
        }
        
        // Update each processing with new reference format
        for (const processing of processingsToUpdate) {
            const newReference = `TRB-VISA-${uuidv4().slice(0, 8).toUpperCase()}`
            
            const { error: updateError } = await supabaseAdmin
                .from('visa_processings')
                .update({ processing_reference: newReference })
                .eq('id', processing.id)
            
            if (updateError) {
                console.error(`Error updating processing ${processing.id}:`, updateError)
            } else {
                console.log(`Updated processing ${processing.id}: ${processing.processing_reference || 'NULL'} → ${newReference}`)
            }
        }
        
        console.log('Visa processing reference migration completed!')
        
    } catch (error) {
        console.error('Migration failed:', error)
        console.error('Make sure you have run the SQL commands in Supabase first!')
        process.exit(1)
    }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    updateVisaProcessingReferences()
}

export default updateVisaProcessingReferences
