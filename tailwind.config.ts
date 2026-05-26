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
        background: "#050811", // Deep ink black/navy
        surface: "rgba(13, 20, 35, 0.7)", // Deep slate surface with opacity
        primary: "#ff3838", // Vibrant news red/crimson
        secondary: "#00d2d3", // Electric cyan/teal
        accent: "#ff9f43", // Warm vibrant orange
        
        // Category Specific Colors
        cat: {
          mundo: "#ef4444", // Crimson Red
          argentina: "#0ea5e9", // Sky Blue
          tecnologia: "#d946ef", // Fuchsia Pink
          economia: "#10b981", // Emerald Green
          deportes: "#f97316", // Bright Orange
          cultura: "#14b8a6", // Teal
          general: "#64748b" // Slate Gray
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
