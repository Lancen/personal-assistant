'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

// 不需要侧边栏布局的公开页面
const PUBLIC_PATHS = ['/', '/login'];

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // 判断是否为公开页面
  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  // 未认证时重定向到登录页（公开页面除外）
  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicPage) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, pathname, router, isPublicPage]);

  // 公开页面直接渲染内容，无侧边栏布局
  if (isPublicPage) {
    return <>{children}</>;
  }

  // 加载中显示简单的加载状态
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="min-h-dvh bg-background flex">
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-h-dvh">
        {/* 顶部导航栏 */}
        <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* 页面内容 */}
        <main className="flex-1">{children}</main>

        {/* 页脚 */}
        <footer className="border-t border-border py-4 px-6">
          <p className="text-center text-sm text-muted-foreground">
            UIUE · 个人智能助手 · 注重隐私的个人成长工具
          </p>
        </footer>
      </div>
    </div>
  );
}
