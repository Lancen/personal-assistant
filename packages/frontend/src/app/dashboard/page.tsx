'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { EmotionRecord, EmotionDailyCheck } from '@personal-assistant/types';
import { Calendar, Smile, CheckSquare, FileText } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [todayCheck, setTodayCheck] = useState<EmotionDailyCheck | null>(null);
  const [recentRecords, setRecentRecords] = useState<EmotionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, router]);

  async function loadData() {
    try {
      // 获取今日检测状态
      const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/emotion-check/status`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const statusData = await statusRes.json();
      if (statusData.success) {
        setTodayCheck(statusData.data.existingCheck);
      }

      // 获取最近情绪记录
      const recordsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/emotion/records?page=1&pageSize=5`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const recordsData = await recordsRes.json();
      if (recordsData.success) {
        setRecentRecords(recordsData.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      {/* 欢迎标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">仪表盘</h1>
        <p className="text-primary/70">欢迎回来，查看你的近期状态</p>
      </div>

      {/* 快捷提示卡片 */}
      {!todayCheck && (
        <div className="card mb-6 border-accent bg-accent/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground mb-1">今日还未完成情绪检测</h3>
              <p className="text-sm text-primary/70">完成每日检测，帮助你更好地了解自己的情绪状态</p>
            </div>
            <Link
              href="/emotion/check"
              className="btn-primary cursor-pointer"
            >
              去检测
            </Link>
          </div>
        </div>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card card-hover">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-accent/10">
              <Smile className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-primary/60">今日情绪检测</p>
              <p className="text-xl font-semibold text-foreground">
                {todayCheck ? `${todayCheck.totalScore}/50` : '未完成'}
              </p>
              {todayCheck && todayCheck.isBelowThreshold && (
                <p className="text-xs text-destructive mt-1">状态偏低，建议谨慎决策</p>
              )}
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-accent/10">
              <FileText className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-primary/60">情绪记录</p>
              <p className="text-xl font-semibold text-foreground">
                {recentRecords.length} 条最近记录
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 最近情绪记录 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">最近记录</h2>
          <Link href="/emotion" className="btn-secondary cursor-pointer text-sm px-4 py-2">
            查看全部
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-primary/60">加载中...</div>
        ) : recentRecords.length === 0 ? (
          <div className="text-center py-8 text-primary/60">
            <p>还没有情绪记录</p>
            <Link href="/emotion/new" className="btn-primary inline-block mt-4 cursor-pointer">
              创建第一条记录
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRecords.map((record) => (
              <Link
                key={record.id}
                href={`/emotion/${record.id}`}
                className="block card card-hover cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">
                        {record.event.slice(0, 40)}
                        {record.event.length > 40 ? '...' : ''}
                      </span>
                    </div>
                    <div className="text-sm text-primary/60 mt-1">
                      {record.emotionType && (
                        <span className="inline-block px-2 py-1 rounded bg-muted mr-2">
                          {record.emotionType}
                        </span>
                      )}
                      <span>{formatDate(record.recordDate)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
