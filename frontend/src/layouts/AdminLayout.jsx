import AdminNavbar from '../components/admin/AdminNavbar'
import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
	return (
		<>
			<AdminNavbar />
			<main>
				<Outlet />
			</main>
		</>
	)
}
