/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
        },
        "on-primary": "hsl(var(--on-primary))",
        "on-primary-fixed": "hsl(var(--on-primary-fixed))",
        "primary-fixed": "hsl(var(--primary-fixed))",
        "primary-fixed-dim": "hsl(var(--primary-fixed-dim))",
        "on-secondary": "hsl(var(--on-secondary))",
        "on-surface-variant": "hsl(var(--on-surface-variant))",
        "outline-custom": "hsl(var(--outline-custom))",
        "outline-variant": "hsl(var(--outline-variant))",
        "dark-border": "hsl(var(--dark-border))",
        "dark-surface": "hsl(var(--dark-surface))",
        "dark-bg": "hsl(var(--dark-bg))",
        "light-surface": "hsl(var(--light-surface))",
        "light-subtle": "hsl(var(--light-subtle))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "0.75rem",
        "2xl": "1rem",
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        heading: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
      },
      fontSize: {
        "display-lg": ["64px", { lineHeight: "72px", letterSpacing: "-0.04em", fontWeight: "700" }],
        "headline-xl": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "600" }],
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "500" }],
        mono: ["14px", { lineHeight: "20px", fontWeight: "400" }],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px hsla(262, 83%, 58%, 0.05), 0 0 3px hsla(0, 0%, 0%, 0.02)',
        'glow': '0 0 24px -4px hsla(262, 83%, 58%, 0.15)',
        'glow-lg': '0 0 40px -8px hsla(262, 83%, 58%, 0.2)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "aurora": {
          "0%, 100%": { transform: "translate3d(0,0,0) rotate(0deg) scale(1)" },
          "50%": { transform: "translate3d(2%, -2%, 0) rotate(8deg) scale(1.05)" },
        },
        "wb-rise": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "wb-fade": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "wb-pop": {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "aurora": "aurora 18s ease-in-out infinite",
        "wb-rise": "wb-rise 0.45s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        "wb-fade": "wb-fade 0.5s ease-out both",
        "wb-pop": "wb-pop 0.35s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        "gradient-pan": "gradient-pan 6s ease-in-out infinite",
      },
      backgroundImage: {
        "wb-aurora":
          "radial-gradient(60% 50% at 20% 0%, hsl(var(--primary) / 0.35), transparent 60%), radial-gradient(50% 40% at 90% 10%, hsl(199 89% 60% / 0.25), transparent 60%), radial-gradient(40% 40% at 50% 100%, hsl(326 78% 60% / 0.22), transparent 60%)",
      },
    },
  },
  plugins: [],
};
