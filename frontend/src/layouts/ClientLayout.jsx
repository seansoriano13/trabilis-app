import ClientNavbar from '../components/client/ClientNavbar'
import { Outlet } from 'react-router-dom'
import '../styles/client/index.css'
import Footer from '../components/client/Footer'
import Chatbot from '../components/client/Chatbot'
import BotpressAI from '../components/client/BotpressAI'

export default function ClientLayout() {
    return (
        <>
            <ClientNavbar />
            <main>
                <Outlet />
            </main>
            {/* <Chatbot /> */}
            <BotpressAI />
            <Footer />
        </>
    )
}
