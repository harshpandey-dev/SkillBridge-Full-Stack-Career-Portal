/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#163A5F',
          dark: '#0F2A45',
          light: '#1E4A75',
        },
        brand: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#EFF6FF',
          border: '#BFDBFE',
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9ddfd',
          300: '#7cc2fb',
          400: '#36a2f7',
          500: '#0c87eb',
          600: '#006bc9',
          700: '#0155a3',
          800: '#064886',
          900: '#0b3d6f',
        },
        teal: {
          DEFAULT: '#0F9D8A',
          dark: '#0B7A6E',
          light: '#E6F7F5',
        },
        page: '#F7F8FA',
        ink: '#172033',
        dim: '#667085',
        line: '#E4E7EC',
        subtle: '#F2F4F7',
        error: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FFFBEB',
        },
        success: {
          DEFAULT: '#059669',
          light: '#ECFDF5',
        },
      },
    },
  },
  plugins: [],
}
