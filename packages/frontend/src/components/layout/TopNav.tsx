'use client';

import { useState } from 'react';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface TopNavProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

// 页面标题映射
const pageTitles: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/tasks': '任务管理',
  '/notes': '知识笔记',
  '/calendar': '日历',
  '/settings': '设置',
};

export default function TopNav({ setSidebarOpen }: TopNavProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // 获取当前页面标题
  const getPageTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (pathname === path || pathname.startsWith(path + '/')) {
        return title;
      }
    }
    return '个人智能助手';
  };

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* 移动端菜单按钮 - 只在移动端显示，PC端强制隐藏 */}
        <button
          className="lg:!hidden p-2 rounded-md hover:bg-muted transition-colors"
          onClick={() => setSidebarOpen(true)}
          aria-label="打开菜单"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* 页面标题 - PC 端左对齐，移动端居中 */}
        <h1 className="text-xl font-semibold text-foreground lg:ml-0 ml-auto mr-auto">
          {getPageTitle()}
        </h1>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-2 ml-auto">
          {/* 通知按钮 */}
          <button
            className="p-2 rounded-md hover:bg-muted transition-colors relative"
            aria-label="通知"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
          </button>

          {/* 用户菜单 */}
          <div className="relative">
            <button
              className="p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="用户菜单"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <User className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* 用户下拉菜单 */}
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-12 z-20 w-64 soft-card bg-card p-3 shadow-soft-lg">
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <User className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user?.name || '用户'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email || ''}
                      </p>
                    </div>
                  </div>
                  <div className="my-1 border-t border-border" />
                  <button
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition-colors text-sm text-muted-foreground"
                    aria-label="退出登录"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
