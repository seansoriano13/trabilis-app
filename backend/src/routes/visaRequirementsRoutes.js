import express from 'express'
import {
  getAllRequirements,
  getRequirement,
  updateRequirement,
  createRequirement,
  checkDeletionAllowed,
  deleteRequirement,
} from '../controllers/admin/visaRequirementsController.js'

const router = express.Router()

// Get all visa requirements
router.get('/', getAllRequirements)

// Get specific country requirement
router.get('/:countryCode', getRequirement)

// Create new requirement
router.post('/', createRequirement)

// Update requirement
router.put('/:countryCode', updateRequirement)

// Check if deletion is allowed
router.get('/:countryCode/can-delete', checkDeletionAllowed)

// Delete requirement
router.delete('/:countryCode', deleteRequirement)

export default router
