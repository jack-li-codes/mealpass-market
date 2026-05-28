import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        market: {
          ink: "#17201b",
          leaf: "#2f7d52",
          mint: "#dff5e8",
          amber: "#f4b83f",
          coral: "#e96b51"
        }
      },
      boxShadow: {
        soft: "0 20px 60px rgba(23, 32, 27, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
