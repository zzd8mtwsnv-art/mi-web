/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#007AFF',
          purple: '#AF52DE',
          indigo: '#5856D6',
          pink: '#FF2D55',
          teal: '#30B0C7',
          cyan: '#32ADE6',
          green: '#34C759',
          orange: '#FF9500',
          red: '#FF3B30',
          yellow: '#FFCC00',
          mint: '#00C7BE',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.65)',
          lightBorder: 'rgba(255, 255, 255, 0.45)',
          lightHover: 'rgba(255, 255, 255, 0.85)',
          dark: 'rgba(18, 24, 38, 0.65)',
          darkBorder: 'rgba(255, 255, 255, 0.08)',
          darkHover: 'rgba(30, 41, 59, 0.75)',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.12)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.25)',
        'glow-sm': '0 0 15px rgba(99, 102, 241, 0.25)',
        'glow-lg': '0 0 35px rgba(99, 102, 241, 0.35)',
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '24px',
        '3xl': '32px',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
