import express from 'express'
import { adminAuthMiddleware } from '../middlewares/adminAuthMIddleware.js'
import {
    createVisaProcessing,
    getVisaProcessings,
    getVisaProcessingById,
    updateVisaStatus,
    updateVisaProcessingDetails,
    updateRequirementsStatus,
    assignVisaProcessing,
    updateVisaAssignmentStatus,
    getAssignedVisaProcessings,
    getVisaRequirements,
    getVisaRequirementsByCountry,
    createVisaProcessingsForBooking,
    getVisaProcessingsByBooking
} from '../controllers/visaProcessingController.js'

const router = express.Router()

// Admin routes - require authentication
router.use(adminAuthMiddleware)

// Visa requirements management
router.get('/requirements', getVisaRequirements)
router.get('/requirements/:country', getVisaRequirementsByCountry)

// Visa processing CRUD operations
router.get('/processings', getVisaProcessings)
router.get('/processings/:id', getVisaProcessingById)
router.post('/processings', createVisaProcessing)
router.put('/processings/:id/status', updateVisaStatus)
router.put('/processings/:id/details', updateVisaProcessingDetails)
router.put('/processings/:id/requirements', updateRequirementsStatus)

// Assignment operations
router.post('/processings/:id/assign', assignVisaProcessing)
router.put('/processings/:id/assignment-status', updateVisaAssignmentStatus)
router.get('/processings/assigned', getAssignedVisaProcessings)

// Integration with tour bookings
router.post('/bookings/:bookingId/visa-processings', createVisaProcessingsForBooking)
router.get('/bookings/:bookingId/visa-processings', getVisaProcessingsByBooking)

export default router
