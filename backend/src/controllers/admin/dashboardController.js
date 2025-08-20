import { supabase } from '../../config/supabaseClient.js'

export const getFlightBookings = async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const pageSize = 5
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1
    const status = req.query.status
    const destination = req.query.destination

    try {
        let query = supabase
            .from('flight_bookings')
            .select(
                `
                *,
                passenger_details:passenger_details!inner(travelers(name))
            `,
                { count: 'exact' }
            )
            .range(start, end)
            .order('search_criteria->>outboundDeparture', { ascending: true })

        if (status && status !== 'All') {
            query = query.eq('status', status)
        }
        if (destination) {
            query = query.ilike(
                'search_criteria->>destination',
                `%${destination}%`
            )
        }

        const { data, error, count } = await query

        if (error) throw error

        res.json({ data, total: count })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch flight bookings' })
    }
}

export const getTourBookings = async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const pageSize = 5
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1
    const status = req.query.status
    const packageName = req.query.package_name

    try {
        let query = supabase
            .from('tour_bookings')
            .select(
                `
                *,
                package_dates (
                    id,
                    start_date,
                    end_date,
                    total_slots,
                    tour_package_id,
                    tour_packages (title)
                )
            `,
                { count: 'exact' }
            )
            .range(start, end)
            .order('created_at', { ascending: true })

        if (status && status !== 'All') {
            query = query.eq('status', status)
        }
        if (packageName) {
            query = query.ilike(
                'package_dates.tour_packages.title',
                `%${packageName}%`
            )
        }

        const { data, error, count } = await query

        if (error) throw error

        res.json({ data, total: count })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tour bookings' })
    }
}

export const getAdminNotifications = async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const pageSize = 5
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    try {
        const { data, error, count } = await supabase
            .from('admin_notifications')
            .select('*', { count: 'exact' })
            .range(start, end)
            .order('created_at', { ascending: false })

        if (error) throw error

        res.json({ data, total: count })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' })
    }
}

export const getRevenue = async (req, res) => {
    try {
        const { data, error } = await supabase.rpc('get_monthly_revenue', {
            start_date: '2025-01-01',
            end_date: '2025-06-30',
        })

        if (error) throw error

        res.json(data)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch revenue' })
    }
}

export const getFlightStats = async (req, res) => {
    try {
        const { data, error } = await supabase.rpc('get_flight_stats')

        if (error) throw error

        res.json(data[0])
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch flight stats' })
    }
}

export const getTourStats = async (req, res) => {
    try {
        const { data, error } = await supabase.rpc('get_tour_stats')

        if (error) throw error

        res.json(data[0])
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tour stats' })
    }
}

export const getUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const pageSize = 5
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1
    const role = req.query.role

    // Ensure only admin can access
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Admins only' })
    }

    try {
        let query = supabase
            .from('admins')
            .select('*', { count: 'exact' })
            .range(start, end)
            .order('email', { ascending: true })

        if (role && role !== 'All') {
            query = query.eq('role', role)
        }

        const { data, error, count } = await query

        if (error) throw error

        res.json({ data, total: count })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' })
    }
}

export const createUser = async (req, res) => {
    const { first_name, last_name, email, password, role } = req.body

    // Ensure only admin can create users
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Admins only' })
    }

    try {
        // Create user in auth.users
        const { data: authData, error: authError } =
            await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true, // Send confirmation email
            })

        if (authError) throw authError

        // Insert into admins table
        const { error: insertError } = await supabase.from('admins').insert({
            id: authData.user.id,
            email,
            role: role || 'admin',
            first_name,
            last_name,
        })

        if (insertError) {
            // Rollback: Delete user from auth.users if admins insert fails
            await supabase.auth.admin.deleteUser(authData.user.id)
            throw insertError
        }

        res.json({ message: 'User created successfully' })
    } catch (error) {
        res.status(500).json({
            error: `Failed to create user: ${error.message}`,
        })
    }
}

export const updateUser = async (req, res) => {
    const { id } = req.params
    const { role } = req.body

    // Ensure only admin can update users
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Admins only' })
    }

    try {
        const { error } = await supabase
            .from('admins')
            .update({ role })
            .eq('id', id)

        if (error) throw error

        res.json({ message: 'User updated successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' })
    }
}

export const deleteUser = async (req, res) => {
    const { id } = req.params

    // Ensure only admin can delete users
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Admins only' })
    }

    try {
        // Delete from admins table
        const { error: adminError } = await supabase
            .from('admins')
            .delete()
            .eq('id', id)

        if (adminError) throw adminError

        // Delete from auth.users
        const { error: authError } = await supabase.auth.admin.deleteUser(id)

        if (authError) throw authError

        res.json({ message: 'User deleted successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' })
    }
}

export const getUserStats = async (req, res) => {
    try {
        const { data, error } = await supabase.rpc('get_user_stats')

        if (error) throw error

        res.json(data[0])
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user stats' })
    }
}
