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
