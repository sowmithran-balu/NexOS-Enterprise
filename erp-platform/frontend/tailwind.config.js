export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#60A5FA',
        accent: '#93C5FD',
      },
      boxShadow: {
        glass: '0 0 40px rgba(0, 0, 0, 0.35)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translateX(-10%)' },
          '50%': { transform: 'translateX(10%)' },
        },
        fogDrift: {
          '0%, 100%': { transform: 'translateX(-20%)' },
          '50%': { transform: 'translateX(20%)' },
        },
        starPulse: {
          '0%, 100%': { opacity: '0.25', transform: 'scale(0.92)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
      },
      animation: {
        drift: 'drift 110s linear infinite',
        fogDrift: 'fogDrift 24s ease-in-out infinite',
        starPulse: 'starPulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
