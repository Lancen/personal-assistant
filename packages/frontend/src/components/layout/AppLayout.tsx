'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, loading } = useAuth();

  // 如果正在加载认证状态，仍然渲染布局，避免底部导航消失
  // 只有在确定未认证时才不渲染布局
  if (!loading && !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* PC端：左侧固定侧边栏 (>= 768px 显示，移动端隐藏) */}
      {/* 使用自定义 CSS 媒体查询确保规则存在，不依赖 Tailwind JIT 自动生成 */}
      <style jsx>{`
        .sidebar-layout {
          display: none;
        }
        @media (min-width: 768px) {
          .sidebar-layout {
            display: block;
          }
        }
        .main-content {
        }
        @media (min-width: 768px) {
          .main-content {
            margin-left: 14rem; /* w-56 = 14rem */
          }
        }
      `}</style>
      <div className="sidebar-layout w-56 fixed left-0 top-0 h-screen border-r border-border bg-background z-30">
        <Sidebar />
      </div>

      {/* 主内容区域 */}
      {/* - PC端：左边空出侧边栏宽度 */}
      {/* - 移动端：底部空出导航栏高度 + 安全区域 */}
      {/* - PC端：不需要底部留白 */}
      <div className="main-content">
        <main className="pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </main>
      </div>

      {/* 移动端底部导航 - 固定在屏幕最底部，不跟随滚动 (< 768px 显示，PC端隐藏) */}
      {(loading || isAuthenticated) && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-background border-t border-border">
          <div className="pb-[env(safe-area-inset-bottom)]">
            <BottomNav />
          </div>
        </div>
      )}
    </div>
  );
}
