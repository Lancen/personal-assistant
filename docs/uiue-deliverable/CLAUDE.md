# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**个人智能助手** - 注重隐私的个人成长工具，包含情绪管理、任务管理和知识沉淀。面向知识工作者，追求极简、专注、治愈系体验。

**Tech Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Lucide Icons + Shadcn/ui ready

**Design Style:** 极简主义 + 温暖友好，低饱和度莫兰迪色系（鼠尾草绿主色 + 淡蓝色强调），轻拟态，大量留白，大圆角。

## Build Commands

```bash
npm install
npm run build
```

## Development Commands

```bash
npm run dev         # 启动开发服务器 (localhost:3000)
npm run lint        # 代码检查
npm run start       # 启动生产服务器
```

## Design System

- **Colors:** 莫兰迪低饱和色系
  - `primary: #7F8C7F` - 鼠尾草绿（安抚情绪）
  - `accent: #8FB4C7` - 淡蓝色（平静舒缓）
  - `background: #F5F5F0` - 暖米色背景
- **Typography:** Inter + PingFang SC（清晰易读无衬线）
- **Border Radius:** `xl: 1rem`, `xl: 1.5rem` (大圆角)
- **Shadows:** 轻拟态柔和阴影 `shadow-soft-md`
- **Client-side Encryption:** All sensitive forms/lists show lock indicator via `encrypted-indicator`, `encrypted-input`, `encrypted-list-item` utilities

## Architecture

- **App Router:** `app/` - Next.js 14 App Router
  - `app/layout.tsx` - 根布局，载入全局样式
  - `app/globals.css` - Tailwind 自定义样式和设计系统变量
  - `app/page.tsx` - 首页
- **Responsive:** Mobile-first 设计，PC端多栏展示，移动端单列
- **Accessibility:** `:focus-visible` 明显焦点环，支持键盘导航，尊重 `prefers-reduced-motion`
- **Design System persisted at:** `design-system/个人智能助手/MASTER.md`
