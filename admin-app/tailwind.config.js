/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0b0c1e', // Rich deep navy blue
        glassBg: 'rgba(255, 255, 255, 0.08)',
        glassBorder: 'rgba(255, 255, 255, 0.12)',
        glassBgDark: 'rgba(0, 0, 0, 0.3)',
        accentPurple: '#8b5cf6',
        accentNavy: '#1e1b4b',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
