/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        desert: {
          dark: '#140c08',
          charcoal: '#1a1412',
          adobe: '#381e14',
          rust: '#7c2d12',
          orange: '#c2410c',
          sun: '#ea580c',
          amber: '#f59e0b',
          gold: '#eab308',
          sand: '#fef3c7',
          bone: '#faf8f5',
          blood: '#991b1b',
        }
      },
      fontFamily: {
        rye: ['Rye', 'serif'],
        sancreek: ['Sancreek', 'cursive'],
        mono: ['"Courier Prime"', 'Courier', 'monospace'],
        display: ['Rye', 'serif'],
      },
      keyframes: {
        tumble: {
          '0%': { transform: 'translateX(-20%) rotate(0deg)' },
          '100%': { transform: 'translateX(120%) rotate(720deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        heatwave: {
          '0%, 100%': { transform: 'skewX(0deg) scale(1)' },
          '25%': { transform: 'skewX(1.2deg) scale(1.01)' },
          '75%': { transform: 'skewX(-1.2deg) scale(0.99)' },
        }
      },
      animation: {
        tumble: 'tumble 6s linear infinite',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        heatwave: 'heatwave 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

