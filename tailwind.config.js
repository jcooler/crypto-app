/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'custom-blue': '0 4px 14px 0 rgba(59, 130, 246, 0.5)',
      },
      colors: {
        
      },
    },
  },
  plugins: [],
}