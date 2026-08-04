/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: '#111827',
        surfaceBorder: '#1f293d',
        brand: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        accent: {
          purple: '#8b5cf6',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          cyan: '#06b6d4'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
