import type { Config } from 'tailwindcss';

export default {
  content: [
    './packages/frontend/src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './packages/frontend/src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 低饱和度莫兰迪色系 - 个人成长助手设计系统
        primary: 'oklch(0.5505 0.0225 263.8717)', // #6B7280 - 鼠尾草灰（莫兰迪主色）
        'on-primary': '#FFFFFF',
        secondary: 'oklch(0.6063 0.0235 57.0939)', // #78716C - 灰褐色（莫兰迪次要）
        'on-secondary': '#FFFFFF',
        accent: 'oklch(0.5567 0.1247 231.6393)', // #0891B2 - 平静青蓝色（安抚情绪）
        'on-accent': '#FFFFFF',
        background: 'oklch(0.9613 0.0083 84.5941)', // #F5F5F0 - 暖米白背景
        foreground: 'oklch(0.2101 0.0318 264.6645)', // #0F172A - 深蓝灰文字
        card: '#FFFFFF',
        'card-foreground': 'oklch(0.2101 0.0318 264.6645)',
        muted: 'oklch(0.9661 0.0045 247.8956)', // #F6F6F7 - 淡灰（ muted 背景）
        'muted-foreground': 'oklch(0.5515 0.0234 264.3637)', // #64748B - 次要文字
        border: 'oklch(0.9227 0.0034 264.5313)', // #EDEEEF - 边框色
        'on-border': 'oklch(0.5515 0.0234 264.3637)',
        destructive: 'oklch(0.6368 0.2078 25.3313)', // #DC2626 - 危险/删除
        'on-destructive': '#FFFFFF',
        ring: 'oklch(0.5505 0.0225 263.8717)', // #6B7280 - Focus 环

        // 加密状态特殊颜色 - 用于客户端加密暗示
        encrypted: 'oklch(0.6463 0.1059 156.7429)', // #059669 - 安全绿色
        'encrypted-muted': 'oklch(0.9289 0.0264 156.5169)', // #E8F1F6 - 加密背景
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
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
        // 轻拟态阴影系统 - 柔和不刺眼
        'soft-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft-md': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'soft-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.10), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        // 大圆角设计系统
        xl: '0.75rem', // 12px
        '2xl': '1rem', // 16px - 推荐主圆角
        '3xl': '1.5rem', // 24px
      },
      transitionTimingFunction: {
        'soft': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'soft': '200ms',
      },
    },
  },
  plugins: [],
} satisfies Config;
