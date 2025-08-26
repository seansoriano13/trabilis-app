module.exports = {
    content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#f7d100',
                yellowCustom: '#f7d100',
                secondary: {
                    400: '#464648',
                    500: '#18181A',
                },
            },
            boxShadow: {
                custom: '0 4px 6px rgba(0,0,0,0.3)',
            },
        },
    },
    plugins: [],
}
