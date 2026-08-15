// tailwind.config.ts - Tailwind configuration and design tokens
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#13121A',
        surface: '#1E1D2A',
        'surface-raised': '#282738',
        chalk: '#EDEAE3',
        muted: '#8D8A9C',
        gold: '#F0B429',
        jade: '#35C58A',
        amethyst: '#9C7CF4',
      },
    },
  },
  plugins: [],
}
export default config
