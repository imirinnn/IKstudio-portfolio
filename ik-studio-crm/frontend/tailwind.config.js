/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
    extend: {
      colors: {
        ink: { DEFAULT: '#0F1012', 2: '#16171A', 3: '#1E2024', line: '#2A2C31' },
        paper: { DEFAULT: '#EEEFF1', 2: '#E4E6EA', 3: '#D8DBE0' },
        steel: '#6B7079',
        mist: '#A6AAB2',
        sky: '#A9B8FF',   // Irin / frontend marker
        rose: '#E8A4A0',  // Kaviya / backend marker
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      maxWidth: { site: '1320px' },
      transitionTimingFunction: { out: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      letterSpacing: { label: '0.14em' },
    },
  },
  plugins: [],
};
