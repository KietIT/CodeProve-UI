import type { Config } from "tailwindcss";

/** Brand, status, illustration and external-brand colors: edit only here. */
export const palette = {
  "background": "#070b0f",
  "accent": "#3ed4c5",
  "onAccent": "#04211e",
  "accentLight": "#aef7ef",
  "accentInk": "#0f766e",
  "warning": "#fb923c",
  "warningInk": "#9a3412",
  "danger": "#f87171",
  "dangerInk": "#b91c1c",
  "white": "#ffffff",
  "black": "#000000",
  "blue": "#0055ff",
  "blueInk": "#0041c8",
  "blueHover": "#004dea",
  "blueLight": "#6ea8ff",
  "cyan": "#3ad8ff",
  "cyanBright": "#00f1fe",
  "cyanInk": "#00b6d4",
  "violet": "#6c63ff",
  "azure": "#2e87f0",
  "mintWhite": "#eafffb",
  "mintLight": "#7ee5da",
  "muted": "#93a0b0",
  "grid": "#303946",
  "googleBlue": "#4285f4",
  "googleGreen": "#34a853",
  "googleYellow": "#fbbc05",
  "googleRed": "#ea4335",
  "windowGreen": "#28c840",
  "windowYellow": "#febc2e",
  "windowRed": "#ff5f57",
  "codeRed": "#ff7b72",
  "codeGreen": "#7ee787",
  "previewDark": "#0a0f14",
  "previewLight": "#f8fbff",
  "previewBorder": "#cdd8ea",
  "previewSoft": "#eef4ff",
  "previewWash": "#edf4ff",
  "previewMint": "#d9f6f2",
  "previewMuted": "#526178",
  "previewFaint": "#8492a8",
  "previewDim": "#718096",
  "previewText": "#162033",
  "previewViolet": "#6d28d9",
  "previewWarning": "#b45309",
  "previewWarningSoft": "#fff3d6",
  "previewDanger": "#dc2626",
  "previewSuccess": "#15803d",
  "obsidian": "#101415",
  "brainShell": "#dce8ff",
  "gimbalDark": "#0c1722",
  "brainBlue": "#2f6bd6",
  "brainBlueDeep": "#0a3fc0",
  "brainIndigo": "#5132c4",
  "shellInk": "#3a5fc8",
  "glowInk": "#2a4fc0",
  "wireInk": "#2a52c0",
  "synapseInk": "#1f48b8",
  "coreInk": "#16308f",
  "coreEmissiveInk": "#0033d6",
  "haloInk": "#2a54c8",
  "gimbalInk": "#16357f",
  "nodeInk": "#13308f",
  "nodeHaloInk": "#3358c0",
  "sparkleInk": "#2f5fd0",
  "frontLight": "#cdeffe",
  "circuitTrace": "#5a8bff",
  "circuitPad": "#cfe2ff"
} as const;

const channels = (hex: string) => hex.slice(1).match(/../g)!.map(value => parseInt(value, 16)).join(" ");
export const withAlpha = (hex: string, alpha: number) => `rgb(${channels(hex)} / ${alpha})`;

