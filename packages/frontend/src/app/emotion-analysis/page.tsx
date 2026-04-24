'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EmotionAnalysisResult } from '@personal-assistant/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Period = 'day' | 'week' | 'month' | 'quarter';

const periodLabels: Record<Period, string> = {
  day: '今日',
  week: '本周',
  month: '本月',
  quarter: '本季度',
};

export default function EmotionAnalysisPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('week');
  const [loadingData, setLoadingData] = useState(false);
  const [analysis, setAnalysis] = useState<EmotionAnalysisResult | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!loading) {
      loadAnalysis();
    }
  }, [period, loading, isAuthenticated, router]);

  async function loadAnalysis() {
    setLoadingData(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE}/api/emotion-check/analysis?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${token!}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAnalysis(data.data);
      }
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setLoadingData(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-primary/60">加载中...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard" className="p-2 -ml-2 text-primary hover:text-accent cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">情绪分析回顾</h1>
      </div>

      {/* 周期选择 */}
      <div className="flex gap-2 mb-6">
        {(Object.keys(periodLabels) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`
              px-4 py-2 rounded-lg cursor-pointer transition-colors
              ${period === p
                ? 'bg-accent text-white'
                : 'bg-background border border-border hover:bg-muted'
              }
            `}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {loadingData ? (
        <div className="text-center py-12 text-primary/60">分析中...</div>
      ) : !analysis ? (
        <div className="card text-center py-12 text-primary/60">
          暂无数据
        </div>
      ) : (
        <div className="space-y-6">
          {/* 得分趋势 */}
          {analysis.trendData.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-foreground mb-4">得分趋势</h2>
              <div className="h-48 flex items-end justify-between gap-2">
                {analysis.trendData.slice(-14).reverse().map((item) => {
                  const height = (item.score / 50) * 100;
                  return (
                    <div
                      key={item.date}
                      className="flex-1 flex flex-col justify-end items-center gap-1 min-w-0"
                    >
                      <div
                        className={`w-full rounded-t-sm ${
                          item.score < 25 ? 'bg-destructive/60' : 'bg-accent/60'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[10px] text-primary/60 truncate">
                        {item.date.split('-').slice(2).join('/')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
        )}

        {/* AI总结 */}
        {analysis.aiSummary.conclusion && (
          <div className="card">
            <h2 className="text-xl font-semibold text-foreground mb-4">AI 分析总结</h2>
            <p className="text-foreground">{analysis.aiSummary.conclusion}</p>

            {analysis.aiSummary.commonTriggers.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-foreground mb-2">常见触发源：</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.aiSummary.commonTriggers.map((trigger, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-muted text-sm text-primary">
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.aiSummary.suggestions.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-foreground mb-2">建议：</h3>
                <ul className="space-y-1">
                  {analysis.aiSummary.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm text-primary">
                      • {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        </div>
      )}
    </div>
  );
}
