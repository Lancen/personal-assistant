'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);

    if (success) {
      router.push('/dashboard');
    } else {
      setError('登录失败，请检查邮箱和密码');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-2xl">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Personal Assistant
            </h1>
            <p className="text-primary/70">
              登录您的 AI 个人助理
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full pl-10"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full cursor-pointer"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-primary/60">
          <p>© 2026 Personal Assistant</p>
        </div>
      </div>
    </div>
  );
}
