
/* @type {import('tailwindcss').Config} */
module.exports = { 
  darkMode: ['class'],
  content: [ 
    "./app/**/*.{js,ts,jsx,tsx}", 
    "./pages/**/*.{js,ts,jsx,tsx}", 
    "./components/**/*.{js,ts,jsx,tsx}", 
      
    // Or if using `src` directory: 
    "./src/**/*.{js,ts,jsx,tsx}", 
  ], 
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        primary: {
          black: '#14181F',
          green: '#56FFA6',
          grey: {
            100: '#2B303B',
            200: '#202731',
            300: '#C4D3ED',
          },
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  }, 
  plugins: [require('tailwindcss-animate')],
}