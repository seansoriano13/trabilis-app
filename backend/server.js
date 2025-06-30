import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import flightRoutes from './src/routes/flightRoutes.js'

const app = express()
const port = process.env.PORT

app.use(cors())
app.use(express.json())

app.use('/api/v1/flights', flightRoutes)

app.get('/', async (req, res) => {
    try {
        res.send('Node Server Running!')
    } catch (err) {
        console.error('Database connection failed: ', err)
        res.status(500).send('Database connection failed')
    }
})

app.listen(port, () => {
    console.log(`Trabilis App running at http://localhost:${port}`)
})