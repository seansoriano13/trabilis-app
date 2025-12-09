import { supabase } from '../../config/supabaseClient.js'

/**
 * Get all soft-deleted tours (recycle bin)
 */
export const getRecycleBin = async (req, res) => {
  try {
    const { data: deletedTours, error } = await supabase
      .from('tour_packages')
      .select(
        `
        *,
        admins:deleted_by (
          id,
          email
        )
      `
      )
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })

    if (error) throw error

    const formattedTours = deletedTours.map((tour) => ({
      ...tour,
      deletedByEmail: tour.admins?.email || 'Unknown',
    }))

    res.json({
      success: true,
      tours: formattedTours,
    })
  } catch (error) {
    console.error('Error fetching recycle bin:', error)
    res.status(500).json({ error: 'Failed to fetch deleted tours' })
  }
}

/**
 * Restore a soft-deleted tour
 */
export const restoreTour = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('tour_packages')
      .update({
        deleted_at: null,
        deleted_by: null,
      })
      .eq('id', id)

    if (error) throw error

    res.json({
      success: true,
      message: 'Tour restored successfully',
    })
  } catch (error) {
    console.error('Error restoring tour:', error)
    res.status(500).json({ error: 'Failed to restore tour' })
  }
}

/**
 * Permanently delete a tour and all related records
 */
export const permanentlyDeleteTour = async (req, res) => {
  try {
    const { id } = req.params

    // Verify the tour is soft-deleted
    const { data: tour } = await supabase
      .from('tour_packages')
      .select('deleted_at')
      .eq('id', id)
      .single()

    if (!tour || !tour.deleted_at) {
      return res.status(400).json({
        error: 'Tour must be soft-deleted before permanent deletion',
      })
    }

    // Delete itineraries first
    await supabase
      .from('package_itineraries')
      .delete()
      .eq('tour_package_id', id)

    // Delete package dates (cascade will handle related records)
    await supabase.from('package_dates').delete().eq('tour_package_id', id)

    // Delete the tour package
    const { error } = await supabase.from('tour_packages').delete().eq('id', id)

    if (error) throw error

    res.json({
      success: true,
      message: 'Tour permanently deleted',
    })
  } catch (error) {
    console.error('Error permanently deleting tour:', error)
    res.status(500).json({ error: 'Failed to permanently delete tour' })
  }
}

/**
 * Get itinerary image limit setting
 */
export const getItineraryImageLimit = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'itinerary_max_images')
      .single()

    if (error) {
      // Return default if not found
      return res.json({ success: true, max: 10 })
    }

    // Handle both old format (direct number) and new format (object with max)
    const value = data.value
    const max = typeof value === 'number' ? value : (value?.max || 10)

    res.json({
      success: true,
      max: parseInt(max),
    })
  } catch (error) {
    console.error('Error fetching itinerary image limit:', error)
    res.status(500).json({ error: 'Failed to fetch itinerary image limit' })
  }
}

/**
 * Update itinerary image limit setting
 */
export const updateItineraryImageLimit = async (req, res) => {
  try {
    const { max } = req.body

    // Validate input
    const maxNum = parseInt(max)
    if (isNaN(maxNum) || maxNum < 1 || maxNum > 50) {
      return res.status(400).json({
        error: 'Invalid max value (must be between 1 and 50)',
      })
    }

    const { error } = await supabase.from('system_settings').upsert({
      key: 'itinerary_max_images',
      value: { max: maxNum },
    })

    if (error) throw error

    res.json({
      success: true,
      message: 'Itinerary image limit updated successfully',
      max: maxNum,
    })
  } catch (error) {
    console.error('Error updating itinerary image limit:', error)
    res.status(500).json({ error: 'Failed to update itinerary image limit' })
  }
}