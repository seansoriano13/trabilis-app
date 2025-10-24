import { supabase } from '../config/supabaseClient.js'

/**
 * Auto-delete tours that have been in recycle bin for more than 30 days
 * Runs daily via cron job
 */
export const autoDeleteExpiredTours = async () => {
  try {
    console.log('Running auto-delete expired tours job...')

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Find tours deleted more than 30 days ago
    const { data: expiredTours, error: findError } = await supabase
      .from('tour_packages')
      .select('id, title, deleted_at')
      .not('deleted_at', 'is', null)
      .lt('deleted_at', thirtyDaysAgo.toISOString())

    if (findError) {
      console.error('Error finding expired tours:', findError)
      return
    }

    if (!expiredTours || expiredTours.length === 0) {
      console.log('No expired tours to delete')
      return
    }

    console.log(`Found ${expiredTours.length} expired tours to delete`)

    // Delete each expired tour
    for (const tour of expiredTours) {
      try {
        // Delete itineraries first
        await supabase
          .from('package_itineraries')
          .delete()
          .eq('tour_package_id', tour.id)

        // Delete package dates (and related data via cascade)
        await supabase
          .from('package_dates')
          .delete()
          .eq('tour_package_id', tour.id)

        // Delete the tour package
        const { error: deleteError } = await supabase
          .from('tour_packages')
          .delete()
          .eq('id', tour.id)

        if (deleteError) {
          console.error(`Error deleting tour ${tour.id}:`, deleteError)
        } else {
          console.log(
            `Permanently deleted tour: ${tour.title} (ID: ${tour.id})`
          )
        }
      } catch (err) {
        console.error(`Error processing tour ${tour.id}:`, err)
      }
    }

    console.log('Auto-delete expired tours job completed')
  } catch (error) {
    console.error('Error in autoDeleteExpiredTours:', error)
  }
}
