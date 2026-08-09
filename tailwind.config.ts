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
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "sans-serif"],
        data: ["var(--font-data)", "JetBrains Mono", "Fira Code", "monospace"],
        display: ["var(--font-display)", "Plus Jakarta Sans", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0,240,255,0.18), 0 0 24px rgba(0,240,255,0.12)",
        "glow-purple": "0 0 0 1px rgba(112,0,255,0.18), 0 0 24px rgba(112,0,255,0.12)",
      },
      backdropBlur: {
        glass: "16px",
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
