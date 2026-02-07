import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        surface: "#12121a",
        "surface-elevated": "#1a1a24",
        border: "#2a2a3a",
        "text-primary": "#ffffff",
        "text-secondary": "#9ca3af",
        "text-muted": "#6b7280",
        "accent-primary": "#8b5cf6",
        "accent-secondary": "#06b6d4",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        // Aliases so inputs/buttons/cards have visible text
        "dark-tertiary": "#1a1a24",
        "dark-border": "#2a2a3a",
        "dark-muted": "#6b7280",
        "dark-secondary": "#12121a",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "var(--font-outfit)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
