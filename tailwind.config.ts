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
        ink: "#0B0D12",
        panel: "#12151C",
        panel2: "#1A1E27",
        line: "#262B36",
        text: "#E7E9EE",
        muted: "#8A93A3",
        accent: {
          DEFAULT: "#F2B33D",
          dim: "#8A6A2A",
        },
        signal: {
          DEFAULT: "#33E0C2",
          dim: "#1F7A6C",
        },
        danger: "#F2555A",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        data: ["var(--font-data)", "IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(242,179,61,0.15), 0 0 24px rgba(242,179,61,0.08)",
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
