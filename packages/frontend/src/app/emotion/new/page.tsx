'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import EmotionRecordForm, { EmotionFormData } from '@/components/emotion/EmotionRecordForm';
import { ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function NewEmotionRecordPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  async function handleSubmit(data: EmotionFormData) {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/emotion/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token!}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        router.push('/emotion');
      } else {
        alert(result.error || '创建失败');
      }
    } catch (error) {
      console.error('Failed to create record:', error);
      alert('创建失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-primary/60">加载中...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/emotion" className="p-2 -ml-2 text-primary hover:text-accent cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">新建情绪记录</h1>
      </div>

      <div className="card">
        <div className="mb-6 flex items-center justify-between">
          <span className="encrypted-badge">
            <Lock className="w-3 h-3" />
            端到端加密存储
          </span>
        </div>
        <EmotionRecordForm
          onSubmit={handleSubmit}
          submitText={submitting ? '保存中...' : '保存记录'}
        />
      </div>
    </div>
  );
}
