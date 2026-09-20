import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { colors, fontFamily, spacing, fontSize, borderRadius, maxWidth, boxShadow, themeVariables } from "./lib/theme/tokens";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors, fontFamily, spacing, fontSize, borderRadius, maxWidth, boxShadow,
      keyframes: {
  "fade-up": {
    "0%": {
      "opacity": "0",
      "transform": "translateY(16px)"
    },
    "100%": {
      "opacity": "1",
      "transform": "translateY(0)"
    }
  },
  "float": {
    "0%, 100%": {
      "transform": "translateY(0)"
    },
    "50%": {
      "transform": "translateY(-10px)"
    }
  },
  "pulse-glow": {
    "0%, 100%": {
      "opacity": "0.6"
    },
    "50%": {
      "opacity": "1"
    }
  },
  "marquee": {
    "0%": {
      "transform": "translateX(0)"
    },
    "100%": {
      "transform": "translateX(-50%)"
    }
  }
},
      animation: {
  "fade-up": "fade-up 0.6s ease-out both",
  "float": "float 6s ease-in-out infinite",
  "pulse-glow": "pulse-glow 4s ease-in-out infinite",
  "marquee": "marquee 28s linear infinite"
},
    },
  },
  plugins: [plugin(({ addBase }) => addBase(themeVariables))],
};

export default config;
