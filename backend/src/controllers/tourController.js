import { supabase } from '../config/supabaseClient.js'

// Helper function to normalize itinerary images
const normalizeItineraryImages = async (itineraries) => {
    if (!Array.isArray(itineraries)) return []
    
    return Promise.all(itineraries.map(async (itinerary) => {
        let images = []
        
        // Check if image_metadata exists and has data
        if (itinerary.image_metadata && Array.isArray(itinerary.image_metadata) && itinerary.image_metadata.length > 0) {
            images = itinerary.image_metadata
        } else if (itinerary.image_url) {
            // Auto-convert: migrate single image_url to image_metadata array
            images = [itinerary.image_url]
            
            // Update database to store in image_metadata
            if (itinerary.id) {
                try {
                    await supabase
                        .from('package_itineraries')
                        .update({
                            image_metadata: images,
                            image_url: null, // Clear old field
                        })
                        .eq('id', itinerary.id)
                } catch (err) {
                    console.error(`Error migrating image for itinerary ${itinerary.id}:`, err)
                }
            }
        }
        
        return {
            ...itinerary,
            images: images,
        }
    }))
}

// Get all tours
export const getAllTours = async (req, res) => {
    try {
        const { data, error } = await supabase.from('tour_packages').select(`
                *,
                itineraries:package_itineraries!tour_package_id (*),
                dates:package_dates (
                    *,
                    inclusion_groups:package_inclusion_groups (
                        id, title, removable, fee_impact_per_group, position,
                        items:package_inclusion_group_items (id, content, position)
                    )
                )
            `)

        if (error) return res.status(400).json({ error: error.message })
        
        // Normalize images for all tours
        const normalizedData = await Promise.all(data.map(async (tour) => ({
            ...tour,
            itineraries: await normalizeItineraryImages(tour.itineraries || [])
        })))
        
        res.json(normalizedData)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tours' })
    }
}

export const getTour = async (req, res) => {
    const { id } = req.params

    const { data, error } = await supabase
        .from('tour_packages')
        .select(`
            *,
            itineraries:package_itineraries!tour_package_id (*),
            dates:package_dates (
                *,
                inclusion_groups:package_inclusion_groups (
                    id, title, removable, fee_impact_per_group, position,
                    items:package_inclusion_group_items (id, content, position)
                )
            )
        `)
        .eq('id', id)
        .single()

    if (error) return res.status(500).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Tour not found' })

    // Apply defaults for fee_rules and normalize inclusion_groups items to string[]
    const DEFAULT_FEE_RULES = {
        perRemovedGroup: 5000,
        perRestDay: 3000,
        minFee: 5000,
        maxFee: 50000,
    }

    // Get tour-level fee_rules
    const tourFeeRules = data.fee_rules && typeof data.fee_rules === 'object'
        ? { ...DEFAULT_FEE_RULES, ...data.fee_rules }
        : { ...DEFAULT_FEE_RULES }

    // Normalize itinerary images: convert image_url to images array
    const normalizedItineraries = await normalizeItineraryImages(data.itineraries || [])

    const transformed = {
        ...data,
        fee_rules: tourFeeRules,
        itineraries: normalizedItineraries.sort((a, b) => a.day_number - b.day_number),
        dates: (data.dates || []).map((d) => {
            const fee_rules = d.fee_rules && typeof d.fee_rules === 'object'
                ? { ...tourFeeRules, ...d.fee_rules }
                : { ...tourFeeRules }

            const inclusion_groups = (d.inclusion_groups || [])
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((g) => ({
                    id: g.id,
                    title: g.title,
                    removable: g.removable,
                    fee_impact_per_group: g.fee_impact_per_group,
                    items: (g.items || [])
                        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                        .map((it) => it.content),
                }))

            return { ...d, fee_rules, inclusion_groups }
        })
    }

    // Debug log to see what's being returned
    console.log('🔍 TOUR DEBUG - Client getTour response:', {
        tourId: id,
        datesCount: transformed.dates?.length || 0,
        firstDateItineraries: transformed.dates?.[0]?.itineraries?.length || 0,
        firstDateInclusionGroups: transformed.dates?.[0]?.inclusion_groups?.length || 0,
        tourLevelFeeRules: transformed.fee_rules || {},
        firstDateFeeRules: transformed.dates?.[0]?.fee_rules || {},
    })

    res.json(transformed)
}
