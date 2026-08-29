import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", ".dark"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        elevated: "rgb(var(--color-elevated) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        fg: "rgb(var(--color-fg) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          fg: "rgb(var(--color-primary-fg) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          fg: "rgb(var(--color-accent-fg) / <alpha-value>)",
        },
        stage: "rgb(var(--color-stage) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
        display: ["var(--font-script)", "cursive"],
        blaka: ["var(--font-blaka)", "serif"],
        cabin: ["var(--font-cabin)", "sans-serif"],
        bebas: ["var(--font-bebas)", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        pill: "999px",
      },
      maxWidth: {
        page: "1360px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up .6s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
