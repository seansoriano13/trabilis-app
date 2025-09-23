import { supabase } from '../../config/supabaseClient.js'

// List inclusion groups for a package date, with items
export const listInclusionGroups = async (req, res) => {
    try {
        const { dateId } = req.params
        if (!Number.isInteger(Number(dateId))) {
            return res.status(400).json({ error: 'Invalid dateId' })
        }
        const { data: groups, error } = await supabase
            .from('package_inclusion_groups')
            .select(`id, title, removable, fee_impact_per_group, position, items:package_inclusion_group_items(id, content, position)`) 
            .eq('package_date_id', Number(dateId))
            .order('position', { ascending: true })
        if (error) return res.status(500).json({ error: error.message })
        res.json(groups || [])
    } catch (err) {
        res.status(500).json({ error: 'Failed to list inclusion groups' })
    }
}

// Create inclusion group for a package date
export const createInclusionGroup = async (req, res) => {
    try {
        const { dateId } = req.params
        const { title, removable = true, fee_impact_per_group = null, position } = req.body || {}
        if (!Number.isInteger(Number(dateId)) || !title) {
            return res.status(400).json({ error: 'dateId and title are required' })
        }
        // Determine next available position if not provided
        let positionToUse = Number(position)
        if (!Number.isInteger(positionToUse)) {
            const { data: maxRow, error: maxErr } = await supabase
                .from('package_inclusion_groups')
                .select('position')
                .eq('package_date_id', Number(dateId))
                .order('position', { ascending: false })
                .limit(1)
                .maybeSingle()
            if (maxErr && maxErr.message) {
                return res.status(500).json({ error: 'Failed to compute next position' })
            }
            positionToUse = maxRow && Number.isInteger(maxRow.position) ? maxRow.position + 1 : 1
        }
        const { data, error } = await supabase
            .from('package_inclusion_groups')
            .insert({
                package_date_id: Number(dateId),
                title,
                removable: Boolean(removable),
                fee_impact_per_group,
                position: positionToUse,
            })
            .select()
            .single()
        if (error) return res.status(500).json({ error: error.message })
        res.status(201).json(data)
    } catch (err) {
        res.status(500).json({ error: 'Failed to create inclusion group' })
    }
}

// Update inclusion group
export const updateInclusionGroup = async (req, res) => {
    try {
        const { groupId } = req.params
        const { title, removable, fee_impact_per_group, position } = req.body || {}
        if (!Number.isInteger(Number(groupId))) {
            return res.status(400).json({ error: 'Invalid groupId' })
        }
        const update = {}
        if (typeof title === 'string') update.title = title
        if (typeof removable === 'boolean') update.removable = removable
        if (position !== undefined) update.position = Number(position) || 0
        if (fee_impact_per_group !== undefined) update.fee_impact_per_group = fee_impact_per_group

        const { data, error } = await supabase
            .from('package_inclusion_groups')
            .update({ ...update, updated_at: new Date().toISOString() })
            .eq('id', Number(groupId))
            .select()
            .single()
        if (error) return res.status(500).json({ error: error.message })
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: 'Failed to update inclusion group' })
    }
}

// Delete inclusion group
export const deleteInclusionGroup = async (req, res) => {
    try {
        const { groupId } = req.params
        if (!Number.isInteger(Number(groupId))) {
            return res.status(400).json({ error: 'Invalid groupId' })
        }
        const { error } = await supabase
            .from('package_inclusion_groups')
            .delete()
            .eq('id', Number(groupId))
        if (error) return res.status(500).json({ error: error.message })
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete inclusion group' })
    }
}

// List items of a group
export const listInclusionGroupItems = async (req, res) => {
    try {
        const { groupId } = req.params
        if (!Number.isInteger(Number(groupId))) {
            return res.status(400).json({ error: 'Invalid groupId' })
        }
        const { data, error } = await supabase
            .from('package_inclusion_group_items')
            .select('id, content, position')
            .eq('inclusion_group_id', Number(groupId))
            .order('position', { ascending: true })
        if (error) return res.status(500).json({ error: error.message })
        res.json(data || [])
    } catch (err) {
        res.status(500).json({ error: 'Failed to list items' })
    }
}

// Create item in a group
export const createInclusionGroupItem = async (req, res) => {
    try {
        const { groupId } = req.params
        const { content, position } = req.body || {}
        if (!Number.isInteger(Number(groupId)) || !content) {
            return res.status(400).json({ error: 'groupId and content are required' })
        }
        // Determine next available position if not provided
        let positionToUse = Number(position)
        if (!Number.isInteger(positionToUse)) {
            const { data: maxRow, error: maxErr } = await supabase
                .from('package_inclusion_group_items')
                .select('position')
                .eq('inclusion_group_id', Number(groupId))
                .order('position', { ascending: false })
                .limit(1)
                .maybeSingle()
            if (maxErr && maxErr.message) {
                return res.status(500).json({ error: 'Failed to compute next item position' })
            }
            positionToUse = maxRow && Number.isInteger(maxRow.position) ? maxRow.position + 1 : 1
        }
        const { data, error } = await supabase
            .from('package_inclusion_group_items')
            .insert({
                inclusion_group_id: Number(groupId),
                content,
                position: positionToUse,
            })
            .select()
            .single()
        if (error) return res.status(500).json({ error: error.message })
        res.status(201).json(data)
    } catch (err) {
        res.status(500).json({ error: 'Failed to create item' })
    }
}

// Update item
export const updateInclusionGroupItem = async (req, res) => {
    try {
        const { itemId } = req.params
        const { content, position } = req.body || {}
        if (!Number.isInteger(Number(itemId))) {
            return res.status(400).json({ error: 'Invalid itemId' })
        }
        const update = {}
        if (typeof content === 'string') update.content = content
        if (position !== undefined) update.position = Number(position) || 1
        const { data, error } = await supabase
            .from('package_inclusion_group_items')
            .update({ ...update, updated_at: new Date().toISOString() })
            .eq('id', Number(itemId))
            .select()
            .single()
        if (error) return res.status(500).json({ error: error.message })
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: 'Failed to update item' })
    }
}

// Delete item
export const deleteInclusionGroupItem = async (req, res) => {
    try {
        const { itemId } = req.params
        if (!Number.isInteger(Number(itemId))) {
            return res.status(400).json({ error: 'Invalid itemId' })
        }
        const { error } = await supabase
            .from('package_inclusion_group_items')
            .delete()
            .eq('id', Number(itemId))
        if (error) return res.status(500).json({ error: error.message })
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete item' })
    }
}

// Update fee rules jsonb for a package date
export const updateFeeRules = async (req, res) => {
    try {
        const { dateId } = req.params
        const { perRemovedGroup, perRestDay, minFee, maxFee } = req.body || {}
        if (!Number.isInteger(Number(dateId))) {
            return res.status(400).json({ error: 'Invalid dateId' })
        }
        const fee_rules = {
            ...(perRemovedGroup !== undefined ? { perRemovedGroup } : {}),
            ...(perRestDay !== undefined ? { perRestDay } : {}),
            ...(minFee !== undefined ? { minFee } : {}),
            ...(maxFee !== undefined ? { maxFee } : {}),
        }
        const { data, error } = await supabase
            .from('package_dates')
            .update({ fee_rules })
            .eq('id', Number(dateId))
            .select('id, fee_rules')
            .single()
        if (error) return res.status(500).json({ error: error.message })
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: 'Failed to update fee rules' })
    }
}


