/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#EA6A2A',
          'orange-hover': '#D85818',
          'orange-light': '#FFF0E8',
          peach: '#FACCAE',
          dark: '#111827',
          card: '#1F2937',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Outfit"', 'sans-serif'],
        card: ['"Plus Jakarta Sans"', '"Outfit"', 'sans-serif'],
      },
      boxShadow: {
        'card-glow': '0 20px 40px -15px rgba(234, 106, 42, 0.25)',
        'studio': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
