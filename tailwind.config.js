/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fox: {
          bg: "#181818",
          surface: "#211b25",
          card: "#2b2530",
          border: "#49414f",
          subtle: "#5e5663",
          neon: "#ff9f00",     // Alias existente para acentos de acción
          accent: "#660090",   // Violeta principal FOXREN
          muted: "#939393",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "fox-glow": "0 0 20px -5px rgba(102, 0, 144, 0.4)",
        "fox-card": "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
