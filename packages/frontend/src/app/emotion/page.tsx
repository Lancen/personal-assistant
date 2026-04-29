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
  LogOut,
  Plus,
  Smile,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

const EMOTION_ICONS: Record<string, string> = {
  '快乐': '😊', '满足': '😌', '平静': '😐', '期待': '🤩',
  '感恩': '🙏', '焦虑': '😰', '悲伤': '😢', '愤怒': '😡',
  '恐惧': '😨', '厌恶': '🤢', '羞耻': '😳', '内疚': '😔',
  '惊讶': '😲', '困惑': '😕',
};

const navItems = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'emotion', label: '情绪日记', icon: Heart, href: '/emotion' },
  { id: 'tasks', label: '任务管理', icon: CheckSquare, href: '/tasks' },
  { id: 'notes', label: '知识笔记', icon: BookOpen, href: '/notes' },
  { id: 'calendar', label: '日历', icon: Calendar, href: '/calendar' },
  { id: 'settings', label: '设置', icon: Settings, href: '/settings' },
];

export default function EmotionListPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, [page]);

  async function loadRecords() {
    try {
      setLoading(true);
      const res = await api.emotion.records.list(page);
      if (res.success) {
        setRecords(res.data);
        setPagination(res.pagination);
      }
    } catch {
      // API 调用失败时使用空状态
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(recordId: string) {
    if (!confirm('确定要删除这条情绪记录吗？')) return;
    try {
      await api.emotion.records.delete(recordId);
      loadRecords();
    } catch {
      // 忽略删除失败
    }
  }

  return (
    <div className="min-h-dvh bg-background flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border shadow-soft-md transform transition-transform duration-soft ease-soft lg:static lg:sticky lg:top-0 lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:h-dvh lg:shrink-0`}>
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">UIUE</span>
          </div>
          <button className="ml-auto lg:hidden p-1.5 rounded-md hover:bg-muted transition-colors" onClick={() => setSidebarOpen(false)} aria-label="关闭侧边栏">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === 'emotion';
            return (
              <Link key={item.id} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-soft ease-soft ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} onClick={() => setSidebarOpen(false)}>
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-h-dvh">
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <button className="lg:!hidden p-2 rounded-md hover:bg-muted transition-colors" onClick={() => setSidebarOpen(true)} aria-label="打开菜单">
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-xl font-semibold text-foreground">情绪日记</h1>
            <div className="flex items-center gap-2 ml-auto">
              <Link href="/emotion/new" className="btn-primary py-2 px-4 text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" />
                记录情绪
              </Link>
              <div className="relative">
                <button className="p-2 rounded-md hover:bg-muted transition-colors" aria-label="用户菜单" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <User className="w-5 h-5 text-muted-foreground" />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-12 z-20 w-64 soft-card bg-card p-3 shadow-soft-lg">
                      <button className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition-colors text-sm text-muted-foreground" aria-label="退出登录">
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

        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* 快捷入口 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/emotion/new" className="soft-card p-5 hover:shadow-soft-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">记录情绪</p>
                  <p className="text-sm text-muted-foreground">写下此刻的感受</p>
                </div>
              </div>
            </Link>
            <Link href="/emotion/check" className="soft-card p-5 hover:shadow-soft-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Smile className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">情绪检测</p>
                  <p className="text-sm text-muted-foreground">今日心理健康自评</p>
                </div>
              </div>
            </Link>
            <Link href="/emotion-analysis" className="soft-card p-5 hover:shadow-soft-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">分析回顾</p>
                  <p className="text-sm text-muted-foreground">查看情绪趋势</p>
                </div>
              </div>
            </Link>
          </div>

          {/* 记录列表 */}
          {loading ? (
            <div className="soft-card p-12 text-center">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="soft-card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">还没有情绪记录</h3>
              <p className="text-muted-foreground mb-4">开始记录你的第一条情绪吧</p>
              <Link href="/emotion/new" className="btn-primary py-2 px-6">去记录</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record: any) => (
                <div key={record.recordId} className="soft-card p-5 hover:shadow-soft-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-2xl">{EMOTION_ICONS[record.emotionType] || '😐'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{record.emotionType}</span>
                          <span className="text-sm text-muted-foreground">强度 {record.emotionIntensity}</span>
                        </div>
                        <p className="text-sm text-foreground truncate">{record.event}</p>
                        <p className="text-xs text-muted-foreground mt-1">{record.recordDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/emotion/${record.recordId}`} className="text-sm text-accent hover:underline">编辑</Link>
                      <button onClick={() => handleDelete(record.recordId)} className="text-sm text-destructive hover:underline">删除</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 分页 */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!pagination.hasPrev} className="btn-secondary py-2 px-4 text-sm disabled:opacity-50">上一页</button>
              <span className="text-sm text-muted-foreground">{pagination.page} / {pagination.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={!pagination.hasNext} className="btn-secondary py-2 px-4 text-sm disabled:opacity-50">下一页</button>
            </div>
          )}
        </main>

        <footer className="border-t border-border py-4 px-6">
          <p className="text-center text-sm text-muted-foreground">UIUE · 个人智能助手 · 注重隐私的个人成长工具</p>
        </footer>
      </div>
    </div>
  );
}
