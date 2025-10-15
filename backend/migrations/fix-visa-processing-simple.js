import { supabaseAdmin } from '../src/config/supabaseClient.js'
import { v4 as uuidv4 } from 'uuid'

/**
 * Migration script to update existing visa processing references
 * from TRB-VISA-{id} format to TRB-VISA-{uuid} format
 */
async function updateVisaProcessingReferences() {
    try {
        console.log('Starting visa processing reference migration...')
        
        // Get all visa processings with old format references
        const { data: processings, error: fetchError } = await supabaseAdmin
            .from('visa_processings')
            .select('id, processing_reference')
            .like('processing_reference', 'TRB-VISA-%')
        
        if (fetchError) {
            throw fetchError
        }
        
        console.log(`Found ${processings.length} visa processings to update`)
        
        // Update each processing with new reference format
        for (const processing of processings) {
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
        
        console.log('Visa processing reference migration completed!')
        
    } catch (error) {
        console.error('Error updating visa processing references:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to update visa processing references'
        })
    }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    updateVisaProcessingReferences()
}

export default updateVisaProcessingReferences
