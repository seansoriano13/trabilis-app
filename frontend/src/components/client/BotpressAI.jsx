import { Fab, Webchat } from '@botpress/webchat'
import { useState } from 'react'
import './BotpressAI.css'

function BotpressAI() {
    const [isWebchatOpen, setIsWebchatOpen] = useState(false)
    const toggleWebchat = () => setIsWebchatOpen((prev) => !prev)

    const chatConfig = {
        botName: 'Lindela AI',
        botAvatar: '/Favicon.png',
        botDescription:
            'Hi! Lindela AI here! I can help you with flights and tour packages.',
        fabImage: '/Favicon.png',
        phone: { title: 'Call Support', link: 'tel:+639176360294' },
        email: {
            title: 'Email Us',
            link: 'mailto:lindelatravelctws@gmail.com',
        },
        website: {
            title: 'Visit our website',
            link: 'https://trabilis.vercel.app',
        },
        composerPlaceholder: 'Where to book flight...',
        color: '#FFD700', // gold theme
        radius: 1.5, // rounded corners
        themeMode: 'light',
        variant: 'solid',
        fontFamily: 'inter',
        showPoweredBy: false,
        allowFileUpload: true,
        storageLocation: 'localStorage',
        footer: '*Trabilis - Lindela Travel & Tours* — Your trusted travel partner.',
        headerVariant: 'solid',
        feedbackEnabled: false,
    }

    return (
        <>
            <Webchat
                clientId='83ab5869-a1f5-4b26-9148-3a1b8ddff662'
                configuration={chatConfig}
                style={{
                    width: '90%',
                    maxWidth: '400px',
                    height: '40vh',
                    minHeight: '500px',
                    display: isWebchatOpen ? 'flex' : 'none',
                    position: 'fixed',
                    bottom: '90px',
                    right: '5%',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    zIndex: 10000,
                }}
            />
            <Fab
                onClick={toggleWebchat}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#FFD700',
                    borderRadius: '50%',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    zIndex: 10001,
                }}
            />
        </>
    )
}

export default BotpressAI
