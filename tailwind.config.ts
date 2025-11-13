import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // ✅ 모든 JS/TSX 스캔
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // ✅ 일부 구조에서는 app도 포함 필요
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config