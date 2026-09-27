import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Thème clair, aligné sur la maquette Uizard d'origine : fond blanc,
        // cartes blanches à bordure fine, sidebar orange plein, texte encre.
        base: {
          950: "#FFFFFF", // fond de page
          900: "#FFFFFF", // fond des cartes/topbar/modales
          800: "#F5F4F1", // fond des champs de saisie, zones survolées
          700: "#E7E4DC", // bordures
          600: "#D8D3C7", // bordures plus marquées / séparateurs
        },
        paper: "#211D17", // texte principal (encre foncée sur fond blanc)
        sidebar: {
          DEFAULT: "#E07B39", // orange plein de la sidebar (comme la maquette)
          dark: "#C1652A",
        },
        clay: {
          400: "#DDA05C",
          500: "#E07B39", // orange principal (boutons, accents)
          600: "#C1652A",
          700: "#96501F", // texte orange lisible sur fond clair
        },
        forest: {
          400: "#3E8F6F",
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
