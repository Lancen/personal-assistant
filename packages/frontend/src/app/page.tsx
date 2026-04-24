'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Brain, MessageSquare, Settings, Lock } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <main className="min-h-dvh px-4 py-3xl">
      <div className="max-w-3xl mx-auto text-center">
        {/* Hero */}
        <div className="mb-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-lg">
            Personal Assistant
          </h1>
          <p className="text-xl text-primary/70 mb-xl max-w-2xl mx-auto">
            您的专属 AI 个人助手，随时为您提供帮助
          </p>
          <div className="flex flex-col sm:flex-row gap-md justify-center">
            {isAuthenticated ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-primary cursor-pointer text-lg px-8"
              >
                进入控制台
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="btn-primary cursor-pointer text-lg px-8"
              >
                开始使用
              </button>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-lg mb-3xl">
          <div className="card card-hover">
            <Brain className="w-10 h-10 mx-auto mb-md text-accent" />
            <h3 className="text-lg font-semibold mb-sm text-foreground">
              智能对话
            </h3>
            <p className="text-primary/70 text-sm">
              基于大语言模型，提供流畅自然的对话体验
            </p>
          </div>
          <div className="card card-hover">
            <MessageSquare className="w-10 h-10 mx-auto mb-md text-accent" />
            <h3 className="text-lg font-semibold mb-sm text-foreground">
              多轮对话
            </h3>
            <p className="text-primary/70 text-sm">
              保存历史对话，随时继续之前的话题
            </p>
          </div>
          <div className="card card-hover">
            <Settings className="w-10 h-10 mx-auto mb-md text-accent" />
            <h3 className="text-lg font-semibold mb-sm text-foreground">
              隐私安全
            </h3>
            <p className="text-primary/70 text-sm mb-3">
              端到端加密存储，您的数据完全私密可控
            </p>
            <span className="encrypted-badge mx-auto">
              <Lock className="w-3 h-3" />
              客户端加密
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-primary/50">
          <p>Built with Next.js • Tailwind CSS • AI</p>
        </div>
      </div>
    </main>
  );
}
