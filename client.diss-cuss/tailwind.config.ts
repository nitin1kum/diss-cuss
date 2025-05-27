import type { Config } from "tailwindcss";
/** @type {import('tailwindcss').Config} */

export default {
  darkMode : 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        card: 'var(--card-bg)',
        text: 'var(--text-primary)',
        subtext: 'var(--text-secondary)',
        accent: 'var(--accent)',
        border: 'var(--border)',
        'border-secondary': 'var(--border-secondary)',
        highlight: 'var(--highlight)',
        link: 'var(--link)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;
