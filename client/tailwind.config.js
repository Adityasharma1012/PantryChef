/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FAF7F2",
          100: "#F5EFE6",
          200: "#EBDDCF",
          300: "#DEC8B5",
        },
        espresso: {
          900: "#1E1510",
          800: "#2B1E16",
          700: "#453326",
          600: "#634B39",
          500: "#856952",
          400: "#A98E75",
          200: "#DAC9B8",
          100: "#F0E7DD",
        },
        paprika: {
          50: "#FCF3F0",
          100: "#F9E4DD",
          200: "#F3C5B5",
          500: "#CE3E22",
          600: "#B23117",
          700: "#94250F",
        },
        saffron: {
          50: "#FEF9EC",
          100: "#FDF0D0",
          200: "#FAE09D",
          500: "#C97A00",
          600: "#A86200",
          700: "#854A00",
        },
        basil: {
          50: "#F0F7F3",
          100: "#D9ECE0",
          200: "#B4DCC3",
          500: "#2D6A4F",
          600: "#23553E",
          700: "#1A412F",
        },
        terracotta: {
          50: "#FAF3F0",
          100: "#F4E3DD",
          500: "#B85D3B",
          600: "#9C4C2E",
        },
      },
      fontFamily: {
        serif: [
          "Fraunces",
          "Playfair Display",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        warm: "0 4px 20px -2px rgba(43, 30, 22, 0.08)",
        card: "0 2px 12px -2px rgba(43, 30, 22, 0.06), 0 1px 3px rgba(43, 30, 22, 0.04)",
        floating: "0 10px 30px -4px rgba(43, 30, 22, 0.12)",
      },
      minHeight: {
        tap: "44px",
      },
      minWidth: {
        tap: "44px",
      },
    },
  },
  plugins: [],
};
