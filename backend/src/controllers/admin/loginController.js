// controllers/adminController.js
import { supabase } from '../../config/supabaseClient.js'
import jwt from 'jsonwebtoken'

export const adminLogin = async (req, res) => {
    const { email, password } = req.body

    // Supabase auth sign-in
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) return res.status(401).json({ error: error.message })

    // Check role in admins table
    const { data: adminData, error: roleError } = await supabase
        .from('admins')
        .select('role')
        .eq('email', email)
        .single()

    if (roleError || !['admin', 'accounting'].includes(adminData.role)) {
        return res.status(403).json({ error: 'Access denied: Invalid role' })
    }

    // Issue JWT
    const token = jwt.sign(
        { id: data.user.id, email, role: adminData.role },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.NODE_ENV === 'development' ? '100y' : '8h',
        }
    )

    res.json({ token, email, role: adminData.role })
}
