import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        calm: {
          high: "#FF4D4F",
          medium: "#3A7BD5",
          low: "#34C759"
        }
      }
    }
  },
  plugins: []
};

export default config;
