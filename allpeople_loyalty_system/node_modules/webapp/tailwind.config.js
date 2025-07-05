/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Le decimos que mire todos nuestros archivos de React
  ],
  darkMode: 'class', // Activamos el modo oscuro basado en una clase HTML
  theme: {
    extend: {},
  },
  plugins: [],
}