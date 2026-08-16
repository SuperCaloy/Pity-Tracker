// tailwind.config.ts - Tailwind configuration and design tokens
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        surface: 'hsl(var(--surface))',
        'surface-border': 'hsl(var(--surface-border))',
        accent: 'hsl(var(--accent))',
        'accent-fg': 'hsl(var(--accent-fg))',
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)'],
        display: ['var(--font-space-grotesk)'],
        mono: ['var(--font-jetbrains-mono)'],
      },
      boxShadow: {
        'glow': '0 0 40px -10px hsl(var(--accent) / 0.4)',
        'core': 'inset 0 1px 1px 0 rgba(255,255,255,0.1), 0 4px 20px -5px rgba(0,0,0,0.5)',
      },
      transitionTimingFunction: {
        'awwwards': 'cubic-bezier(0.32, 0.72, 0, 1)',
      }
    },
  },
  plugins: [],
}

export default config
