/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './preview.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          base: '#0B0E14',
        },
        surface: {
          card: '#151B26',
          elevated: '#1F2736',
          border: '#273142',
        },
        risk: {
          critical: '#FF6B6B',
          high: '#FF922B',
          medium: '#FCC419',
          safe: '#51CF66',
          info: '#4DABF7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
