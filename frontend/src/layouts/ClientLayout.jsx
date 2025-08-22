import ClientNavbar from '../components/client/ClientNavbar'
import { Outlet } from 'react-router-dom'
import '../styles/admin/index.css'
import Footer from '../components/client/Footer'
import Chatbot from '../components/client/Chatbot'

export default function ClientLayout() {
    return (
        <>
            <ClientNavbar />
            <main>
                <Outlet />
            </main>
            <Chatbot />
            {/* <Footer /> */}
        </>
    )
}