export const themes = {
  "dark": {
    "bg": channels(palette.background),
    "bg-soft": "25 28 30",
    "surface": "29 32 34",
    "border": "67 70 86",
    "text": "224 227 229",
    "muted": "195 197 217",
    "background": channels(palette.background),
    "surface-dim": channels(palette.background),
    "surface-bright": "54 58 59",
    "surface-container-lowest": "11 15 16",
    "surface-container-low": "25 28 30",
    "surface-container": "29 32 34",
    "surface-container-high": "39 42 44",
    "surface-container-highest": "50 53 55",
    "surface-variant": "50 53 55",
    "on-surface": "224 227 229",
    "on-surface-variant": "195 197 217",
    "outline": "141 144 162",
    "outline-variant": "67 70 86",
    "primary": channels(palette.accent),
    "on-primary": channels(palette.onAccent),
    "primary-container": channels(palette.accent),
    "on-primary-container": channels(palette.onAccent),
    "inverse-primary": channels(palette.accentLight),
    "secondary": "221 252 255",
    "on-secondary": "0 54 58",
    "secondary-container": "0 241 254",
    "on-secondary-container": "0 106 112",
    "tertiary": "194 199 206",
    "on-tertiary": "44 49 55",
    "tertiary-container": "99 104 110",
    "error": "255 180 171",
    "on-error": "105 0 5",
    "error-container": "147 0 10",
    "on-error-container": "255 218 214",
    "inverse-surface": "224 227 229",
    "inverse-on-surface": "45 49 51",
    "warning": channels(palette.warning),
    "danger": channels(palette.danger),
    "success": channels(palette.accent)
  },
  "light": {
    "bg": "250 248 255",
    "bg-soft": "242 243 255",
    "surface": "234 237 255",
    "border": "195 197 217",
    "text": "21 27 45",
    "muted": "67 70 86",
    "background": "250 248 255",
    "surface-dim": "212 217 242",
    "surface-bright": "250 248 255",
    "surface-container-lowest": "255 255 255",
    "surface-container-low": "242 243 255",
    "surface-container": "234 237 255",
    "surface-container-high": "227 231 255",
    "surface-container-highest": "220 225 251",
    "surface-variant": "220 225 251",
    "on-surface": "21 27 45",
    "on-surface-variant": "67 70 86",
    "outline": "115 118 136",
    "outline-variant": "195 197 217",
    "primary": channels(palette.accentInk),
    "on-primary": channels(palette.white),
    "primary-container": channels(palette.accentInk),
    "on-primary-container": channels(palette.white),
    "inverse-primary": channels(palette.accentInk),
    "secondary": "46 99 133",
    "on-secondary": "255 255 255",
    "secondary-container": "165 216 255",
    "on-secondary-container": "40 95 128",
    "tertiary": "72 81 86",
    "on-tertiary": "255 255 255",
    "tertiary-container": "96 105 110",
    "error": "186 26 26",
    "on-error": "255 255 255",
    "error-container": "255 218 214",
    "on-error-container": "147 0 10",
    "inverse-surface": "42 48 67",
    "inverse-on-surface": "238 240 255",
    "warning": channels(palette.warningInk),
    "danger": channels(palette.dangerInk),
    "success": channels(palette.accentInk)
  }
} as const;

export const themeVariables = {
  ":root, .dark": {
    ...Object.fromEntries(Object.entries(palette).map(([key, value]) => [`--color-${key}`, channels(value)])),
    ...Object.fromEntries(Object.entries(themes.dark).map(([key, value]) => [`--${key}`, value])),
  },
  ".light": Object.fromEntries(Object.entries(themes.light).map(([key, value]) => [`--${key}`, value])),
};

