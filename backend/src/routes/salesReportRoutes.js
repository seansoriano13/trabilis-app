import express from 'express'
import {
  getSalesReport,
  getTopTravelers,
  getTopTours,
  exportSalesReport,
  getAgentSalesStats,
} from '../controllers/admin/salesReportController.js'

const router = express.Router()

// Get sales report analytics
router.get('/', getSalesReport)

// Get top travelers
router.get('/top-travelers', getTopTravelers)

// Get top tour packages
router.get('/top-tours', getTopTours)

// Get agent-level sales stats
router.get('/agent-stats', getAgentSalesStats)

// Export to Excel
router.get('/export', exportSalesReport)

export default router
