'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  BookOpen,
  Settings,
  Heart,
  Bell,
  User,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Lock,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

const navItems = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'emotion', label: '情绪日记', icon: Heart, href: '/emotion' },
  { id: 'tasks', label: '任务管理', icon: CheckSquare, href: '/tasks' },
  { id: 'notes', label: '知识笔记', icon: BookOpen, href: '/notes' },
  { id: 'calendar', label: '日历', icon: Calendar, href: '/calendar' },
  { id: 'settings', label: '设置', icon: Settings, href: '/settings' },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [taskStats, setTaskStats] = useState<{ total: number; completed: number } | null>(null);
  const [noteCount, setNoteCount] = useState<number>(0);
  const [emotionRecordCount, setEmotionRecordCount] = useState<number>(0);
  const [checkStatus, setCheckStatus] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [tasksRes, notesRes, emotionRes, checkRes] = await Promise.allSettled([
        api.get<any>('/api/tasks?page=1&pageSize=1'),
        api.get<any>('/api/notes?page=1&pageSize=1'),
        api.emotion.records.list(1, 1),
        api.emotionCheck.status(),
      ]);
      if (tasksRes.status === 'fulfilled' && tasksRes.value.success) {
        setTaskStats({ total: tasksRes.value.pagination?.total ?? 0, completed: 0 });
      }
      if (notesRes.status === 'fulfilled' && notesRes.value.success) {
        setNoteCount(notesRes.value.pagination?.total ?? 0);
      }
      if (emotionRes.status === 'fulfilled' && emotionRes.value.success) {
        setEmotionRecordCount(emotionRes.value.pagination?.total ?? 0);
      }
      if (checkRes.status === 'fulfilled' && checkRes.value.success) {
        setCheckStatus(checkRes.value.data);
      }
    } catch {
      // 忽略加载失败
    }
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

      {/* 侧边栏 - PC端sticky固定显示，移动端translate控制 */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border shadow-soft-md transform transition-transform duration-soft ease-soft lg:static lg:sticky lg:top-0 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:h-dvh lg:shrink-0`}
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
            const isActive = item.id === 'dashboard';
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-soft ease-soft ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-h-dvh">
        {/* 顶部导航栏 */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* 移动端菜单按钮 - PC 端强制隐藏 */}
            <button
              className="lg:!hidden p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="打开菜单"
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* 页面标题 */}
            <h1 className="text-xl font-semibold text-foreground">仪表盘</h1>

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
                            用户名
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            premium 账户
                          </p>
                        </div>
                      </div>
                      <div className="my-1 border-t border-border" />
                      <button
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition-colors text-sm text-muted-foreground"
                        aria-label="退出登录"
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

        {/* 仪表盘内容 */}
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* 欢迎语 */}
          <div className="soft-card p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-1">
              👋 欢迎回来
            </h2>
            <p className="text-muted-foreground">
              今天是美好的一天，继续专注你的成长吧。
            </p>
          </div>

          {/* KPI 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="soft-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">今日任务完成</span>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{taskStats ? `${taskStats.completed}/${taskStats.total}` : '--'}</p>
            </div>
            <div className="soft-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">知识笔记</span>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{noteCount || '--'}</p>
            </div>
            <div className="soft-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">情绪记录</span>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{emotionRecordCount || '--'}</p>
            </div>
            <div className="soft-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">专注时长</span>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">--</p>
            </div>
          </div>

          {/* 情绪状态卡片 */}
          <div className="soft-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">情绪状态</h3>
                {checkStatus?.completed ? (
                  <p className="text-sm text-muted-foreground">今日检测 {checkStatus.totalScore}/50</p>
                ) : (
                  <p className="text-sm text-muted-foreground">今日已记录 {emotionRecordCount} 条情绪</p>
                )}
              </div>
              {!checkStatus?.completed && (
                <Link href="/emotion/check" className="btn-primary py-2 px-4 text-sm">
                  点击完成今日检测
                </Link>
              )}
              {checkStatus?.completed && (
                <Link href="/emotion" className="btn-secondary py-2 px-4 text-sm">
                  查看情绪日记
                </Link>
              )}
            </div>
          </div>
        </main>

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
