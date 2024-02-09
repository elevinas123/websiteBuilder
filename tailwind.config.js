/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            gridTemplateColumns: {
                // Define custom column settings
                '100': 'repeat(100, minmax(0, 1fr))',
                '80': 'repeat(80, minmax(0, 1fr))',
            },
            gridTemplateRows: {
                // Define custom row settings
                '100': 'repeat(100, minmax(0, 1fr))',
                '80': 'repeat(80, minmax(0, 1fr))',
            },
        },
    },
    plugins: [],
}

