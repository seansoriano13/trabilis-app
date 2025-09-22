import 'dotenv/config'
import jwt from 'jsonwebtoken'

export const pdfAuthMiddleware = (req, res, next) => {
    let token = null

    // Try to get token from Authorization header first
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
    }
    
    // If no token in header, try to get from query parameter
    if (!token && req.query.token) {
        token = req.query.token
    }

    if (!token) {
        return res.status(401).json({ error: 'Authentication token required' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (decoded.role !== 'admin' && decoded.role !== 'accounting' && decoded.role !== 'travel_consultant') {
            return res.status(403).json({ error: 'Access denied: Admin, Accounting, or Travel Consultant access required' })
        }
        
        req.user = decoded
        next()
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' })
    }
}

