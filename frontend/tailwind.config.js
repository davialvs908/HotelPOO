/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        coral: {
          DEFAULT: '#FF385C',
          hover: '#E00B41',
        },
        tinta: {
          DEFAULT: '#222222',
          suave: '#717171',
        },
        mar: {
          950: '#222222',
          900: '#222222',
          800: '#222222',
          700: '#717171',
          600: '#717171',
          100: '#EBEBEB',
        },
        areia: {
          50: '#FFFFFF',
          100: '#F7F7F7',
          200: '#DDDDDD',
          300: '#B0B0B0',
          400: '#FF385C',
          500: '#E00B41',
          600: '#E00B41',
        },
      },
      boxShadow: {
        cartao: '0 6px 16px rgba(0, 0, 0, 0.12)',
        pill: '0 3px 12px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
