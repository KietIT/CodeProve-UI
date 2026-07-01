import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand tokens - driven by CSS variables so the theme toggle works.
        bg: "rgb(var(--bg) / <alpha-value>)",
        "bg-soft": "rgb(var(--bg-soft) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        content: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        // Legacy accent aliases now follow the blue theme (light/dark switchable).
        teal: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          300: "rgb(var(--inverse-primary) / <alpha-value>)",
          400: "rgb(var(--primary) / <alpha-value>)",
          500: "rgb(var(--primary-container) / <alpha-value>)",
        },
        glowblue: "rgb(var(--primary-container) / <alpha-value>)",
        glowviolet: "rgb(var(--secondary-container) / <alpha-value>)",

        // ── Iceberg (light) / Obsidian (dark) - switchable via CSS variables ──
        background: "rgb(var(--background) / <alpha-value>)",
        "on-background": "rgb(var(--on-surface) / <alpha-value>)",
        "surface-dim": "rgb(var(--surface-dim) / <alpha-value>)",
        "surface-bright": "rgb(var(--surface-bright) / <alpha-value>)",
        "surface-container-lowest": "rgb(var(--surface-container-lowest) / <alpha-value>)",
        "surface-container-low": "rgb(var(--surface-container-low) / <alpha-value>)",
        "surface-container": "rgb(var(--surface-container) / <alpha-value>)",
        "surface-container-high": "rgb(var(--surface-container-high) / <alpha-value>)",
        "surface-container-highest": "rgb(var(--surface-container-highest) / <alpha-value>)",
        "surface-variant": "rgb(var(--surface-variant) / <alpha-value>)",
        "on-surface": "rgb(var(--on-surface) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--on-surface-variant) / <alpha-value>)",
        outline: "rgb(var(--outline) / <alpha-value>)",
        "outline-variant": "rgb(var(--outline-variant) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        "on-primary": "rgb(var(--on-primary) / <alpha-value>)",
        "primary-container": "rgb(var(--primary-container) / <alpha-value>)",
        "on-primary-container": "rgb(var(--on-primary-container) / <alpha-value>)",
        "inverse-primary": "rgb(var(--inverse-primary) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        "on-secondary": "rgb(var(--on-secondary) / <alpha-value>)",
        "secondary-container": "rgb(var(--secondary-container) / <alpha-value>)",
        "on-secondary-container": "rgb(var(--on-secondary-container) / <alpha-value>)",
        tertiary: "rgb(var(--tertiary) / <alpha-value>)",
        "on-tertiary": "rgb(var(--on-tertiary) / <alpha-value>)",
        "tertiary-container": "rgb(var(--tertiary-container) / <alpha-value>)",
        error: "rgb(var(--error) / <alpha-value>)",
        "on-error": "rgb(var(--on-error) / <alpha-value>)",
        "error-container": "rgb(var(--error-container) / <alpha-value>)",
        "on-error-container": "rgb(var(--on-error-container) / <alpha-value>)",
        "inverse-surface": "rgb(var(--inverse-surface) / <alpha-value>)",
        "inverse-on-surface": "rgb(var(--inverse-on-surface) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        // Cyber-Industrial type engines
        geist: ["var(--font-geist)", "var(--font-inter)", "system-ui", "sans-serif"],
        "display-lg": ["var(--font-geist)", "system-ui", "sans-serif"],
        "headline-xl": ["var(--font-geist)", "system-ui", "sans-serif"],
        "headline-lg": ["var(--font-geist)", "system-ui", "sans-serif"],
        "headline-md": ["var(--font-geist)", "system-ui", "sans-serif"],
        "headline-lg-mobile": ["var(--font-geist)", "system-ui", "sans-serif"],
        "body-lg": ["var(--font-geist)", "system-ui", "sans-serif"],
        "body-md": ["var(--font-geist)", "system-ui", "sans-serif"],
        "label-caps": ["var(--font-geist)", "system-ui", "sans-serif"],
        "label-md": ["var(--font-mono)", "ui-monospace", "monospace"],
        "label-sm": ["var(--font-mono)", "ui-monospace", "monospace"],
        "label-mono": ["var(--font-mono)", "ui-monospace", "monospace"],
        "code-sm": ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      spacing: {
        base: "4px",
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "40px",
        gutter: "24px",
        margin: "32px",
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "800" }],
        "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "1.2", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "500" }],
        "label-sm": ["12px", { lineHeight: "1.2", letterSpacing: "0.1em", fontWeight: "500" }],
        "code-sm": ["12px", { lineHeight: "1.4", fontWeight: "400" }],
        // Iceberg / Obsidian typography scale
        "headline-xl": ["48px", { lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "700" }],
        "headline-lg-mobile": ["24px", { lineHeight: "1.2", fontWeight: "600" }],
        "label-caps": ["12px", { lineHeight: "1", letterSpacing: "0.1em", fontWeight: "700" }],
        "label-mono": ["13px", { lineHeight: "1.4", letterSpacing: "0.05em", fontWeight: "500" }],
      },
      borderRadius: {
        card: "22px",
        pill: "12px",
      },
      maxWidth: {
        site: "1200px",
        "container-max": "1440px",
      },
      boxShadow: {
        glow: "0 0 60px -12px rgba(62, 212, 197, 0.45)",
        card: "0 18px 50px -24px rgba(0, 0, 0, 0.7)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
