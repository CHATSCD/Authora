import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bindery: {
          50: "#fdf8f0",
          100: "#faefd9",
          200: "#f4dcb0",
          300: "#ecc47e",
          400: "#e3a44a",
          500: "#db8c2a",
          600: "#c4711f",
          700: "#a3571b",
          800: "#84451d",
          900: "#6c3a1a",
          950: "#3a1c0b",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
