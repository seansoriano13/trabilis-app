// assignmentRoutes.js
import express from 'express'
import { adminAuthMiddleware } from '../middlewares/adminAuthMiddleware.js'
import {
    assignBooking,
    updateAssignmentStatus,
    getStaffAssignments,
    getAssignmentStatistics,
    reassignBooking,
} from '../controllers/admin/assignmentController.js'

const router = express.Router()

// All assignment routes require admin authentication
router.use(adminAuthMiddleware)

// Unified assignment endpoints
router.post('/assign', assignBooking)
router.put('/status', updateAssignmentStatus)
router.get('/staff/:staffId/:bookingType', getStaffAssignments)
router.get('/staff/:staffId', getStaffAssignments)
router.get('/stats', getAssignmentStatistics)
router.post('/reassign', reassignBooking)

export default router
