import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
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
          lavender: "#f3e8ff", // bg-lavender (light purple shade)
          grayLight: "#f3f4f6", // bg-gray-light or hover:bg-gray-light
          light: "#f5f5f5 ", // bg-very-light
          darkBlue: "#1a2c53", // bg-dark-blue
          veryLight: "#fafafa", // bg-background
        },
        text: {
          purplePrimary: "#422ad5", // text-purple-primary
          grayPrimary: "#111827", // text-gray-primary
          graySecondary: "#838995", // text-gray-secondary
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("daisyui")],
  daisyui: {
    themes: ["light"],
    darkTheme: "light",
    base: true,
    styled: true,
    utils: true,
  },
} satisfies Config;
