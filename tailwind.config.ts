import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      colors: {
        // === Ink & Coal — Paleta Editorial Premium ===
        background: "#0B0E14",   // Tinta de imprenta profunda (más cálida que negro puro)
        surface: "rgba(17, 22, 34, 0.75)", // Superficie tipo papel envejecido oscuro
        primary: "#DF2032",      // Rojo bermellón — el color histórico de titulares de prensa
        secondary: "#C8A951",    // Dorado tinta de prensa antigua / sepia dorado
        accent: "#E07B39",       // Naranja tinta caliente — urgencia editorial
        
        // === Colores de Categoría — Tintas de Imprenta Curadas ===
        cat: {
          mundo:      "#C0392B", // Rojo imprenta profundo — noticias internacionales críticas
          argentina:  "#2C7BE5", // Azul acero diplomático — sobrio y confiable
          tecnologia: "#7C3AED", // Violeta eléctrico — innovación y futuro
          economia:   "#1A7A4A", // Verde pizarra financiero — dinero y mercados
          deportes:   "#D95D25", // Naranja óxido — energía y competencia
          cultura:    "#8B5CF6", // Lavanda artística — creatividad y expresión
          general:    "#475569"  // Pizarra neutra — contenido diverso
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
