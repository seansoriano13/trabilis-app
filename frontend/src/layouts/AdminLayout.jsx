import AdminNavbar from '../components/admin/AdminNavbar'
import { Outlet } from 'react-router-dom'
import './AdminLayout.css'

export default function AdminProtectedLayout() {
    return (
        <>
            <AdminNavbar />
            <main className='admin-layout'>
                <Outlet />
            </main>
        </>
    )
}
