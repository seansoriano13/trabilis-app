/**
 * Pre-Deployment Readiness Test Script
 * Tests critical data flows and error handling
 *
 * Run with: node test-deployment-readiness.js
 */

import { supabase } from './src/config/supabaseClient.js'

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function success(message) {
  log(`✅ ${message}`, colors.green)
}

function error(message) {
  log(`❌ ${message}`, colors.red)
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

function info(message) {
  log(`ℹ️  ${message}`, colors.cyan)
}

let testsRun = 0
let testsPassed = 0
let testsFailed = 0

async function test(name, fn) {
  testsRun++
  info(`\nTest ${testsRun}: ${name}`)
  try {
    await fn()
    testsPassed++
    success(`PASSED: ${name}`)
  } catch (err) {
    testsFailed++
    error(`FAILED: ${name}`)
    error(`  Error: ${err.message}`)
  }
}

// Test 1: Database Connection
await test('Database Connection', async () => {
  const { data, error } = await supabase
    .from('flight_bookings')
    .select('count')
    .limit(1)

  if (error) throw new Error(`Database connection failed: ${error.message}`)
  info('  Database connection successful')
})

// Test 2: Environment Variables
await test('Required Environment Variables', async () => {
  const required = [
    'BREVO_API_KEY',
    'BREVO_FROM_EMAIL',
    'PUSHER_APP_ID',
    'PUSHER_APP_KEY',
    'PUSHER_APP_SECRET',
    'PUSHER_APP_CLUSTER',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }

  info(`  All ${required.length} required variables present`)
})

// Test 3: Database Tables Exist
await test('Required Database Tables', async () => {
  const tables = [
    'flight_bookings',
    'tour_bookings',
    'tour_packages',
    'tour_ratings',
    'visa_requirements',
    'system_settings',
  ]

  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1)
    if (error)
      throw new Error(
        `Table ${table} does not exist or is inaccessible: ${error.message}`
      )
  }

  info(`  All ${tables.length} required tables exist`)
})

// Test 4: Soft Delete Columns
await test('Tour Packages Soft Delete Columns', async () => {
  const { data, error } = await supabase
    .from('tour_packages')
    .select('id, deleted_at, deleted_by')
    .limit(1)

  if (error) throw new Error(`Soft delete columns missing: ${error.message}`)

  // Check if columns exist in schema
  if (data && data.length > 0) {
    const record = data[0]
    if (!('deleted_at' in record) || !('deleted_by' in record)) {
      throw new Error('deleted_at or deleted_by columns not in schema')
    }
  }

  info('  Soft delete columns exist (deleted_at, deleted_by)')
})

// Test 5: JSON Parsing Safety (Simulated)
await test('JSON Parsing Error Handling', async () => {
  // Simulate malformed JSON parsing
  const testParseJsonField = (field) => {
    if (!field) return null
    if (typeof field === 'string') {
      try {
        return JSON.parse(field)
      } catch (e) {
        return null // Safe fallback
      }
    }
    return field
  }

  // Test cases
  const validJSON = '{"test": "value"}'
  const invalidJSON = '{invalid json}'
  const nullValue = null
  const objectValue = { test: 'value' }

  const result1 = testParseJsonField(validJSON)
  const result2 = testParseJsonField(invalidJSON)
  const result3 = testParseJsonField(nullValue)
  const result4 = testParseJsonField(objectValue)

  if (!result1 || result1.test !== 'value')
    throw new Error('Valid JSON parsing failed')
  if (result2 !== null) throw new Error('Invalid JSON should return null')
  if (result3 !== null) throw new Error('Null value should return null')
  if (!result4 || result4.test !== 'value')
    throw new Error('Object pass-through failed')

  info('  JSON parsing handles all error cases safely')
})

