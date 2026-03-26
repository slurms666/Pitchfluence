import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f8fafc",
          100: "#eef2ff",
          200: "#dbe3f3",
          300: "#b6c2db",
          400: "#7f8ba7",
          500: "#5a647c",
          600: "#394151",
          700: "#222833",
          800: "#171c24",
          900: "#0f141a"
        },
        brand: {
          50: "#effbf7",
          100: "#d6f5ec",
          200: "#aeead8",
          300: "#7fdbbf",
          400: "#48c3a1",
          500: "#22a184",
          600: "#177f69",
          700: "#146655",
          800: "#155145",
          900: "#15433a"
        },
        sand: {
          50: "#fefdfa",
          100: "#faf7ef",
          200: "#f1ebdc",
          300: "#e7dcc5",
          400: "#d5c29d",
          500: "#bfa36b"
        }
      },
      boxShadow: {
        soft: "0 24px 58px -30px rgba(15, 20, 26, 0.24), 0 10px 24px -18px rgba(34, 40, 51, 0.12)",
      },
      backgroundImage: {
        "graph-paper":
          "linear-gradient(to right, rgba(57,65,81,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(57,65,81,0.06) 1px, transparent 1px)",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "sans-serif"],
        display: ["var(--font-sora)", "var(--font-plus-jakarta)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