export const colors = {
  "bg": "rgb(var(--bg) / <alpha-value>)",
  "bg-soft": "rgb(var(--bg-soft) / <alpha-value>)",
  "surface": "rgb(var(--surface) / <alpha-value>)",
  "border": "rgb(var(--border) / <alpha-value>)",
  "content": "rgb(var(--text) / <alpha-value>)",
  "muted": "rgb(var(--muted) / <alpha-value>)",
  "teal": {
    "300": "rgb(var(--inverse-primary) / <alpha-value>)",
    "400": "rgb(var(--primary) / <alpha-value>)",
    "500": "rgb(var(--primary-container) / <alpha-value>)",
    "DEFAULT": "rgb(var(--primary) / <alpha-value>)"
  },
  "glowblue": "rgb(var(--primary-container) / <alpha-value>)",
  "glowviolet": "rgb(var(--secondary-container) / <alpha-value>)",
  "background": "rgb(var(--background) / <alpha-value>)",
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
  "outline": "rgb(var(--outline) / <alpha-value>)",
  "outline-variant": "rgb(var(--outline-variant) / <alpha-value>)",
  "primary": "rgb(var(--primary) / <alpha-value>)",
  "on-primary": "rgb(var(--on-primary) / <alpha-value>)",
  "primary-container": "rgb(var(--primary-container) / <alpha-value>)",
  "on-primary-container": "rgb(var(--on-primary-container) / <alpha-value>)",
  "inverse-primary": "rgb(var(--inverse-primary) / <alpha-value>)",
  "secondary": "rgb(var(--secondary) / <alpha-value>)",
  "on-secondary": "rgb(var(--on-secondary) / <alpha-value>)",
  "secondary-container": "rgb(var(--secondary-container) / <alpha-value>)",
  "on-secondary-container": "rgb(var(--on-secondary-container) / <alpha-value>)",
  "tertiary": "rgb(var(--tertiary) / <alpha-value>)",
  "on-tertiary": "rgb(var(--on-tertiary) / <alpha-value>)",
  "tertiary-container": "rgb(var(--tertiary-container) / <alpha-value>)",
  "error": "rgb(var(--error) / <alpha-value>)",
  "on-error": "rgb(var(--on-error) / <alpha-value>)",
  "error-container": "rgb(var(--error-container) / <alpha-value>)",
  "on-error-container": "rgb(var(--on-error-container) / <alpha-value>)",
  "inverse-surface": "rgb(var(--inverse-surface) / <alpha-value>)",
  "inverse-on-surface": "rgb(var(--inverse-on-surface) / <alpha-value>)",
  "accent": "rgb(var(--primary) / <alpha-value>)",
  "on-accent": "rgb(var(--on-primary) / <alpha-value>)",
  "warning": "rgb(var(--warning) / <alpha-value>)",
  "danger": "rgb(var(--danger) / <alpha-value>)",
  "success": "rgb(var(--success) / <alpha-value>)",
  "art": {
    "background": "rgb(var(--color-background) / <alpha-value>)",
    "accent": "rgb(var(--color-accent) / <alpha-value>)",
    "onAccent": "rgb(var(--color-onAccent) / <alpha-value>)",
    "accentLight": "rgb(var(--color-accentLight) / <alpha-value>)",
    "accentInk": "rgb(var(--color-accentInk) / <alpha-value>)",
    "warning": "rgb(var(--color-warning) / <alpha-value>)",
    "warningInk": "rgb(var(--color-warningInk) / <alpha-value>)",
    "danger": "rgb(var(--color-danger) / <alpha-value>)",
    "dangerInk": "rgb(var(--color-dangerInk) / <alpha-value>)",
    "white": "rgb(var(--color-white) / <alpha-value>)",
    "black": "rgb(var(--color-black) / <alpha-value>)",
    "blue": "rgb(var(--color-blue) / <alpha-value>)",
    "blueInk": "rgb(var(--color-blueInk) / <alpha-value>)",
    "blueHover": "rgb(var(--color-blueHover) / <alpha-value>)",
    "blueLight": "rgb(var(--color-blueLight) / <alpha-value>)",
    "cyan": "rgb(var(--color-cyan) / <alpha-value>)",
    "cyanBright": "rgb(var(--color-cyanBright) / <alpha-value>)",
    "cyanInk": "rgb(var(--color-cyanInk) / <alpha-value>)",
    "violet": "rgb(var(--color-violet) / <alpha-value>)",
    "azure": "rgb(var(--color-azure) / <alpha-value>)",
    "mintWhite": "rgb(var(--color-mintWhite) / <alpha-value>)",
    "mintLight": "rgb(var(--color-mintLight) / <alpha-value>)",
    "muted": "rgb(var(--color-muted) / <alpha-value>)",
    "grid": "rgb(var(--color-grid) / <alpha-value>)",
    "googleBlue": "rgb(var(--color-googleBlue) / <alpha-value>)",
    "googleGreen": "rgb(var(--color-googleGreen) / <alpha-value>)",
    "googleYellow": "rgb(var(--color-googleYellow) / <alpha-value>)",
    "googleRed": "rgb(var(--color-googleRed) / <alpha-value>)",
    "windowGreen": "rgb(var(--color-windowGreen) / <alpha-value>)",
    "windowYellow": "rgb(var(--color-windowYellow) / <alpha-value>)",
    "windowRed": "rgb(var(--color-windowRed) / <alpha-value>)",
    "codeRed": "rgb(var(--color-codeRed) / <alpha-value>)",
    "codeGreen": "rgb(var(--color-codeGreen) / <alpha-value>)",
    "previewDark": "rgb(var(--color-previewDark) / <alpha-value>)",
    "previewLight": "rgb(var(--color-previewLight) / <alpha-value>)",
    "previewBorder": "rgb(var(--color-previewBorder) / <alpha-value>)",
    "previewSoft": "rgb(var(--color-previewSoft) / <alpha-value>)",
    "previewWash": "rgb(var(--color-previewWash) / <alpha-value>)",
    "previewMint": "rgb(var(--color-previewMint) / <alpha-value>)",
    "previewMuted": "rgb(var(--color-previewMuted) / <alpha-value>)",
    "previewFaint": "rgb(var(--color-previewFaint) / <alpha-value>)",
    "previewDim": "rgb(var(--color-previewDim) / <alpha-value>)",
    "previewText": "rgb(var(--color-previewText) / <alpha-value>)",
    "previewViolet": "rgb(var(--color-previewViolet) / <alpha-value>)",
    "previewWarning": "rgb(var(--color-previewWarning) / <alpha-value>)",
    "previewWarningSoft": "rgb(var(--color-previewWarningSoft) / <alpha-value>)",
    "previewDanger": "rgb(var(--color-previewDanger) / <alpha-value>)",
    "previewSuccess": "rgb(var(--color-previewSuccess) / <alpha-value>)",
    "obsidian": "rgb(var(--color-obsidian) / <alpha-value>)",
    "brainShell": "rgb(var(--color-brainShell) / <alpha-value>)",
    "gimbalDark": "rgb(var(--color-gimbalDark) / <alpha-value>)",
    "brainBlue": "rgb(var(--color-brainBlue) / <alpha-value>)",
    "brainBlueDeep": "rgb(var(--color-brainBlueDeep) / <alpha-value>)",
    "brainIndigo": "rgb(var(--color-brainIndigo) / <alpha-value>)",
    "shellInk": "rgb(var(--color-shellInk) / <alpha-value>)",
    "glowInk": "rgb(var(--color-glowInk) / <alpha-value>)",
    "wireInk": "rgb(var(--color-wireInk) / <alpha-value>)",
    "synapseInk": "rgb(var(--color-synapseInk) / <alpha-value>)",
    "coreInk": "rgb(var(--color-coreInk) / <alpha-value>)",
    "coreEmissiveInk": "rgb(var(--color-coreEmissiveInk) / <alpha-value>)",
    "haloInk": "rgb(var(--color-haloInk) / <alpha-value>)",
    "gimbalInk": "rgb(var(--color-gimbalInk) / <alpha-value>)",
    "nodeInk": "rgb(var(--color-nodeInk) / <alpha-value>)",
    "nodeHaloInk": "rgb(var(--color-nodeHaloInk) / <alpha-value>)",
    "sparkleInk": "rgb(var(--color-sparkleInk) / <alpha-value>)",
    "frontLight": "rgb(var(--color-frontLight) / <alpha-value>)",
    "circuitTrace": "rgb(var(--color-circuitTrace) / <alpha-value>)",
    "circuitPad": "rgb(var(--color-circuitPad) / <alpha-value>)"
  }
};

