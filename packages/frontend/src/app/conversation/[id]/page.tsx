'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api, ChatMessage } from '@/lib/api';
import { ArrowLeft, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ConversationPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadConversation();
  }, [id, isAuthenticated, router]);

  async function loadConversation() {
    try {
      const data = await api.conversations.get(id);
      setMessages(data.conversation.messages);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const content = input.trim();
    setInput('');
    setSending(true);

    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await api.conversations.sendMessage(id, content);
      setMessages((prev) => [...prev, response.message]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '抱歉，发送消息失败，请重试。',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('确定要删除这个对话吗？此操作不可撤销。')) {
      return;
    }

    setDeleting(true);
    try {
      await api.conversations.delete(id);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      setDeleting(false);
    }
  }

  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-primary hover:text-accent transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">返回</span>
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 text-destructive hover:bg-destructive/10 px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">删除对话</span>
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 overflow-y-auto">
        {loading ? (
          <div className="text-center py-xl text-primary/60">加载中...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-3xl text-primary/60">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              开始新对话
            </h2>
            <p>发送一条消息，让您的 AI 个人助理帮助您。</p>
          </div>
        ) : (
          <div className="space-y-lg">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-accent text-on-primary'
                      : 'card border border-border'
                  }`}
                >
                  <div className="text-sm mb-1 opacity-70">
                    {message.role === 'user' ? '你' : 'AI 助理'} • {formatTime(message.timestamp)}
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-xl px-4 py-3 card border border-border">
                  <div className="flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background sticky bottom-0">
        <div className="max-w-3xl mx-auto p-4">
          <form onSubmit={handleSend} className="flex gap-sm">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入您的问题..."
              className="input flex-1"
              disabled={sending || loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending || loading}
              className="btn-primary px-6 flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              发送
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
