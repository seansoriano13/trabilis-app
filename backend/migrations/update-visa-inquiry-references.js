import { supabaseAdmin } from '../src/config/supabaseClient.js'
import { v4 as uuidv4 } from 'uuid'

/**
 * Migration script to update existing visa inquiry references
 * from long timestamp format to shorter UUID format
 */
async function updateVisaInquiryReferences() {
    try {
        console.log('Starting visa inquiry reference migration...')
        
        // Get all visa inquiries with old format references
        const { data: inquiries, error: fetchError } = await supabaseAdmin
            .from('visa_inquiries')
            .select('id, inquiry_reference')
            .like('inquiry_reference', 'TRB-VISA-%')
        
        if (fetchError) {
            throw fetchError
        }
        
        console.log(`Found ${inquiries.length} visa inquiries to update`)
        
        // Update each inquiry with new reference format
        for (const inquiry of inquiries) {
            const newReference = `TRB-VISA-${uuidv4().slice(0, 8).toUpperCase()}`
            
            const { error: updateError } = await supabaseAdmin
                .from('visa_inquiries')
                .update({ inquiry_reference: newReference })
                .eq('id', inquiry.id)
            
            if (updateError) {
                console.error(`Error updating inquiry ${inquiry.id}:`, updateError)
            } else {
                console.log(`Updated inquiry ${inquiry.id}: ${inquiry.inquiry_reference} → ${newReference}`)
            }
        }
        
        console.log('Visa inquiry reference migration completed!')
        
    } catch (error) {
        console.error('Migration failed:', error)
        process.exit(1)
    }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    updateVisaInquiryReferences()
}

export default updateVisaInquiryReferences
