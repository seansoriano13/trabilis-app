import ClientNavbar from '../components/client/ClientNavbar'
import { Outlet } from 'react-router-dom'
import '../styles/admin/index.css'
import Footer from '../components/client/Footer'

export default function ClientLayout() {
    return (
        <>
            <ClientNavbar />
            <main>
                <Outlet />
            </main>
            {/* <Footer /> */}
        </>
    )
}
