export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#60A5FA',
        navy: '#10163A',
        navy2: '#1B2456',
        navy3: '#232C63',
        accent: '#12A594',
        'accent-dark': '#0B7A6E',
        'accent-tint': '#E4F7F4',
        warm: '#E2662F',
        credit: '#2E9E5B',
        bg: '#F3F5F9',
        surface: '#FFFFFF',
        border: '#E1E5EC',
        text: '#161B33',
        'text-2': '#5B6178',
        'text-muted': '#9298AC',
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
