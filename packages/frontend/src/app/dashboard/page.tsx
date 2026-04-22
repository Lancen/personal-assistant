'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api, ConversationSummary } from '@/lib/api';
import { Plus, LogOut, MessageSquare, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadConversations();
  }, [isAuthenticated, router]);

  async function loadConversations() {
    try {
      const data = await api.conversations.list();
      setConversations(data.conversations.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createNewConversation() {
    setCreating(true);
    try {
      const { conversation } = await api.conversations.create();
      router.push(`/conversation/${conversation.id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setCreating(false);
    }
  }

  function handleLogout() {
    logout();
    router.push('/');
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-dvh px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2xl">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              你好，{user?.name || '用户'} 👋
            </h1>
            <p className="text-primary/70">
              开始与您的 AI 个人助理对话
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            退出
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-md mb-2xl">
          <div className="card card-hover">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-accent/10">
                <MessageSquare className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-primary/60">对话总数</p>
                <p className="text-2xl font-semibold text-foreground">
                  {conversations.length}
                </p>
              </div>
            </div>
          </div>
          <div className="card card-hover">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-accent/10">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-primary/60">最新对话</p>
                <p className="text-lg font-semibold text-foreground">
                  {conversations.length > 0
                    ? formatDate(conversations[0].updatedAt).split(' ')[0]
                    : '暂无'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* New Conversation Button */}
        <div className="mb-xl">
          <button
            onClick={createNewConversation}
            disabled={creating}
            className="btn-primary w-full flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            {creating ? '创建中...' : '新建对话'}
          </button>
        </div>

        {/* Conversation List */}
        <div className="space-y-md">
          <h2 className="text-xl font-semibold text-foreground mb-md">
            最近对话
          </h2>

          {loading ? (
            <div className="text-center py-xl text-primary/60">加载中...</div>
          ) : conversations.length === 0 ? (
            <div className="card text-center py-3xl">
              <MessageSquare className="w-12 h-12 mx-auto mb-md text-primary/40" />
              <p className="text-primary/60 mb-lg">还没有对话</p>
              <button
                onClick={createNewConversation}
                disabled={creating}
                className="btn-primary inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                创建第一个对话
              </button>
            </div>
          ) : (
            conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/conversation/${conv.id}`}
                className="card card-hover block w-full cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground truncate">
                      {conv.title || 'New Conversation'}
                    </h3>
                    <p className="text-sm text-primary/60 mt-1 truncate">
                      {conv.lastMessage || '暂无消息'}
                    </p>
                  </div>
                  <div className="ml-md text-right">
                    <span className="text-xs text-primary/50">
                      {formatDate(conv.updatedAt)}
                    </span>
                    <p className="text-xs text-primary/50 mt-1">
                      {conv.messageCount} 条消息
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
