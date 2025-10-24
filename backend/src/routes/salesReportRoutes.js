import express from 'express'
import {
  getSalesReport,
  getTopTravelers,
  exportSalesReport,
} from '../controllers/admin/salesReportController.js'

const router = express.Router()

// Get sales report analytics
router.get('/', getSalesReport)

// Get top travelers
router.get('/top-travelers', getTopTravelers)

// Export to Excel
router.get('/export', exportSalesReport)

export default router
