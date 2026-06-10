export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        lav: {
          50:  "#F5F3FF",
          100: "#EEEDFE",
          200: "#CECBF6",
          300: "#AFA9EC",
          400: "#7F77DD",
          500: "#534AB7",
          600: "#3C3489",
          700: "#26215C",
        },
        surface: "#FDFCFF",
      },
      borderRadius: {
        xl:  "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
