/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        base: '#F5F5F7',
        card: '#FFFFFF',
        ink: '#1D1D1F',
        muted: '#6E6E73',
        line: '#E5E5EA',
        accent: {
          DEFAULT: '#0071E3',
          dark: '#0058B0'
        },
        success: '#34C759',
        danger: '#FF3B30',
        warning: '#FF9500',
        purple: '#5E5CE6',
        teal: '#30B0C7'
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        pop: '0 4px 14px rgba(0,113,227,0.28)'
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
}
