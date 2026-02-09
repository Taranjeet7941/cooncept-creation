import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'safety-orange': '#FF6600',
        'electric-blue': '#0066FF',
        'electric-blue-dark': '#0052FF',
        'blue-dark': '#003D82',
        'light-gray': '#EAEAEA',
        'dark-gray': '#333333',
        'deep-black': '#0D0D0D',
        'off-white': '#EDEDED',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config