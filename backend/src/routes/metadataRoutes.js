import express from 'express'
import { 
    getAirline, 
    getAircraft, 
    getAllAircraft, 
    getAircraftOptionsEndpoint,
    getAllAirlines
} from '../controllers/metadataController.js'

const router = express.Router()

// Airline endpoints
router.get('/airlines', getAirline)
router.get('/airlines/all', getAllAirlines)

// Aircraft endpoints
router.get('/aircraft', getAircraft)
router.get('/aircraft/all', getAllAircraft)
router.get('/aircraft/options', getAircraftOptionsEndpoint)

export default router
