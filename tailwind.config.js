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
          bg: "#090d16",       // Fondo ultra oscuro (OLED/Deep Slate)
          surface: "#0f172a",  // Tarjetas principales (Slate 900)
          card: "#1e293b",     // Tarjetas secundarias / Hover (Slate 800)
          border: "#334155",   // Bordes definidos (Slate 700)
          subtle: "#475569",   // Bordes suaves
          neon: "#10b981",     // Verde Neón Deportivo (Emerald 500)
          accent: "#f59e0b",   // Dorado / Torneos (Amber 500)
          muted: "#94a3b8",    // Textos secundarios (Slate 400)
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "fox-glow": "0 0 20px -5px rgba(16, 185, 129, 0.25)",
        "fox-card": "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};