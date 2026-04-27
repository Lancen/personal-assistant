'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  BookOpen,
  Settings,
  X,
  Lock,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'tasks', label: '任务管理', icon: CheckSquare, href: '/tasks' },
  { id: 'notes', label: '知识笔记', icon: BookOpen, href: '/notes' },
  { id: 'calendar', label: '日历', icon: Calendar, href: '/calendar' },
  { id: 'settings', label: '设置', icon: Settings, href: '/settings' },
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === pathname) return true;
    if (pathname.startsWith(href + '/')) return true;
    return false;
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border shadow-soft-md transform transition-transform duration-soft ease-soft lg:sticky lg:top-0 lg:transform-none lg:!translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:shrink-0`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Lock className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground">UIUE</span>
        </div>
        {/* 移动端关闭按钮 */}
        <button
          className="ml-auto lg:hidden p-1.5 rounded-md hover:bg-muted transition-colors"
          onClick={() => setSidebarOpen(false)}
          aria-label="关闭侧边栏"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* 导航菜单 */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-soft ease-soft ${
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {isActive(item.href) && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
