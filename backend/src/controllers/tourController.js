import { supabase } from '../config/supabaseClient.js'

// Get all tours
export const getAllTours = async (req, res) => {
    try {
        const { data, error } = await supabase.from('tour_packages').select(`
                *,
                dates:package_dates (
                    *,
                    itineraries:package_itineraries (*)
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
        .select(
            `
            *,
            dates:package_dates (
                *,
                itineraries:package_itineraries (*),
                inclusion_groups:package_inclusion_groups (
                    id,
                    title,
                    removable,
                    fee_impact_per_group,
                    position,
                    items:package_inclusion_group_items (
                        id,
                        content,
                        position
                    )
                )
            )
        `
        )
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

    const transformed = {
        ...data,
        dates: (data.dates || []).map((d) => {
            const fee_rules = d.fee_rules && typeof d.fee_rules === 'object'
                ? { ...DEFAULT_FEE_RULES, ...d.fee_rules }
                : { ...DEFAULT_FEE_RULES }

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

            return {
                ...d,
                fee_rules,
                inclusion_groups,
            }
        }),
    }

    res.json(transformed)
}
