import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0E1210",
          900: "#141A17",
          800: "#1C2420",
          700: "#28332D",
          600: "#3A483F",
        },
        paper: "#F4F1E8",
        clay: {
          400: "#DDA05C",
          500: "#C67C2E",
          600: "#A5641F",
          700: "#824C15",
        },
        forest: {
          400: "#5C9C82",
          500: "#2F6F5E",
          600: "#20574A",
        },
        alert: {
          500: "#C1502E",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
