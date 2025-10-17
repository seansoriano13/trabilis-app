import { supabase } from '../config/supabaseClient.js'

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
        res.json(data)
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

    const transformed = {
        ...data,
        fee_rules: tourFeeRules,
        itineraries: (data.itineraries || []).sort((a, b) => a.day_number - b.day_number),
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
