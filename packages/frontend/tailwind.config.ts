import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#78716C',
        'on-primary': '#FFFFFF',
        secondary: '#92400E',
        accent: '#D97706',
        background: '#FFFBEB',
        foreground: '#0F172A',
        muted: '#F6F6F6',
        border: '#EEEDED',
        destructive: '#DC2626',
        ring: '#78716C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      },
      boxShadow: {
        'depth-sm': '0 1px 2px rgba(0,0,0,0.05)',
        'depth-md': '0 4px 6px rgba(0,0,0,0.1)',
        'depth-lg': '0 10px 15px rgba(0,0,0,0.1)',
        'depth-xl': '0 20px 25px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
} satisfies Config;
