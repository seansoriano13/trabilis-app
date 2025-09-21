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

// Configure CORS - using permissive approach that was working
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: false, // Set to false when using origin: '*'
    optionsSuccessStatus: 200
}))

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
            timestamp: new Date().toISOString()
        })
    } catch (err) {
        console.error('Database connection failed: ', err)
        res.status(500).json({ error: 'Database connection failed' })
    }
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
