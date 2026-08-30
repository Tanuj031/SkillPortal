/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './client/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0F2E5C',
        'primary-container': '#1B365D',
        'primary-fixed': '#D6E3FF',
        'secondary': '#006A6A',
        'secondary-container': '#90EFEF',
        'accent': '#F5A623',
        'accent-hover': '#D98E18',
        'surface': '#F8FAFC',
        'surface-bright': '#F7F9FB',
        'surface-container-low': '#F2F4F6',
        'surface-container-lowest': '#FFFFFF',
        'outline-variant': '#C4C6CF',
        'on-surface': '#191C1E',
        'on-surface-variant': '#44474E',
        'error': '#BA1A1A',
        'error-container': '#FFDAD6',
      },
    },
  },
  plugins: [],
};
