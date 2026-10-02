/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F5F0DE',
          50: '#FDFCF7',
          100: '#FAF8EE',
          200: '#F5F0DE',
          300: '#EDE4C3',
          400: '#E5D8A8',
        },
        sage: {
          DEFAULT: '#C7D6AE',
          50: '#F0F4EB',
          100: '#E3EBD8',
          200: '#D5E1C4',
          300: '#C7D6AE',
          400: '#B7CAA0',
          500: '#9FB88A',
          600: '#87A574',
          700: '#6F8D5E',
          800: '#5A7349',
          900: '#455835',
        },
        dark: {
          DEFAULT: '#111111',
          50: '#55584D',
          100: '#3A3D34',
          200: '#2A2D24',
          300: '#1A1D14',
          400: '#111111',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },
    },
  },
  plugins: [],
};
