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

    if (roleError || adminData.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Admins only' })
    }

    // Issue JWT for your backend
    const token = jwt.sign(
        { id: data.user.id, email, role: 'admin' },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.NODE_ENV === 'development' ? '100y' : '8h',
        }
    )

    res.json({ token })
}