export const fontFamily = {
  "sans": [
    "var(--font-inter)",
    "system-ui",
    "sans-serif"
  ],
  "mono": [
    "var(--font-mono)",
    "system-ui",
    "sans-serif"
  ],
  "geist": [
    "var(--font-geist)",
    "var(--font-inter)",
    "system-ui",
    "sans-serif"
  ],
  "display-lg": [
    "var(--font-geist)",
    "system-ui",
    "sans-serif"
  ],
  "headline-xl": [
    "var(--font-geist)",
    "system-ui",
    "sans-serif"
  ],
  "headline-lg": [
    "var(--font-geist)",
    "system-ui",
    "sans-serif"
  ],
  "headline-md": [
    "var(--font-geist)",
    "system-ui",
    "sans-serif"
  ],
  "headline-lg-mobile": [
    "var(--font-geist)",
    "system-ui",
    "sans-serif"
  ],
  "body-lg": [
    "var(--font-geist)",
    "system-ui",
    "sans-serif"
  ],
  "body-md": [
    "var(--font-geist)",
    "system-ui",
    "sans-serif"
  ],
  "label-caps": [
    "var(--font-geist)",
    "system-ui",
    "sans-serif"
  ],
  "label-md": [
    "var(--font-mono)",
    "system-ui",
    "sans-serif"
  ],
  "label-sm": [
    "var(--font-mono)",
    "system-ui",
    "sans-serif"
  ],
  "label-mono": [
    "var(--font-mono)",
    "system-ui",
    "sans-serif"
  ],
  "code-sm": [
    "var(--font-mono)",
    "system-ui",
    "sans-serif"
  ]
};

