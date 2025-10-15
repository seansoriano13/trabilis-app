import { supabaseAdmin } from './src/config/supabaseClient.js'

async function checkProcessingRefs() {
    try {
        console.log('Checking visa processing references...')
        
        // Get all visa processings
        const { data: processings, error } = await supabaseAdmin
            .from('visa_processings')
            .select('id, processing_reference')
            .order('id')
        
        if (error) {
            console.error('Error:', error)
            return
        }
        
        console.log(`Found ${processings.length} visa processings:`)
        processings.forEach(p => {
            console.log(`  ID: ${p.id}, Reference: "${p.processing_reference}"`)
        })
        
        // Check for different patterns
        const idPattern = processings.filter(p => /^TRB-VISA-\d+$/.test(p.processing_reference))
        const uuidPattern = processings.filter(p => /^TRB-VISA-[A-F0-9]{8}$/.test(p.processing_reference))
        const otherPattern = processings.filter(p => !/^TRB-VISA-[A-F0-9]{8}$/.test(p.processing_reference) && !/^TRB-VISA-\d+$/.test(p.processing_reference))
        
        console.log(`\nPattern analysis:`)
        console.log(`  ID format (TRB-VISA-123): ${idPattern.length}`)
        console.log(`  UUID format (TRB-VISA-ABC12345): ${uuidPattern.length}`)
        console.log(`  Other format: ${otherPattern.length}`)
        
        if (idPattern.length > 0) {
            console.log('\nRecords with ID format:')
            idPattern.forEach(p => console.log(`  ${p.id}: ${p.processing_reference}`))
        }
        
    } catch (error) {
        console.error('Error:', error)
    }
}

checkProcessingRefs()
