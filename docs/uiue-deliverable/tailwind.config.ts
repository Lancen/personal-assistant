import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // 低饱和度莫兰迪色系 - 个人智能助手设计系统
        primary: {
          DEFAULT: "#7F8C7F", // 莫兰迪鼠尾草绿 - 安抚情绪
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#8A9282", // 莫兰迪暖灰褐
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#8FB4C7", // 莫兰迪淡蓝色 - 平静舒缓
          foreground: "#FFFFFF",
        },
        background: {
          DEFAULT: "#F5F5F0", // 暖米色背景
          foreground: "#0F172A", // 深蓝灰文字
        },
        foreground: "#0F172A",
        muted: {
          DEFAULT: "#F6F6F7",
          foreground: "#64748B",
        },
        border: {
          DEFAULT: "#EDEEEF",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        ring: "#7F8C7F",
      },
      fontFamily: {
        sans: ["Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "sans-serif"],
      },
      borderRadius: {
        lg: "1rem", // rounded-xl
        md: "0.75rem",
        sm: "0.5rem",
        xl: "1.5rem", // rounded-2xl 符合要求
      },
      boxShadow: {
        // 轻拟态阴影 - 柔和不突兀
        "soft-sm": "0 1px 2px rgba(0, 0, 0, 0.04)",
        "soft-md": "0 4px 12px rgba(0, 0, 0, 0.08)",
        "soft-lg": "0 10px 25px rgba(0, 0, 0, 0.10)",
        "soft-xl": "0 20px 40px rgba(0, 0, 0, 0.12)",
      },
      spacing: {
        // 统一间距系统
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
        "3xl": "4rem",
      },
      transitionTimingFunction: {
        "soft": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        "soft": "200ms",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
