import express from 'express'
import { adminAuthMiddleware } from '../middlewares/adminAuthMiddleware.js'
import {
    createTour,
    deleteTour,
    getAllTours,
    getTour,
    updateTour,
} from '../controllers/admin/tourController.js'
import { adminLogin } from '../controllers/admin/loginController.js'

const router = express.Router()

// Admin Login
router.post('/login', adminLogin)

// Protect all routes
router.use(adminAuthMiddleware)

router.get('/me', (req, res) => {
    res.json({ email: req.user.email })
})

// Tour
router.post('/tours/create', createTour)
router.get('/tours', getAllTours)
router.get('/tours/:id', getTour)
router.put('/tours/:id', updateTour)
router.delete('/tours/:id', deleteTour)

export default router
