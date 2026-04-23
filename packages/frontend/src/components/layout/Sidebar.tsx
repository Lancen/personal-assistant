'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Lightbulb,
  MessageSquare,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  {
    name: '仪表盘',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: '情绪日记',
    href: '/emotion',
    icon: FileText,
  },
  {
    name: '任务列表',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    name: '知识沉淀',
    href: '/knowledge',
    icon: Lightbulb,
  },
  {
    name: '对话',
    href: '/conversation',
    icon: MessageSquare,
  },
  {
    name: '用户管理',
    href: '/admin/users',
    icon: Settings,
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    onNavigate?.();
    router.push('/');
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground">Personal Assistant</h2>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                ${isActive
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-primary hover:bg-muted transition-colors'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* 用户信息和退出 */}
      <div className="mt-auto pt-4 border-t border-border">
        {user && (
          <div className="mb-3 px-3">
            <p className="font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-primary/60 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>退出</span>
        </button>
      </div>
    </div>
  );
}
