#!/usr/bin/env node

/**
 * Dry Run Test Script for Rating Email Service
 *
 * This script tests the rating email cron job WITHOUT actually sending emails.
 * Safe to run - it only shows what would happen without using your Brevo quota.
 *
 * Usage: node test-rating-emails-dry-run.js
 */

import 'dotenv/config'
import { sendRatingRequests } from './src/services/ratingEmailService.js'

console.log('🧪 Starting Rating Email Service Dry Run Test...\n')

try {
  // Run with dryRun = true to prevent actual email sending
  await sendRatingRequests(true)

  console.log('✅ Dry run test completed successfully!')
  console.log(
    '\n💡 To run with actual emails, use: node test-rating-emails-live.js'
  )
  process.exit(0)
} catch (error) {
  console.error('❌ Dry run test failed:', error)
  process.exit(1)
}
