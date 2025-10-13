import { useState } from 'react'
import axios from 'axios'

export default function Chatbot() {
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hi! How can I help you today?' },
    ])
    const [input, setInput] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

    const sendMessage = async () => {
        if (!input.trim()) return

        const newMessages = [...messages, { sender: 'user', text: input }]
        setMessages(newMessages)

        try {
            const res = await axios.post(`${BACKEND_URL}/api/v1/chatbot`, {
                message: input,
            })
            setMessages([
                ...newMessages,
                { sender: 'bot', text: res.data.reply },
            ])
        } catch (_err) {
            setMessages([
                ...newMessages,
                { sender: 'bot', text: 'Error contacting server.' },
            ])
        }

        setInput('')
    }

    return (
        <div>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: '#f7d100',
                        color: '#fff',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        zIndex: 49,
                    }}
                >
                    💬
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    style={{
                        width: '320px',
                        height: '420px',
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        borderRadius: '10px',
                        background: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            background: '#f7d100',
                            color: '#fff',
                            padding: '1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <span style={{ color: 'black' }}>Chatbot</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'transparent',
                                color: '#fff',
                                border: 'none',
                                fontSize: '18px',
                                cursor: 'pointer',
                            }}
                        >
                            ✖
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        style={{
                            padding: '10px',
                            flex: 1,
                            overflowY: 'auto',
                            background: '#f5f5f5',
                        }}
                    >
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                style={{
                                    textAlign:
                                        msg.sender === 'user'
                                            ? 'right'
                                            : 'left',
                                    margin: '5px 0',
                                }}
                            >
                                <span
                                    style={{
                                        display: 'inline-block',
                                        padding: '8px 12px',
                                        borderRadius: '18px',
                                        background:
                                            msg.sender === 'user'
                                                ? '#DCF8C6'
                                                : '#EAEAEA',
                                        maxWidth: '80%',
                                    }}
                                >
                                    {msg.text}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div
                        style={{
                            display: 'flex',
                            borderTop: '1px solid #ccc',
                            background: '#fff',
                        }}
                    >
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && sendMessage()
                            }
                            placeholder='Type your message...'
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: 'none',
                                outline: 'none',
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            style={{
                                padding: '10px 15px',
                                border: 'none',
                                background: '#f7d100',
                                color: 'black',
                                cursor: 'pointer',
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
