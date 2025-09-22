import express from 'express'
import { adminAuthMiddleware } from '../middlewares/adminAuthMIddleware.js'
import { pdfAuthMiddleware } from '../middlewares/pdfAuthMiddleware.js'
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
import { 
    generateFlightPDF,
    generateFlightPDFAdmin,
    viewFlightBookingHTML,
    viewFlightBookingPrint
} from '../controllers/admin/flightController.js'
import { generateTourPDF, generateTourPDFAdmin, viewTourBookingHTML, viewTourBookingPrint } from '../controllers/admin/tourController.js'
import {
    getAccountingStaff,
    getAllStaff,
    assignTourBooking,
    assignFlightBooking,
    updateAssignmentStatus,
    getAssignedBookings,
    reassignBooking
} from '../controllers/admin/appointmentController.js'
import { getVisaInquiries, updateVisaInquiryStatus, assignVisaInquiry, updateVisaAssignmentStatus, getAssignedVisaInquiries } from '../controllers/visaInquiryController.js'

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

// Flight PDF (using special PDF auth middleware)
router.get('/flights/:id/pdf', pdfAuthMiddleware, generateFlightPDF)
router.get('/flights/:id/pdfadmin', pdfAuthMiddleware, generateFlightPDFAdmin)
router.get('/flights/:id/html', pdfAuthMiddleware, viewFlightBookingHTML)
router.get('/flights/:id/print', pdfAuthMiddleware, viewFlightBookingPrint)

// Tour PDF (using special PDF auth middleware)
router.get('/tours/:id/pdf', pdfAuthMiddleware, generateTourPDF)
router.get('/tours/:id/pdfadmin', pdfAuthMiddleware, generateTourPDFAdmin)
router.get('/tours/:id/html', pdfAuthMiddleware, viewTourBookingHTML)
router.get('/tours/:id/print', pdfAuthMiddleware, viewTourBookingPrint)

// Users
router.get('/users', getUsers)
router.post('/users/create', createUser)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)
router.get('/users/stats', getUserStats)

// Appointment System
router.get('/appointments/staff', getAccountingStaff)
router.get('/appointments/all-staff', getAllStaff)
router.post('/appointments/assign-tour', assignTourBooking)
router.post('/appointments/assign-flight', assignFlightBooking)
router.put('/appointments/status', updateAssignmentStatus)
router.get('/appointments/assigned', getAssignedBookings)
router.post('/appointments/reassign', reassignBooking)

// Visa Inquiries
router.get('/visa/inquiries', getVisaInquiries)
router.put('/visa/inquiries/:id/status', updateVisaInquiryStatus)
router.post('/visa/inquiries/assign', assignVisaInquiry)
router.put('/visa/inquiries/assignment-status', updateVisaAssignmentStatus)
router.get('/visa/inquiries/assigned', getAssignedVisaInquiries)

export default router
