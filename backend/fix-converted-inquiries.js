/**
 * Fix Converted Visa Inquiries Without Processing Records
 *
 * This script finds all visa inquiries that have been converted (payment completed)
 * but don't have a corresponding visa_processing record.
 * It creates the missing processing records and links them properly.
 */

import { supabase } from './src/config/supabaseClient.js'
import { autoAssignBooking } from './src/services/assignmentService.js'

async function fixConvertedInquiries() {
  console.log(
    '🔍 Starting fix for converted inquiries without processing records...\n'
  )

  try {
    // Find all converted inquiries without a processing link
    const { data: inquiries, error } = await supabase
      .from('visa_inquiries')
      .select('*')
      .eq('conversion_status', 'CONVERTED')
      .is('converted_to_processing_id', null)

    if (error) {
      console.error('❌ Error fetching inquiries:', error)
      return
    }

    if (!inquiries || inquiries.length === 0) {
      console.log('✅ All converted inquiries already have processing records!')
      return
    }

    console.log(
      `📋 Found ${inquiries.length} converted inquiries without processing records\n`
    )

    let successCount = 0
    let failureCount = 0

    for (const inquiry of inquiries) {
      console.log(`\n📝 Processing inquiry: ${inquiry.inquiry_reference}`)
      console.log(`   Name: ${inquiry.full_name}`)
      console.log(`   Destination: ${inquiry.destination}`)
      console.log(`   Visa Type: ${inquiry.visa_type}`)

      try {
        // Generate processing reference
        const processingReference = `TRB-VISA-PROC-${
          inquiry.inquiry_reference.split('TRB-VISA-')[1]
        }`

        // Create visa processing record
        const { data: processingData, error: processingError } = await supabase
          .from('visa_processings')
          .insert({
            source_type: 'VISA_INQUIRY',
            passenger_name: inquiry.full_name,
            passenger_email: inquiry.email_address,
            country: inquiry.destination,
            visa_type: inquiry.visa_type,
            status: 'PENDING',
            requirements_status: {},
            notes: inquiry.message || '',
            processing_reference: processingReference,
            passenger_index: 0, // Required field, set to 0 for visa inquiry processings
            created_at: inquiry.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single()

        if (processingError) {
          console.error(
            `   ❌ Failed to create processing: ${processingError.message}`
          )
          failureCount++
          continue
        }

        console.log(
          `   ✅ Created processing ${processingReference} (ID: ${processingData.id})`
        )

        // Update inquiry with processing link
        const { error: updateError } = await supabase
          .from('visa_inquiries')
          .update({
            converted_to_processing_id: processingData.id,
          })
          .eq('id', inquiry.id)

        if (updateError) {
          console.error(
            `   ❌ Failed to link processing: ${updateError.message}`
          )
          failureCount++
          continue
        }

        console.log(`   ✅ Linked processing to inquiry`)

        // Auto-assign processing to visa staff
        try {
          const assignmentResult = await autoAssignBooking(
            'visa',
            processingData.id
          )
          if (assignmentResult.success) {
            console.log(
              `   ✅ Auto-assigned to ${assignmentResult.assignedStaff.name}`
            )
          } else {
            console.log(
              `   ⚠️  Could not auto-assign: ${assignmentResult.message}`
            )
          }
        } catch (assignError) {
          console.log(
            `   ⚠️  Auto-assignment failed (non-critical):`,
            assignError.message
          )
        }

        successCount++
      } catch (err) {
        console.error(`   ❌ Unexpected error:`, err)
        failureCount++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Successfully fixed: ${successCount}`)
    console.log(`❌ Failed: ${failureCount}`)
    console.log(`📝 Total processed: ${inquiries.length}`)
    console.log('='.repeat(60) + '\n')
  } catch (err) {
    console.error('❌ Fatal error:', err)
  }
}

// Run the fix
fixConvertedInquiries()
  .then(() => {
    console.log('✅ Script completed')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Script failed:', err)
    process.exit(1)
  })
