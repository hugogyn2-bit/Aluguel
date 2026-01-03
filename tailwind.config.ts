import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B1020",
        surface: "#121A33",
        text: "#E8EAF6",
        muted: "#B6B9D6",
        primary: "#6D28D9",
        secondary: "#06B6D4",
        accent: "#F97316"
      },
      boxShadow: {
        glow: "0 10px 40px rgba(109, 40, 217, 0.25)"
      }
    }
  },
  plugins: []
} satisfies Config;
