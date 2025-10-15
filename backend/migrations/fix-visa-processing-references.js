import { supabaseAdmin } from '../src/config/supabaseClient.js'
import { v4 as uuidv4 } from 'uuid'

/**
 * Migration script to fix visa processing references to use UUID format like visa inquiries
 */
async function fixVisaProcessingReferences() {
    try {
        console.log('Starting visa processing reference fix...')
        console.log('Converting TRB-VISA-{id} format to TRB-VISA-{uuid} format...')
        
        // Get all visa processings with old format (TRB-VISA-{id})
        console.log('Fetching visa processings with old format from database...')
        const { data: processings, error: fetchError } = await supabaseAdmin
            .from('visa_processings')
            .select('id, processing_reference')
            .like('processing_reference', 'TRB-VISA-%')
            .order('id')
        
        if (fetchError) {
            console.error('Error fetching visa processings:', fetchError)
            throw fetchError
        }
        
        console.log('Successfully fetched visa processings from database')
        console.log(`Found ${processings.length} visa processings with TRB-VISA- format`)
        
        // Show all processing references for debugging
        console.log('Processing references found:')
        processings.forEach((p, index) => {
            console.log(`  ${index + 1}. ID: ${p.id}, Reference: "${p.processing_reference}"`)
        })
        
        // Filter for records that need updating (those with TRB-VISA-{id} format)
        const processingsToUpdate = processings.filter(p => {
            const hasOldFormat = p.processing_reference && /^TRB-VISA-\d+$/.test(p.processing_reference)
            if (hasOldFormat) {
                console.log(`  -> Processing ${p.id} needs updating: "${p.processing_reference}"`)
            }
            return hasOldFormat
        })
        
        console.log(`${processingsToUpdate.length} visa processings need updating`)
        
        if (processingsToUpdate.length === 0) {
            console.log('No visa processings need updating. All references are already in correct format!')
            return
        }
        
        // Update each processing with new UUID reference format
        for (const processing of processingsToUpdate) {
            const newReference = `TRB-VISA-${uuidv4().slice(0, 8).toUpperCase()}`
            
            const { error: updateError } = await supabaseAdmin
                .from('visa_processings')
                .update({ processing_reference: newReference })
                .eq('id', processing.id)
            
            if (updateError) {
                console.error(`Error updating processing ${processing.id}:`, updateError)
            } else {
                console.log(`Updated processing ${processing.id}: ${processing.processing_reference} → ${newReference}`)
            }
        }
        
        console.log('Visa processing reference fix completed!')
        
    } catch (error) {
        console.error('Migration failed:', error)
        console.error('Error details:', error.message)
        console.error('Stack trace:', error.stack)
        process.exit(1)
    }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    fixVisaProcessingReferences()
}

export default fixVisaProcessingReferences
