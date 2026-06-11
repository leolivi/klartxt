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
        primary: "var(--color-primary)",
        "primary-50": "var(--color-primary-50)",
        "primary-100": "var(--color-primary-100)",
        "primary-300": "var(--color-primary-300)",
        "primary-800": "var(--color-primary-800)",
        "primary-950": "var(--color-primary-950)",
        bg: {
          DEFAULT: "var(--color-bg)",
        },
        text: {
          DEFAULT: "var(--color-text)",
          muted:   "var(--color-text-muted)",
        },
        border: "var(--color-border)",
        btn: {
          bg:         "var(--color-btn-bg)",
          "bg-hover": "var(--color-btn-bg-hover)",
          border:     "var(--color-btn-border)",
        },
        risk: {
          high: {
            fill:   "var(--color-risk-high-fill)",
            border: "var(--color-risk-high-border)",
            text:   "var(--color-risk-high-text)",
          },
          medium: {
            fill:   "var(--color-risk-medium-fill)",
            border: "var(--color-risk-medium-border)",
            text:   "var(--color-risk-medium-text)",
          },
          low: {
            fill:   "var(--color-risk-low-fill)",
            border: "var(--color-risk-low-border)",
            text:   "var(--color-risk-low-text)",
          },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};