export const spacing = {
  "base": "4px",
  "xs": "4px",
  "sm": "8px",
  "md": "16px",
  "lg": "24px",
  "xl": "40px",
  "gutter": "24px",
  "margin": "32px"
};

export const fontSize: NonNullable<Config["theme"]>["fontSize"] = {
  "display-lg": [
    "48px",
    {
      "lineHeight": "1.1",
      "letterSpacing": "-0.04em",
      "fontWeight": "800"
    }
  ],
  "headline-lg": [
    "32px",
    {
      "lineHeight": "1.2",
      "letterSpacing": "-0.02em",
      "fontWeight": "700"
    }
  ],
  "headline-md": [
    "24px",
    {
      "lineHeight": "1.2",
      "fontWeight": "700"
    }
  ],
  "body-lg": [
    "18px",
    {
      "lineHeight": "1.5",
      "fontWeight": "400"
    }
  ],
  "body-md": [
    "16px",
    {
      "lineHeight": "1.5",
      "fontWeight": "400"
    }
  ],
  "label-md": [
    "14px",
    {
      "lineHeight": "1.2",
      "letterSpacing": "0.05em",
      "fontWeight": "500"
    }
  ],
  "label-sm": [
    "12px",
    {
      "lineHeight": "1.2",
      "letterSpacing": "0.1em",
      "fontWeight": "500"
    }
  ],
  "code-sm": [
    "12px",
    {
      "lineHeight": "1.4",
      "fontWeight": "400"
    }
  ],
  "headline-xl": [
    "48px",
    {
      "lineHeight": "1.1",
      "letterSpacing": "-0.04em",
      "fontWeight": "700"
    }
  ],
  "headline-lg-mobile": [
    "24px",
    {
      "lineHeight": "1.2",
      "fontWeight": "600"
    }
  ],
  "label-caps": [
    "12px",
    {
      "lineHeight": "1",
      "letterSpacing": "0.1em",
      "fontWeight": "700"
    }
  ],
  "label-mono": [
    "13px",
    {
      "lineHeight": "1.4",
      "letterSpacing": "0.05em",
      "fontWeight": "500"
    }
  ]
};

export const borderRadius = {
  "card": "22px",
  "pill": "12px"
};
export const maxWidth = {
  "site": "1200px",
  "container-max": "1440px"
};
export const boxShadow = {
  "glow": "0 0 60px -12px rgb(var(--primary) / 0.45)",
  "card": "0 18px 50px -24px rgb(var(--color-black) / 0.7)",
  "button": "0 8px 30px -10px rgb(var(--primary) / 0.5)",
  "vivid": "0 10px 40px -8px rgb(var(--primary-container) / 0.65)"
};
