'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { X, Menu } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 移动端：顶部导航栏带汉堡菜单 */}
      <div className="md:hidden sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-primary hover:text-accent transition-colors cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-medium text-foreground">Personal Assistant</span>
          <div className="w-6" /> {/* 占位保持居中 */}
        </div>
      </div>

      {/* 移动端遮罩层 */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="w-72 h-full bg-background" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end p-4 border-b border-border">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 cursor-pointer text-primary hover:text-accent"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex">
        {/* PC端固定侧边栏 */}
        <div className="hidden md:block w-56 fixed left-0 top-0 h-screen border-r border-border bg-background z-30">
          <Sidebar />
        </div>

        {/* 主内容区域 */}
        <main className="flex-1 md:ml-56 pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* 移动端底部导航 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border">
        <BottomNav />
      </div>
    </div>
  );
}
