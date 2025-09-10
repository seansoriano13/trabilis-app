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

const app = express()
const port = process.env.PORT || 5000

const allowedOrigins = process.env.ALLOWED_ORIGINS || ''

app.use(cors({ origin: '*' }))

app.use('/api/v1/webhooks', webhookRoutes)

app.use(express.json())

app.use('/api/v1/flights', flightRoutes)
app.use('/api/v1/bookings', bookingRoutes)
app.use('/api/v1/destinations', tourRoutes)
app.use('/api/v1/test', testRoutes)
app.use('/api/v1/chatbot', chatbotRoutes)
app.use('/api/v1/proxy', proxyRoutes)

// Admin
app.use('/api/v1/admin', adminRoutes)

app.get('/', async (req, res) => {
    try {
        res.send('Node Server Running!')
    } catch (err) {
        console.error('Database connection failed: ', err)
        res.status(500).send('Database connection failed')
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
