/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#06070d",
          card: "rgba(13, 16, 28, 0.5)",
          border: "rgba(255, 255, 255, 0.08)",
          text: "#f3f4f6",
          primary: "#8b5cf6",
          secondary: "#ec4899",
          accent: "#06b6d4",
          glow: "#a78bfa"
        }
      },
      fontFamily: {
        cyber: ["Orbitron", "sans-serif"],
        sans: ["Inter", "sans-serif"]
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 5px rgba(139, 92, 246, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.8))' }
        }
      }
    },
  },
  plugins: [],
}
