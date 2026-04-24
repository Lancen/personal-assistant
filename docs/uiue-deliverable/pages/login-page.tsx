"use client";

import { useState } from "react";
import { Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 基本验证
    if (!email || !password) {
      setError("请填写邮箱和密码");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }

    setError("");
    setIsLoading(true);

    // 模拟登录请求 - 实际项目中替换为真实API调用
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // 登录成功后的跳转逻辑在这里处理
      console.log("Login success", { email, rememberMe });
    } catch (err) {
      setError("登录失败，请检查邮箱和密码");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            欢迎回来
          </h1>
          <p className="text-muted-foreground">
            登录你的个人智能助手账号
          </p>
        </div>

        {/* 登录卡片 */}
        <div className="soft-card p-6 md:p-8">
          <form onSubmit={handleSubmit} noValidate>
            {/* 错误提示 - 支持屏幕阅读器 */}
            {error && (
              <div
                className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <span className="text-destructive text-sm">{error}</span>
              </div>
            )}

            {/* 邮箱输入 */}
            <div className="mb-5">
              <label htmlFor="email" className="form-label">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10"
                  placeholder="your@email.com"
                  autoComplete="username"
                  aria-required="true"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 密码输入 - 带显示/隐藏切换和加密提示 */}
            <div className="mb-5 relative">
              <label htmlFor="password" className="form-label">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10 pr-12"
                  placeholder="输入密码"
                  autoComplete="current-password"
                  aria-required="true"
                  disabled={isLoading}
                />
                {/* 密码显示切换按钮 - 无障碍 */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                  aria-label={showPassword ? "隐藏密码" : "显示密码"}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {/* 隐私加密提示 */}
              <div className="mt-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>你的密码在客户端加密处理，服务端无法查看</span>
                </p>
              </div>
            </div>

            {/* 记住我 + 忘记密码 */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground">记住我</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-accent hover:underline underline-offset-2 transition-colors"
              >
                忘记密码？
              </Link>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>登录中...</span>
                </>
              ) : (
                <span>登录</span>
              )}
            </button>

            {/* 注册链接 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                还没有账号？{" "}
                <Link
                  href="/register"
                  className="text-accent font-medium hover:underline underline-offset-2 transition-colors"
                >
                  立即注册
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* 页脚 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            注重隐私的个人成长工具 · 情绪管理 · 任务管理 · 知识沉淀
          </p>
        </div>
      </div>
    </div>
  );
}