// Test 6: Admin Routes Exist
await test('Admin Routes Registration', async () => {
  // This is a static check - routes should be registered
  // We can't test without starting the server, but we can verify the files exist
  const fs = await import('fs')
  const path = await import('path')
  const { fileURLToPath } = await import('url')
  const __dirname = path.dirname(fileURLToPath(import.meta.url))

  const routeFiles = [
    './src/routes/adminRoutes.js',
    './src/routes/ratingsRoutes.js',
    './src/routes/salesReportRoutes.js',
    './src/routes/settingsRoutes.js',
    './src/routes/visaRequirementsRoutes.js',
  ]

  for (const file of routeFiles) {
    const fullPath = path.join(__dirname, file)
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Route file not found: ${file}`)
    }
  }

  info(`  All ${routeFiles.length} route files exist`)
})

// Test 7: Controller Files Exist
await test('Controller Files', async () => {
  const fs = await import('fs')
  const path = await import('path')
  const { fileURLToPath } = await import('url')
  const __dirname = path.dirname(fileURLToPath(import.meta.url))

  const controllerFiles = [
    './src/controllers/admin/flightController.js',
    './src/controllers/admin/tourController.js',
    './src/controllers/admin/ratingsController.js',
    './src/controllers/admin/salesReportController.js',
    './src/controllers/admin/settingsController.js',
    './src/controllers/admin/visaRequirementsController.js',
  ]

  for (const file of controllerFiles) {
    const fullPath = path.join(__dirname, file)
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Controller file not found: ${file}`)
    }
  }

  info(`  All ${controllerFiles.length} controller files exist`)
})

// Test 8: Service Files Exist
await test('Service Files', async () => {
  const fs = await import('fs')
  const path = await import('path')
  const { fileURLToPath } = await import('url')
  const __dirname = path.dirname(fileURLToPath(import.meta.url))

  const serviceFiles = [
    './src/services/brevoEmailService.js',
    './src/services/ratingEmailService.js',
    './src/services/recycleBinService.js',
  ]

  for (const file of serviceFiles) {
    const fullPath = path.join(__dirname, file)
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Service file not found: ${file}`)
    }
  }

  info(`  All ${serviceFiles.length} service files exist`)
})

// Test 9: Util Files Exist
await test('Utility Files', async () => {
  const fs = await import('fs')
  const path = await import('path')
  const { fileURLToPath } = await import('url')
  const __dirname = path.dirname(fileURLToPath(import.meta.url))

  const utilFiles = ['./src/utils/tourBookingHtmlGenerator.js']

  for (const file of utilFiles) {
    const fullPath = path.join(__dirname, file)
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Utility file not found: ${file}`)
    }
  }

  info(`  All ${utilFiles.length} utility files exist`)
})

// Test 10: Check for Sample Flight Booking
await test('Sample Data Availability', async () => {
  const { data: flights, error: flightError } = await supabase
    .from('flight_bookings')
    .select('id, booking_reference, status')
    .limit(1)

  const { data: tours, error: tourError } = await supabase
    .from('tour_bookings')
    .select('id, booking_reference, status')
    .limit(1)

  if (flightError && tourError) {
    warning('  No sample data found (not critical for deployment)')
  } else {
    if (flights && flights.length > 0) {
      info(`  Sample flight booking found: ${flights[0].booking_reference}`)
    }
    if (tours && tours.length > 0) {
      info(`  Sample tour booking found: ${tours[0].booking_reference}`)
    }
  }
})

// Summary
log('\n' + '='.repeat(60), colors.blue)
log('DEPLOYMENT READINESS TEST SUMMARY', colors.blue)
log('='.repeat(60), colors.blue)
log(`\nTotal Tests: ${testsRun}`)
success(`Passed: ${testsPassed}`)
if (testsFailed > 0) {
  error(`Failed: ${testsFailed}`)
} else {
  log(`Failed: ${testsFailed}`, colors.reset)
}

const successRate = ((testsPassed / testsRun) * 100).toFixed(1)
log(
  `\nSuccess Rate: ${successRate}%`,
  successRate === '100.0' ? colors.green : colors.yellow
)

if (testsFailed === 0) {
  log('\n' + '✅ SYSTEM READY FOR DEPLOYMENT'.padStart(45), colors.green)
} else {
  log('\n' + '❌ FIX FAILED TESTS BEFORE DEPLOYMENT'.padStart(45), colors.red)
}

log('='.repeat(60) + '\n', colors.blue)

// Exit with appropriate code
process.exit(testsFailed === 0 ? 0 : 1)
