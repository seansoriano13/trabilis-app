import express from 'express'
import { searchAirports, getCacheStats, clearCache } from '../controllers/airportSearchController.js'

const router = express.Router()

// Main airport search endpoint
router.post('/search', searchAirports)

// Admin/monitoring endpoints
router.get('/cache-stats', getCacheStats)
router.post('/clear-cache', clearCache)

export default router
