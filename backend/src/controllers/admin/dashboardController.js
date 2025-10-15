import { supabase, supabaseAdmin } from '../../config/supabaseClient.js'

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
    const pageSize = parseInt(req.query.limit) || 100
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

// Backfill assigned_to/assigned_by into admin_notifications for existing rows
export const backfillNotificationAssignees = async (req, res) => {
    try {
        // Flights
        const { data: flightNotifs } = await supabase
            .from('admin_notifications')
            .select('id, booking_reference')
            .is('assigned_to', null)
            .eq('booking_type', 'flight')
            .in('type', ['booking_assigned', 'booking_reassigned'])

        if (flightNotifs && flightNotifs.length) {
            for (const n of flightNotifs) {
                const { data: fb } = await supabase
                    .from('flight_bookings')
                    .select('assigned_to, assigned_by')
                    .eq('booking_reference', n.booking_reference)
                    .single()
                if (fb) {
                    await supabase
                        .from('admin_notifications')
                        .update({ assigned_to: fb.assigned_to || null, assigned_by: fb.assigned_by || null })
                        .eq('id', n.id)
                }
            }
        }

        // Tours
        const { data: tourNotifs } = await supabase
            .from('admin_notifications')
            .select('id, booking_reference')
            .is('assigned_to', null)
            .eq('booking_type', 'tour')
            .in('type', ['booking_assigned', 'booking_reassigned'])

        if (tourNotifs && tourNotifs.length) {
            for (const n of tourNotifs) {
                const { data: tb } = await supabase
                    .from('tour_bookings')
                    .select('assigned_to, assigned_by')
                    .eq('booking_reference', n.booking_reference)
                    .single()
                if (tb) {
                    await supabase
                        .from('admin_notifications')
                        .update({ assigned_to: tb.assigned_to || null, assigned_by: tb.assigned_by || null })
                        .eq('id', n.id)
                }
            }
        }

        return res.json({ success: true })
    } catch (error) {
        console.error('Backfill failed:', error)
        return res.status(500).json({ success: false, error: 'Backfill failed' })
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
            await supabaseAdmin.auth.admin.createUser({
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
            try {
                await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            } catch (rollbackError) {
                console.error('Rollback failed:', rollbackError)
            }
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
        // Delete from auth.users first (must use service role client)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)

        // If user not found in auth, continue to clean up admins table
        if (authError && authError.status !== 404) {
            throw authError
        }

        // Nullify foreign key references before deleting admin to satisfy FKs
        const { error: tourAssignedToNullErr } = await supabase
            .from('tour_bookings')
            .update({ assigned_to: null })
            .eq('assigned_to', id)

        if (tourAssignedToNullErr) throw tourAssignedToNullErr

        const { error: tourAssignedByNullErr } = await supabase
            .from('tour_bookings')
            .update({ assigned_by: null })
            .eq('assigned_by', id)

        if (tourAssignedByNullErr) throw tourAssignedByNullErr

        const { error: flightAssignedToNullErr } = await supabase
            .from('flight_bookings')
            .update({ assigned_to: null })
            .eq('assigned_to', id)

        if (flightAssignedToNullErr) throw flightAssignedToNullErr

        const { error: flightAssignedByNullErr } = await supabase
            .from('flight_bookings')
            .update({ assigned_by: null })
            .eq('assigned_by', id)

        if (flightAssignedByNullErr) throw flightAssignedByNullErr

        const { error: notifAssignedToNullErr } = await supabase
            .from('admin_notifications')
            .update({ assigned_to: null })
            .eq('assigned_to', id)

        if (notifAssignedToNullErr) throw notifAssignedToNullErr

        const { error: notifAssignedByNullErr } = await supabase
            .from('admin_notifications')
            .update({ assigned_by: null })
            .eq('assigned_by', id)

        if (notifAssignedByNullErr) throw notifAssignedByNullErr

        // Delete from admins table regardless
        const { error: adminError } = await supabase
            .from('admins')
            .delete()
            .eq('id', id)

        if (adminError) throw adminError

        res.json({ message: 'User deleted successfully' })
    } catch (error) {
        console.error('Delete user failed:', error)
        res.status(500).json({ error: `Failed to delete user: ${error.message || 'Unknown error'}` })
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

// Resolve a booking reference to type and numeric id
export const resolveBookingByReference = async (req, res) => {
    try {
        const ref = (req.query.ref || '').toString().trim()
        if (!ref) return res.status(400).json({ success: false, error: 'ref is required' })

        // Try flight first
        const { data: flight } = await supabase
            .from('flight_bookings')
            .select('id')
            .eq('booking_reference', ref)
            .single()
        if (flight) return res.json({ success: true, type: 'flight', id: flight.id })

        // Then tour
        const { data: tour } = await supabase
            .from('tour_bookings')
            .select('id')
            .eq('booking_reference', ref)
            .single()
        if (tour) return res.json({ success: true, type: 'tour', id: tour.id })

        // Then visa
        const { data: visa } = await supabase
            .from('visa_inquiries')
            .select('id')
            .eq('inquiry_reference', ref)
            .single()
        if (visa) return res.json({ success: true, type: 'visa', id: visa.id })

        return res.status(404).json({ success: false, error: 'Reference not found' })
    } catch (error) {
        console.error('Resolve booking error:', error)
        return res.status(500).json({ success: false, error: 'Failed to resolve reference' })
    }
}
