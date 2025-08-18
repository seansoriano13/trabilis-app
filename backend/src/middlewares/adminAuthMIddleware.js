import 'dotenv/config'
import jwt from 'jsonwebtoken'

export const adminAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied: Admins only' })
        }
        req.user = decoded
        next()
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' })
    }
}
