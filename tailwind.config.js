/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1A3A6B',
        secondary: '#2D7A4F',
        danger: '#CC2020',
        'danger-bg': '#FFF0F0',
        warning: '#B45309',
        ink: '#1F2937',
        panel: '#F9FAFB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
