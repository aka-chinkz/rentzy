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
        // Premium dark palette - near-black, charcoal, restrained
        background: "#000000",
        "background-secondary": "#0a0a0a",
        surface: "#131316",
        "surface-elevated": "#18181b",
        "surface-hover": "#1f1f23",
        border: "#27272a",
        "border-subtle": "#1f1f23",
        "text-primary": "#fafafa",
        "text-secondary": "#a1a1aa",
        "text-muted": "#71717a",
        // Restrained accent - soft blue/silver, no loud gradients
        "accent-primary": "#3b82f6",
        "accent-secondary": "#64748b",
        success: "#22c55e",
        warning: "#eab308",
        error: "#ef4444",
        // Aliases for compatibility
        "dark-primary": "#000000",
        "dark-secondary": "#131316",
        "dark-tertiary": "#18181b",
        "dark-border": "#27272a",
        "dark-muted": "#71717a",
        "background-tertiary": "#18181b",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "var(--font-outfit)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        "heading-tight": "-0.02em",
        "heading-wide": "0.02em",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        "glow-subtle": "0 0 24px rgba(59, 130, 246, 0.08)",
        "glow-sm": "0 0 12px rgba(59, 130, 246, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
