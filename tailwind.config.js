/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        stage: {
          pending: '#1e293b',
          running: '#3b82f6',
          done: '#10b981',
          error: '#ef4444',
        },
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
