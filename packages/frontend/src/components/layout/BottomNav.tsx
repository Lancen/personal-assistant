'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Lightbulb,
  MessageSquare,
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
    name: '任务',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    name: '知识',
    href: '/knowledge',
    icon: Lightbulb,
  },
  {
    name: '对话',
    href: '/conversation',
    icon: MessageSquare,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="h-[60px] flex items-center justify-around px-2">
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
