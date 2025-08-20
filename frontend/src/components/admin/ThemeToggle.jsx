import React, { useState } from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'
import './ThemeToggle.css'

const ThemeToggle = () => {
    const [isDarkMode, setIsDarkMode] = useState(false)

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode)
        document.documentElement.setAttribute(
            'data-theme',
            isDarkMode ? 'light' : 'dark'
        )
    }

    return (
        <button
            className='theme-toggle'
            onClick={toggleTheme}
        >
            {isDarkMode ? (
                <FiSun
                    size={24}
                    color='#f7d100'
                />
            ) : (
                <FiMoon
                    size={24}
                    color='#f7d100'
                />
            )}
        </button>
    )
}

export default ThemeToggle
