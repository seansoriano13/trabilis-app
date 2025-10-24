import { supabase } from '../../config/supabaseClient.js'

/**
 * Get all visa requirements
 */
export const getAllRequirements = async (req, res) => {
  try {
    const { search } = req.query

    let query = supabase
      .from('visa_requirements')
      .select(
        `
        *,
        admins:updated_by (
          id,
          email
        )
      `
      )
      .eq('visa_type', 'tourist') // Filter to tourist visas only
      .order('country_name', { ascending: true })

    // Apply search filter
    if (search) {
      query = query.ilike('country_name', `%${search}%`)
    }

    const { data: requirements, error } = await query

    if (error) throw error

    const formattedRequirements = requirements.map((req) => ({
      ...req,
      updatedByEmail: req.admins?.email || 'System',
    }))

    res.json({
      success: true,
      requirements: formattedRequirements,
    })
  } catch (error) {
    console.error('Error fetching visa requirements:', error)
    res.status(500).json({ error: 'Failed to fetch visa requirements' })
  }
}

/**
 * Get specific country requirement
 */
export const getRequirement = async (req, res) => {
  try {
    const { countryCode } = req.params

    const { data: requirement, error } = await supabase
      .from('visa_requirements')
      .select(
        `
        *,
        admins:updated_by (
          id,
          email
        )
      `
      )
      .eq('country_code', countryCode)
      .eq('visa_type', 'tourist') // Filter to tourist visas
      .single()

    if (error) throw error

    res.json({
      success: true,
      requirement: {
        ...requirement,
        updatedByEmail: requirement.admins?.email || 'System',
      },
    })
  } catch (error) {
    console.error('Error fetching requirement:', error)
    res.status(500).json({ error: 'Failed to fetch requirement' })
  }
}

/**
 * Update visa requirement for a country
 */
export const updateRequirement = async (req, res) => {
  try {
    const { countryCode } = req.params
    const {
      country_name,
      requires_visa,
      required_documents,
      processing_time,
      notes,
    } = req.body

    const updateData = {
      updated_by: req.user.id,
    }

    if (country_name !== undefined) {
      updateData.country_name = country_name
      updateData.country = country_name // Also update the original 'country' column
    }
    if (requires_visa !== undefined) updateData.requires_visa = requires_visa
    if (required_documents !== undefined)
      updateData.required_documents = required_documents
    if (processing_time !== undefined) {
      // Store in both formats for compatibility
      updateData.processing_time_days = parseInt(processing_time) || null
    }
    if (notes !== undefined) updateData.notes = notes

    const { error } = await supabase
      .from('visa_requirements')
      .update(updateData)
      .eq('country_code', countryCode)
      .eq('visa_type', 'tourist') // Only update tourist visas

    if (error) throw error

    res.json({
      success: true,
      message: 'Visa requirement updated successfully',
    })
  } catch (error) {
    console.error('Error updating requirement:', error)
    res.status(500).json({ error: 'Failed to update requirement' })
  }
}

/**
 * Create new visa requirement
 */
export const createRequirement = async (req, res) => {
  try {
    const {
      country_code,
      country_name,
      requires_visa,
      required_documents,
      processing_time,
      notes,
    } = req.body

    const { error } = await supabase.from('visa_requirements').insert({
      country: country_name, // Map to existing 'country' column
      country_code,
      country_name,
      visa_type: 'tourist', // Default visa type for new records
      requires_visa: requires_visa || false,
      required_documents: required_documents || [],
      processing_time_days: processing_time ? parseInt(processing_time) : null,
      notes,
      requirements: notes || 'Tourist visa requirements', // Required field
      updated_by: req.user.id,
    })

    if (error) throw error

    res.json({
      success: true,
      message: 'Visa requirement created successfully',
    })
  } catch (error) {
    console.error('Error creating requirement:', error)
    res.status(500).json({ error: 'Failed to create requirement' })
  }
}

/**
 * Check if deletion is allowed (no active tours using this country)
 */
export const checkDeletionAllowed = async (req, res) => {
  try {
    const { countryCode } = req.params

    // Get country name first
    const { data: visaReq } = await supabase
      .from('visa_requirements')
      .select('country_name')
      .eq('country_code', countryCode)
      .eq('visa_type', 'tourist') // Only check tourist visas
      .single()

    if (!visaReq) {
      return res.status(404).json({ error: 'Visa requirement not found' })
    }

    // Check for active tours using this country
    const { data: tours, error } = await supabase
      .from('tour_packages')
      .select('id, title')
      .eq('destination_country', visaReq.country_name)
      .eq('status', 'PUBLISHED')
      .is('deleted_at', null)

    if (error) throw error

    const canDelete = !tours || tours.length === 0

    res.json({
      success: true,
      canDelete,
      activeTourCount: tours?.length || 0,
      tours: tours || [],
    })
  } catch (error) {
    console.error('Error checking deletion:', error)
    res.status(500).json({ error: 'Failed to check deletion status' })
  }
}

/**
 * Delete visa requirement
 */
export const deleteRequirement = async (req, res) => {
  try {
    const { countryCode } = req.params

    // Check if deletion is allowed
    const checkReq = { params: { countryCode }, query: {} }
    let checkResult

    await new Promise((resolve, reject) => {
      const mockRes = {
        json: (data) => {
          checkResult = data
          resolve()
        },
        status: (code) => ({
          json: (data) => {
            reject(new Error(data.error || 'Check failed'))
          },
        }),
      }
      // Properly handle async function errors
      checkDeletionAllowed(checkReq, mockRes).catch(reject)
    })

    if (!checkResult.canDelete) {
      return res.status(400).json({
        error: `Cannot delete - used in ${checkResult.activeTourCount} active tour(s)`,
        tours: checkResult.tours,
      })
    }

    // Proceed with deletion
    const { error } = await supabase
      .from('visa_requirements')
      .delete()
      .eq('country_code', countryCode)
      .eq('visa_type', 'tourist') // Only delete tourist visas

    if (error) throw error

    res.json({
      success: true,
      message: 'Visa requirement deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting requirement:', error)
    res.status(500).json({ error: 'Failed to delete requirement' })
  }
}
