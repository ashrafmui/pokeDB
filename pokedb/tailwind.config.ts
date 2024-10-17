import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#e85a54",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        'pocket-monk': ['Pocket Monk', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
