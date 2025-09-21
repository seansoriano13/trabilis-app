import express from 'express'
import fetch from 'node-fetch'

const router = express.Router()

router.get('/image', async (req, res) => {
    try {
        const imageUrl = req.query.url
        if (!imageUrl) return res.status(400).send('Image URL is required')

        const response = await fetch(imageUrl)
        const contentType = response.headers.get('content-type')
        const buffer = await response.arrayBuffer()

        res.set('Content-Type', contentType)
        res.send(Buffer.from(buffer))
    } catch (err) {
        res.status(500).send('Failed to fetch image')
    }
})

export default router
