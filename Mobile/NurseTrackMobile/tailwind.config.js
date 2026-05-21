/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        maroon: '#8A252C',
        maroonDark: '#681920',
        maroonPanel: '#982a32',
        citGold: '#FFCF01',
        ink: '#202124',
      },
    },
  },
  plugins: [],
};
