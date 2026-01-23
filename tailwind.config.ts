import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: '#f7f3ef',
        card: '#fdfaf7',
        stroke: '#d9d5d1',
        muted: '#8a8a8a',
        text: '#2f2f2f',
        accent: '#bdbdbd',
        'card-muted': '#ece7e3',
        'btn-bg': '#f4f1ee',
        'footer-bg': '#f1ede9',
        'progress-bg': '#e6e2df',
        'progress-fill': '#bcbcbc',
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
