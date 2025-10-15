import express from 'express'
import { adminAuthMiddleware } from '../middlewares/adminAuthMIddleware.js'
import { pdfAuthMiddleware } from '../middlewares/pdfAuthMiddleware.js'
import {
    createTour,
    deleteTour,
    getAllTours,
    getTour,
    updateTour,
    updateTourVisaSettings,
    getCountriesWithVisaRequirements,
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
    backfillNotificationAssignees,
    resolveBookingByReference,
} from '../controllers/admin/dashboardController.js'
import { 
    generateFlightPDF,
    generateFlightPDFAdmin,
    viewFlightBookingHTML,
    editFlightBooking,
    cancelFlightBooking
} from '../controllers/admin/flightController.js'
import { generateTourPDFAdmin, viewTourBookingHTML, editTourBooking, cancelTourBooking } from '../controllers/admin/tourController.js'
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
import { listInclusionGroups, createInclusionGroup, updateInclusionGroup, deleteInclusionGroup, listInclusionGroupItems, createInclusionGroupItem, updateInclusionGroupItem, deleteInclusionGroupItem, updateFeeRules } from '../controllers/admin/inclusionGroupController.js'

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
router.get('/tours/countries-with-visa', getCountriesWithVisaRequirements)
router.get('/tours/:id', getTour)
router.put('/tours/:id', updateTour)
router.delete('/tours/:id', deleteTour)

// Inclusion Groups Management
router.get('/tours/dates/:dateId/inclusion-groups', listInclusionGroups)
router.post('/tours/dates/:dateId/inclusion-groups', createInclusionGroup)
router.put('/tours/inclusion-groups/:groupId', updateInclusionGroup)
router.delete('/tours/inclusion-groups/:groupId', deleteInclusionGroup)

// Inclusion Group Items
router.get('/tours/inclusion-groups/:groupId/items', listInclusionGroupItems)
router.post('/tours/inclusion-groups/:groupId/items', createInclusionGroupItem)
router.put('/tours/items/:itemId', updateInclusionGroupItem)
router.delete('/tours/items/:itemId', deleteInclusionGroupItem)

// Fee Rules
router.put('/tours/dates/:dateId/fee-rules', updateFeeRules)

// Dashboard
router.get('/dashboard/flight_bookings', getFlightBookings)
router.get('/dashboard/tour_bookings', getTourBookings)
router.get('/dashboard/admin_notifications', getAdminNotifications)
router.get('/dashboard/resolve', resolveBookingByReference)
// One-time backfill endpoint
router.post('/dashboard/admin_notifications/backfill', backfillNotificationAssignees)
router.get('/dashboard/revenue', getRevenue)
router.get('/dashboard/flight_stats', getFlightStats)
router.get('/dashboard/tour_stats', getTourStats)

// Flight PDF (using special PDF auth middleware)
router.get('/flights/:id/pdf', pdfAuthMiddleware, generateFlightPDF)
router.get('/flights/:id/pdfadmin', pdfAuthMiddleware, generateFlightPDFAdmin)
router.get('/flights/:id/html', pdfAuthMiddleware, viewFlightBookingHTML)
router.get('/flights/:id/print', pdfAuthMiddleware, (req, res) => {
    // Add mode=print query parameter and delegate to viewFlightBookingHTML
    req.query.mode = 'print'
    viewFlightBookingHTML(req, res)
})

// Flight booking management
router.put('/flights/:id/edit', editFlightBooking)
router.put('/flights/:id/cancel', cancelFlightBooking)

// Tour PDF (using special PDF auth middleware)
router.get('/tours/:id/pdfadmin', pdfAuthMiddleware, generateTourPDFAdmin)
router.get('/tours/:id/html', pdfAuthMiddleware, viewTourBookingHTML)
router.get('/tours/:id/print', pdfAuthMiddleware, (req, res) => {
    // Add mode=print query parameter and delegate to viewTourBookingHTML
    req.query.mode = 'print'
    viewTourBookingHTML(req, res)
})

// Tour booking management
router.put('/tours/:id/edit', editTourBooking)
router.put('/tours/:id/cancel', cancelTourBooking)

// Tour visa settings
router.put('/tours/:id/visa-settings', updateTourVisaSettings)

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
