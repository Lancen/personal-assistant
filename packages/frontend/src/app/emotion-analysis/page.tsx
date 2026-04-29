'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Calendar, CheckSquare, BookOpen, Settings,
  Heart, Bell, User, Menu, X, ChevronRight, LogOut, TrendingUp,
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

export default function EmotionAnalysisPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      // 加载最近的记录
      const res = await api.emotion.records.list(1, 30);
      if (res.success) {
        setRecords(res.data);
      }
    } catch {
      // 忽略
    } finally {
      setLoading(false);
    }
  }

  // 计算情绪类型分布
  const emotionDistribution: Record<string, number> = {};
  records.forEach(r => {
    emotionDistribution[r.emotionType] = (emotionDistribution[r.emotionType] || 0) + 1;
  });
  const sortedEmotions = Object.entries(emotionDistribution).sort((a, b) => b[1] - a[1]);

  // 计算平均强度
  const avgIntensity = records.length > 0
    ? records.reduce((sum, r) => sum + r.emotionIntensity, 0) / records.length
    : 0;

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
            <h1 className="text-xl font-semibold text-foreground">情绪分析回顾</h1>
            <div className="relative">
              <button className="p-2 rounded-md hover:bg-muted transition-colors" aria-label="用户菜单" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <User className="w-5 h-5 text-muted-foreground" />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-12 z-20 w-64 soft-card bg-card p-3 shadow-soft-lg">
                    <button className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition-colors text-sm text-muted-foreground">
                      <LogOut className="w-4 h-4" /><span>退出登录</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12"><p className="text-muted-foreground">加载中...</p></div>
          ) : records.length === 0 ? (
            <div className="soft-card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">暂无情绪记录数据</h3>
              <p className="text-muted-foreground mb-4">开始记录情绪后，这里将展示你的情绪趋势</p>
              <Link href="/emotion/new" className="btn-primary py-2 px-6">去记录</Link>
            </div>
          ) : (
            <>
              {/* 概览统计 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="soft-card p-5">
                  <p className="text-sm text-muted-foreground mb-1">总记录数</p>
                  <p className="text-2xl font-bold text-foreground">{records.length}</p>
                </div>
                <div className="soft-card p-5">
                  <p className="text-sm text-muted-foreground mb-1">平均强度</p>
                  <p className="text-2xl font-bold text-foreground">{avgIntensity.toFixed(2)}</p>
                </div>
                <div className="soft-card p-5">
                  <p className="text-sm text-muted-foreground mb-1">情绪种类</p>
                  <p className="text-2xl font-bold text-foreground">{sortedEmotions.length}</p>
                </div>
              </div>

              {/* 情绪类型分布 */}
              <div className="soft-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">情绪类型分布</h3>
                <div className="space-y-3">
                  {sortedEmotions.map(([emotion, count]) => {
                    const maxCount = sortedEmotions[0][1];
                    const percentage = (count / maxCount) * 100;
                    return (
                      <div key={emotion} className="flex items-center gap-3">
                        <span className="text-xl w-8 text-center">{EMOTION_ICONS[emotion] || '😐'}</span>
                        <span className="text-sm text-foreground w-16 shrink-0">{emotion}</span>
                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 时间线 */}
              <div className="soft-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">最近记录</h3>
                <div className="space-y-4">
                  {records.slice(0, 10).map((record: any) => (
                    <div key={record.recordId} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                      <span className="text-xl">{EMOTION_ICONS[record.emotionType] || '😐'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{record.emotionType}</span>
                          <span className="text-xs text-muted-foreground">强度 {record.emotionIntensity}</span>
                        </div>
                        <p className="text-sm text-foreground truncate">{record.event}</p>
                        <p className="text-xs text-muted-foreground mt-1">{record.recordDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>

        <footer className="border-t border-border py-4 px-6">
          <p className="text-center text-sm text-muted-foreground">UIUE · 个人智能助手 · 注重隐私的个人成长工具</p>
        </footer>
      </div>
    </div>
  );
}
