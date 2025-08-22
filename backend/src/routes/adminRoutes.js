import express from 'express'
import { adminAuthMiddleware } from '../middlewares/adminAuthMIddleware.js'
import {
    createTour,
    deleteTour,
    getAllTours,
    getTour,
    updateTour,
} from '../controllers/admin/tourController.js'
import { adminLogin } from '../controllers/admin/loginController.js'
import {
    createUser,
    deleteUser,
    getAdminNotifications,
    getFlightBookings,
    getFlightStats,
    getRevenue,
    getTourBookings,
    getTourStats,
    getUsers,
    getUserStats,
    updateUser,
} from '../controllers/admin/dashboardController.js'

const router = express.Router()

// Admin Login
router.post('/login', adminLogin)

// Protect all routes
router.use(adminAuthMiddleware)

router.get('/me', (req, res) => {
    res.json({ email: req.user.email, role: req.user.role })
})

// Tour
router.post('/tours/create', createTour)
router.get('/tours', getAllTours)
router.get('/tours/:id', getTour)
router.put('/tours/:id', updateTour)
router.delete('/tours/:id', deleteTour)

// Dashboard
router.get('/dashboard/flight_bookings', getFlightBookings)
router.get('/dashboard/tour_bookings', getTourBookings)
router.get('/dashboard/admin_notifications', getAdminNotifications)
router.get('/dashboard/revenue', getRevenue)
router.get('/dashboard/flight_stats', getFlightStats)
router.get('/dashboard/tour_stats', getTourStats)

// Users
router.get('/users', getUsers)
router.post('/users/create', createUser)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)
router.get('/users/stats', getUserStats)

export default router
