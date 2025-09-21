import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import flightRoutes from './src/routes/flightRoutes.js'
import bookingRoutes from './src/routes/bookingRoutes.js'
import webhookRoutes from './src/routes/webhookRoutes.js'
import testRoutes from './src/routes/testRoutes.js'
import adminRoutes from './src/routes/adminRoutes.js'
import tourRoutes from './src/routes/tourRoutes.js'
import chatbotRoutes from './src/routes/chatbotRoutes.js'
import proxyRoutes from './src/routes/proxyRoutes.js'
import { viewTourBookingHTML, viewTourBookingPrint } from './src/controllers/admin/tourController.js'
import { viewFlightBookingHTML, viewFlightBookingPrint } from './src/controllers/admin/flightController.js'

const app = express()
const port = process.env.PORT || 5000

// Configure CORS properly
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3001', 'http://localhost:5173', 'https://trabilis.onrender.com']

console.log('Allowed origins:', allowedOrigins)

// Simplified CORS configuration to avoid server crashes
const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200
}

// Apply CORS before all routes
app.use(cors(corsOptions))

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('CORS Error:', err.message)
    res.status(500).json({ error: 'CORS Error: ' + err.message })
})

app.use(express.json())

app.use('/api/v1/webhooks', webhookRoutes)

app.use('/api/v1/flights', flightRoutes)
app.use('/api/v1/bookings', bookingRoutes)
app.use('/api/v1/destinations', tourRoutes)
app.use('/api/v1/test', testRoutes)
app.use('/api/v1/chatbot', chatbotRoutes)
app.use('/api/v1/proxy', proxyRoutes)

// Admin
app.use('/api/v1/admin', adminRoutes)

// Public routes for testing tour HTML and print (no auth required)
app.get('/api/v1/tours/:id/html', viewTourBookingHTML)
app.get('/api/v1/tours/:id/print', viewTourBookingPrint)

// Public routes for testing flight HTML and print (no auth required)
app.get('/api/v1/flights/:id/html', viewFlightBookingHTML)
app.get('/api/v1/flights/:id/print', viewFlightBookingPrint)

// Health check endpoint
app.get('/', async (req, res) => {
    try {
        res.json({ 
            status: 'Node Server Running!', 
            timestamp: new Date().toISOString(),
            allowedOrigins: allowedOrigins
        })
    } catch (err) {
        console.error('Database connection failed: ', err)
        res.status(500).json({ error: 'Database connection failed' })
    }
})

// CORS test endpoint
app.get('/api/v1/cors-test', (req, res) => {
    res.json({ 
        message: 'CORS is working!', 
        origin: req.headers.origin,
        timestamp: new Date().toISOString()
    })
})

app.listen(port, () => {
    if (process.env.NODE_ENV === 'production') {
        console.log(`Trabilis App running at https://trabilis.onrender.com/`)
    } else {
        console.log(
            `Trabilis App running at http://localhost:${process.env.PORT}`
        )
    }
})
