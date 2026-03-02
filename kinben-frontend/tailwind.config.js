/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1a202c",
        secondary: "#718096",
        accent: "#c41e3a",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "avenir", "sans-serif"],
      },
    },
  },
  plugins: [],
}
