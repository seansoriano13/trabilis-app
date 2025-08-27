import fetch from 'node-fetch'

export const proxyImage = async (req, res) => {
    const imageUrl = req.query.url
    if (!imageUrl) {
        return res.status(400).send('Missing image URL')
    }

    try {
        const response = await fetch(imageUrl)
        if (!response.ok) {
            return res
                .status(response.status)
                .send(`Image fetch failed: ${response.statusText}`)
        }

        // Set CORS for browser use
        res.set('Access-Control-Allow-Origin', '*')

        // Set the exact same content type as original
        const contentType = response.headers.get('content-type')
        if (contentType) res.type(contentType)

        // Stream to avoid memory issues
        response.body.pipe(res)
    } catch (err) {
        console.error('Proxy error:', err)
        res.status(500).send('Error fetching image')
    }
}
