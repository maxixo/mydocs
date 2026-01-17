/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6163f5",
        "background-light": "#f6f6f8",
        "background-dark": "#0a0a0f",
        "brand-gradient-start": "#6366f1",
        "brand-gradient-end": "#8b5cf6"
      },
      fontFamily: {
        display: ["Spline Sans", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};
