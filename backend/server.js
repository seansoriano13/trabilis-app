import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import flightRoutes from './src/routes/flightRoutes.js'
import bookingRoutes from './src/routes/bookingRoutes.js'
import webhookRoutes from './src/routes/webhookRoutes.js'

const app = express()
const port = process.env.PORT
app.use('/api/v1/webhooks', webhookRoutes)

app.use(cors())
app.use(express.json())

app.use('/api/v1/flights', flightRoutes)
app.use('/api/v1/bookings', bookingRoutes)

app.get('/', async (req, res) => {
    try {
        res.send('Node Server Running!')
    } catch (err) {
        console.error('Database connection failed: ', err)
        res.status(500).send('Database connection failed')
    }
})

app.listen(port, () => {
    console.log(`Trabilis App running at https://trabilis.onrender.com/`)
})
