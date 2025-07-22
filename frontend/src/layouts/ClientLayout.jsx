import ClientNavbar from '../components/client/ClientNavbar'
import { Outlet } from 'react-router-dom'
import '../styles/client/index.css'

export default function ClientLayout() {
    return (
        <>
            <ClientNavbar />
            <main>
                <Outlet />
            </main>
            <footer>Footer</footer>
        </>
    )
}
