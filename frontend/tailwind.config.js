/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "DM Sans",
          "Inter",
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          DEFAULT: "#378ADD",
          50: "#F0F7FD",
          100: "#DAE9F8",
          200: "#B6D3F0",
          300: "#8EBAE8",
          400: "#5FA0DE",
          500: "#378ADD",
          600: "#2570BD",
          700: "#1F5A98",
          800: "#184674",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8F8F7",
          subtle: "#F1F2F0",
        },
        hair: "#E5E5E2",
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        full: "99px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};
