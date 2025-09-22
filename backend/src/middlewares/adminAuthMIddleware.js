import 'dotenv/config'
import jwt from 'jsonwebtoken'

export const adminAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header missing or invalid' })
    }

    const token = authHeader.split(' ')[1]

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
