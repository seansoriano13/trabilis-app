import fetch from 'node-fetch'

export const proxyImage = async (req, res) => {
    const imageUrl = req.query.url
    if (!imageUrl) {
        return res.status(400).send('Missing image URL')
    }

    try {
        const response = await fetch(imageUrl)
        if (!response.ok) {
            return res.status(500).send('Image fetch failed')
        }

        const buffer = await response.arrayBuffer()
        res.set('Access-Control-Allow-Origin', '*')
        res.set('Content-Type', response.headers.get('content-type'))
        res.send(Buffer.from(buffer))
    } catch (err) {
        console.error('Proxy error:', err)
        res.status(500).send('Error fetching image')
    }
}
