import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import pool from './src/config/db.js'

const app = express()
const port = process.env.PORT

app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
    try {
        res.send('haha')
    } catch (err) {
        console.error('Database connection failed: ', err)
        res.status(500).send('Database connection failed')
    }
})



app.listen(port, () => {
    console.log(`Trabilis App Listening on port ${port}`)
})