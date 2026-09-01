import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        panel: "var(--color-panel)",
        panel2: "var(--color-panel2)",
        line: "var(--color-line)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        accent: {
          DEFAULT: "var(--color-accent)",
          dim: "var(--color-accent-dim)",
        },
        signal: {
          DEFAULT: "var(--color-signal)",
          dim: "var(--color-signal-dim)",
        },
        danger: "var(--color-danger)",
        free: "var(--color-free)",
        premium: "var(--color-premium)",
        "on-brand": "var(--color-on-brand)",
        overlay: "var(--color-overlay)",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "Plus Jakarta Sans", "Inter", "sans-serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "sans-serif"],
        data: ["var(--font-data)", "Plus Jakarta Sans", "Inter", "sans-serif"],
        display: ["var(--font-display)", "Plus Jakarta Sans", "sans-serif"],
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        "soft-lg": "var(--shadow-soft-lg)",
      },
      backdropBlur: {
        glass: "20px",
      },
      keyframes: {
        caret: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
      },
      animation: {
        caret: "caret 1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
