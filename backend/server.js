import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import flightRoutes from './src/routes/flightRoutes.js'
import bookingRoutes from './src/routes/bookingRoutes.js'
import webhookRoutes from './src/routes/webhookRoutes.js'
import testRoutes from './src/routes/testRoutes.js'
import adminRoutes from './src/routes/adminRoutes.js'
import assignmentRoutes from './src/routes/assignmentRoutes.js'
import tourRoutes from './src/routes/tourRoutes.js'
import chatbotRoutes from './src/routes/chatbotRoutes.js'
import proxyRoutes from './src/routes/proxyRoutes.js'
import visaRoutes from './src/routes/visaRoutes.js'
import visaProcessingRoutes from './src/routes/visaProcessingRoutes.js'
import metadataRoutes from './src/routes/metadataRoutes.js'
import imageUploadRoutes from './src/routes/imageUploadRoutes.js'
import emailVerificationCancellationRoutes from './src/routes/emailVerificationCancellationRoutes.js'
import adminCancellationRoutes from './src/routes/adminCancellationRoutes.js'
import ratingsRoutes from './src/routes/ratingsRoutes.js'
import {
  errorHandler,
  notFoundHandler,
} from './src/middlewares/errorHandler.js'
import { performanceLogger } from './src/services/loggingService.js'

import { viewTourBookingHTML } from './src/controllers/admin/tourController.js'

const app = express()
const port = process.env.PORT || 3001
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Auto-detect environment and URLs
const isProduction = process.env.NODE_ENV === 'production'

// Backend URL - auto-detect from Render or use env variable
const BACKEND_URL =
  process.env.RENDER_EXTERNAL_URL ||
  process.env.BACKEND_URL ||
  `http://localhost:${port}`

// Frontend URL - use env variable or default based on environment
const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  (isProduction ? 'https://trabilis.vercel.app' : 'http://localhost:5173')

console.log(`🌍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`)
console.log(`🔗 Backend URL: ${BACKEND_URL}`)
console.log(`🔗 Frontend URL: ${FRONTEND_URL}`)

// Validate required environment variables on startup
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'AMADEUS_API_KEY',
  'AMADEUS_API_SECRET',
  'STRIPE_SECRET_KEY',
  'BREVO_API_KEY',
  'JWT_SECRET',
]

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:')
  missingEnvVars.forEach((envVar) => console.error(`   - ${envVar}`))
  console.error(
    '\n💡 Please check your .env file or environment configuration.'
  )
  console.error('   See .env.example for reference.\n')
  process.exit(1)
}

app.use('/public', express.static(path.join(__dirname, 'public')))

// Global error handlers to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // Don't exit the process, just log the error
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  // Don't exit the process, just log the error
})

// Configure CORS - auto-detect allowed origins based on environment
const allowedOrigins = isProduction
  ? [
      FRONTEND_URL,
      'https://trabilis.vercel.app', // Production frontend
      'https://trabilis-app.vercel.app', // Vercel preview deployments
    ].filter(Boolean)
  : [
      'http://localhost:5173', // Vite default port
      'http://localhost:3000', // Alternative frontend port
      'http://127.0.0.1:5173',
      FRONTEND_URL,
    ].filter(Boolean)

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true)

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        console.warn(`⚠️  CORS blocked request from origin: ${origin}`)
        console.warn(`   Allowed origins: ${allowedOrigins.join(', ')}`)
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

// Stripe webhook routes - Using refactored createAmadeusOrder flow
app.use('/api/v1/webhooks', webhookRoutes)

// Add logging middleware
app.use(performanceLogger)

app.use(express.json())

// Health check endpoint - enhanced for capstone project
app.get('/health', async (req, res) => {
  try {
    // Import supabase client for database check
    const { supabase } = await import('./src/config/supabaseClient.js')

    // Test database connectivity
    const { data, error } = await supabase
      .from('flight_bookings')
      .select('count')
      .limit(1)

    const dbStatus = error ? 'disconnected' : 'connected'

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total:
          Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      },
      uptime: Math.round(process.uptime()) + ' seconds',
      version: '1.0.0',
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error.message,
    })
  }
})

app.use('/api/v1/flights', flightRoutes)
// Flight booking routes - Using refactored payment-first flow
app.use('/api/v1/bookings', bookingRoutes)
app.use('/api/v1/destinations', tourRoutes)

// Test routes - only enabled in development
if (process.env.NODE_ENV === 'development') {
  app.use('/api/v1/test', testRoutes)
  console.log('🧪 Test routes enabled for development')
} else {
  console.log('🚫 Test routes disabled in production')
}

app.use('/api/v1/chatbot', chatbotRoutes)
app.use('/api/v1/proxy', proxyRoutes)
app.use('/api/v1/visa', visaRoutes)
app.use('/api/v1/visa-processing', visaProcessingRoutes)
app.use('/api/v1/metadata', metadataRoutes)

// Image Upload
app.use('/api/v1/images', imageUploadRoutes)

// Email Verification Cancellation
app.use('/api/v1/cancel-booking', emailVerificationCancellationRoutes)

// Admin Cancellation
app.use('/api/v1/admin/cancellation', adminCancellationRoutes)

// Admin
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/admin/assignments', assignmentRoutes)
app.use('/api/v1/ratings', ratingsRoutes)

app.get('/', async (req, res) => {
  try {
    res.send('Node Server Running!')
  } catch (err) {
    console.error('Database connection failed: ', err)
    res.status(500).send('Database connection failed')
  }
})

app.listen(port, () => {
  console.log(`\n✅ Trabilis Backend is running!`)
  console.log(`   ${BACKEND_URL}`)
  console.log(`\n📊 CORS configured for:`)
  allowedOrigins.forEach((origin) => console.log(`   - ${origin}`))

  console.log(`\n🚀 Ready to accept requests!\n`)
})

// Error handling middleware (must be last)
app.use(notFoundHandler)
app.use(errorHandler)
