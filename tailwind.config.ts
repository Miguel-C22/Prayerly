import type { Config } from "tailwindcss";

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        backgrounds: {
          lavender: "var(--bg-lavender)",
          grayLight: "var(--bg-gray-light)",
          light: "var(--bg-light)",
          darkBlue: "#1a2c53",
          veryLight: "var(--bg-very-light)",
          white: "var(--bg-white)",
        },
        text: {
          purplePrimary: "var(--text-purple)",
          grayPrimary: "var(--text-primary)",
          graySecondary: "var(--text-secondary)",
        },
        border: {
          gray: "var(--border-gray)",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("daisyui")],
  daisyui: {
    themes: ["light", "dark"],
    darkTheme: "light",
    base: true,
    styled: true,
    utils: true,
  },
} satisfies Config;
