/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cleanik: {
          blue: '#3B9FD1',
          dark: '#1E3A5F',
          light: '#E8F4FB',
        }
      }
    }
  },
  plugins: []
}
