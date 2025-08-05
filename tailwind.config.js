/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7F5AF0",
        background: "#0D0D0D",
        accent: "#654DD4",
        text: "#FFFFFF",
        textMedium: "#A1A1AA",
        surface: "#FFFFFF14",
      },
    },
  },
  plugins: [],
} 