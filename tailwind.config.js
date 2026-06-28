import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./website/**/*.{js,ts,jsx,tsx,html}"],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
      },
      fontSize: {
        h1:        ["24px", { lineHeight: "1.2", fontWeight: "600" }],
        h2:        ["18px", { lineHeight: "1.3", fontWeight: "600" }],
        h3:        ["15px", { lineHeight: "1.4", fontWeight: "500" }],
        body:      ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        secondary: ["12px", { lineHeight: "1.4", fontWeight: "400" }],
        small:     ["11px", { lineHeight: "1.4", fontWeight: "400" }],
      },
      colors: {
        surface: {
          DEFAULT:   "var(--color-bg)",
          primary:   "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          tertiary:  "var(--color-bg-tertiary)",
          logo:      "var(--color-bg-logo)",
          red:       "var(--color-bg-red)",
          orange:    "var(--color-bg-orange)",
          green:     "var(--color-bg-green)",
        },
        ink: {
          default:   "var(--color-font-default)",
          strong:    "var(--color-font-strong)",
          strongest: "var(--color-font-strongest)",
          red:       "var(--color-font-red)",
          orange:    "var(--color-font-orange)",
          green:     "var(--color-font-green)",
        },
        text: {
          DEFAULT: "var(--color-text)",
          muted:   "var(--color-text-ink-default)",
        },
      },
      keyframes: {
        "appear-zoom": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "appear-zoom": "appear-zoom 0.5s ease-out forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};