'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EmotionRecord } from '@personal-assistant/types';
import EmotionRecordForm, { EmotionFormData } from '@/components/emotion/EmotionRecordForm';
import { ArrowLeft, Trash2, Lock } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function EditEmotionRecordPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [record, setRecord] = useState<EmotionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadRecord();
  }, [id, isAuthenticated, router]);

  async function loadRecord() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/emotion/records/${id}`, {
        headers: {
          Authorization: `Bearer ${token!}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setRecord(data.data.record);
      }
    } catch (error) {
      console.error('Failed to load record:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data: EmotionFormData) {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/emotion/records/${id}`, {
        method: 'PUT',
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
        alert(result.error || '更新失败');
      }
    } catch (error) {
      console.error('Failed to update record:', error);
      alert('更新失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('确定要删除这条记录吗？删除后不可恢复。')) {
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/emotion/records/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token!}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        router.push('/emotion');
      } else {
        alert(result.error || '删除失败');
      }
    } catch (error) {
      console.error('Failed to delete record:', error);
      alert('删除失败，请重试');
    } finally {
      setDeleting(false);
    }
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="px-4 py-6 text-center text-primary/60">加载中...</div>
    );
  }

  if (!record) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-primary/60 mb-4">记录不存在</p>
        <Link href="/emotion" className="btn-primary cursor-pointer">
          返回列表
        </Link>
      </div>
    );
  }

  const initialData = {
    event: record.event,
    emotionType: record.emotionType || '',
    emotionIntensity: record.emotionIntensity || 3.00,
    need: record.need,
    recordDate: record.recordDate,
    aiRecognizedEmotion: record.aiRecognizedEmotion,
    aiRecognizedIntensity: record.aiRecognizedIntensity,
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/emotion" className="p-2 -ml-2 text-primary hover:text-accent cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">编辑情绪记录</h1>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn-secondary flex items-center gap-2 text-destructive hover:bg-destructive/10 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? '删除中...' : '删除'}
        </button>
      </div>

      <div className="card">
        <div className="mb-6 flex items-center justify-between">
          <span className="encrypted-badge">
            <Lock className="w-3 h-3" />
            端到端加密存储
          </span>
        </div>
        <EmotionRecordForm
          initialData={initialData}
          onSubmit={handleSubmit}
          submitText={submitting ? '保存中...' : '保存修改'}
        />
      </div>
    </div>
  );
}
