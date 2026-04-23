'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EmotionRecord } from '@personal-assistant/types';
import { Plus } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function EmotionListPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<EmotionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadRecords(1);
  }, [isAuthenticated, router]);

  async function loadRecords(currentPage: number) {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE}/api/emotion/records?page=${currentPage}&pageSize=20`,
        {
          headers: {
            Authorization: `Bearer ${token!}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setRecords(data.data);
        setPage(currentPage);
        setTotalPages(data.pagination.totalPages);
        setHasMore(currentPage < data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      {/* 标题和新建按钮 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">情绪日记</h1>
        <Link href="/emotion/new" className="btn-primary flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" />
          新建记录
        </Link>
      </div>

      {/* 记录列表 */}
      {loading && page === 1 ? (
        <div className="text-center py-12 text-primary/60">加载中...</div>
      ) : records.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-primary/60 mb-4">还没有情绪记录</p>
          <Link href="/emotion/new" className="btn-primary inline-flex cursor-pointer">
            创建第一条记录
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <Link
              key={record.id}
              href={`/emotion/${record.id}`}
              className="block card card-hover cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-primary/60 text-sm mb-1">
                    {formatDate(record.recordDate)}
                    {record.emotionType && (
                      <span className="inline-block px-2 py-1 ml-2 rounded bg-muted text-xs">
                        {record.emotionType} {record.emotionIntensity?.toFixed(2)}
                      </span>
                    )}
                  </p>
                  <p className="text-foreground font-medium truncate">
                    {record.event.slice(0, 80)}
                    {record.event.length > 80 ? '...' : ''}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => loadRecords(page - 1)}
            className="btn-secondary cursor-pointer disabled:opacity-50"
          >
            上一页
          </button>
          <span className="text-sm text-primary/70">
            {page} / {totalPages}
          </span>
          <button
            disabled={!hasMore}
            onClick={() => loadRecords(page + 1)}
            className="btn-secondary cursor-pointer disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
