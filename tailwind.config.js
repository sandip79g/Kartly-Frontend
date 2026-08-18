/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1F3A",
          light: "#132C52",
          dark: "#081527",
        },
        amber: {
          DEFAULT: "#F5A623",
          dark: "#D88B0F",
        },
        teal: {
          DEFAULT: "#0FA3A3",
        },
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
