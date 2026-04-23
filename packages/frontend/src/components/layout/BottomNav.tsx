'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  CheckCircle,
  Settings,
} from 'lucide-react';

const navItems = [
  {
    name: '首页',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: '情绪',
    href: '/emotion',
    icon: FileText,
  },
  {
    name: '检测',
    href: '/emotion/check',
    icon: CheckCircle,
  },
  {
    name: '分析',
    href: '/emotion-analysis',
    icon: BarChart3,
  },
  {
    name: '管理',
    href: '/admin/users',
    icon: Settings,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="h-[60px] flex items-center justify-around px-2 pt-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`
              flex flex-col items-center justify-center gap-1 px-3 py-1 min-w-[48px]
              transition-colors cursor-pointer
              ${isActive ? 'text-accent' : 'text-primary/60 hover:text-primary'}
            `}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
