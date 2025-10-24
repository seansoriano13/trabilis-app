#!/usr/bin/env node

/**
 * Live Test Script for Rating Email Service
 *
 * ⚠️  WARNING: This script WILL send actual emails and use Brevo quota!
 *
 * Make sure to run the dry-run first: node test-rating-emails-dry-run.js
 *
 * Usage: node test-rating-emails-live.js
 */

import 'dotenv/config'
import { sendRatingRequests } from './src/services/ratingEmailService.js'

console.log('⚠️  WARNING: This will send ACTUAL emails!')
console.log('🧪 Starting Rating Email Service (LIVE MODE)...\n')

try {
  // Run with dryRun = false (default) to send actual emails
  await sendRatingRequests(false)

  console.log('✅ Live email sending completed!')
  process.exit(0)
} catch (error) {
  console.error('❌ Live email sending failed:', error)
  process.exit(1)
}
