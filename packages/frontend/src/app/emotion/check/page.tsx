'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Calendar, CheckSquare, BookOpen, Settings,
  Heart, Bell, User, Menu, X, ChevronRight, LogOut, ArrowLeft,
  ChevronLeft, ChevronRightIcon, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import EmotionCheckCard from '@/components/emotion/EmotionCheckCard';
import EmotionCheckResult from '@/components/emotion/EmotionCheckResult';

const navItems = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'emotion', label: '情绪日记', icon: Heart, href: '/emotion' },
  { id: 'tasks', label: '任务管理', icon: CheckSquare, href: '/tasks' },
  { id: 'notes', label: '知识笔记', icon: BookOpen, href: '/notes' },
  { id: 'calendar', label: '日历', icon: Calendar, href: '/calendar' },
  { id: 'settings', label: '设置', icon: Settings, href: '/settings' },
];

export default function EmotionCheckPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [checkStatus, setCheckStatus] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    try {
      const res = await api.emotionCheck.status();
      if (res.success) {
        setCheckStatus(res.data);
        if (res.data.completed) {
          // 今日已完成，加载结果
          loadExistingResult();
        } else {
          await generateQuestions();
        }
      }
    } catch {
      // 忽略
    } finally {
      setLoading(false);
    }
  }

  async function generateQuestions() {
    try {
      const res = await api.emotionCheck.generate();
      if (res.success && res.data) {
        setQuestions(res.data.questions || []);
      }
    } catch {
      // 忽略
    }
  }

  async function loadExistingResult() {
    try {
      const res = await api.emotionCheck.history(1, 1);
      if (res.success && res.data && res.data.length > 0) {
        setResult(res.data[0]);
      }
    } catch {
      // 忽略
    }
  }

  function handleSelectScore(questionId: number, score: number) {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  }

  async function handleSubmit() {
    const answerList = Object.entries(answers).map(([questionId, score]) => ({
      questionId: Number(questionId),
      score,
    }));

    setSubmitting(true);
    try {
      const res = await api.emotionCheck.submit(answerList);
      if (res.success && res.data) {
        setResult(res.data);
      }
    } catch {
      // 忽略
    } finally {
      setSubmitting(false);
    }
  }

  const currentQuestion = questions[currentIndex];
  const allAnswered = questions.length > 0 && questions.every((q: any) => answers[q.id] !== undefined);
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="min-h-dvh bg-background flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border shadow-soft-md transform transition-transform duration-soft ease-soft lg:static lg:sticky lg:top-0 lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:h-dvh lg:shrink-0`}>
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">UIUE</span>
          </div>
          <button className="ml-auto lg:hidden p-1.5 rounded-md hover:bg-muted transition-colors" onClick={() => setSidebarOpen(false)} aria-label="关闭侧边栏">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === 'emotion';
            return (
              <Link key={item.id} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-soft ease-soft ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} onClick={() => setSidebarOpen(false)}>
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-h-dvh">
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button className="lg:!hidden p-2 rounded-md hover:bg-muted transition-colors" onClick={() => setSidebarOpen(true)} aria-label="打开菜单">
                <Menu className="w-5 h-5 text-muted-foreground" />
              </button>
              <Link href="/emotion" className="p-2 rounded-md hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
              <h1 className="text-xl font-semibold text-foreground">情绪检测</h1>
            </div>
            <div className="relative">
              <button className="p-2 rounded-md hover:bg-muted transition-colors" aria-label="用户菜单" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <User className="w-5 h-5 text-muted-foreground" />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-12 z-20 w-64 soft-card bg-card p-3 shadow-soft-lg">
                    <button className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition-colors text-sm text-muted-foreground">
                      <LogOut className="w-4 h-4" /><span>退出登录</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-2xl mx-auto">
            {loading ? (
              <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
            ) : result ? (
              <EmotionCheckResult
                totalScore={result.totalScore}
                isBelowThreshold={result.isBelowThreshold}
                suggestion={result.suggestion}
                dimensionScores={result.dimensionScores || {}}
                threshold={25}
              />
            ) : questions.length > 0 && currentQuestion ? (
              <div className="space-y-6">
                {/* 进度条 */}
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>

                <EmotionCheckCard
                  dimension={currentQuestion.dimension}
                  questionText={currentQuestion.questionText}
                  questionIndex={currentIndex}
                  totalQuestions={questions.length}
                  selectedScore={answers[currentQuestion.id] ?? null}
                  onSelect={(score) => handleSelectScore(currentQuestion.id, score)}
                />

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                    disabled={currentIndex === 0}
                    className="btn-secondary py-2 px-4 text-sm flex items-center gap-1 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" /> 上一题
                  </button>

                  {isLastQuestion ? (
                    <button
                      onClick={handleSubmit}
                      disabled={!allAnswered || submitting}
                      className="btn-primary py-2 px-6 text-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {submitting ? '提交中...' : '提交'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                      className="btn-primary py-2 px-4 text-sm flex items-center gap-1"
                    >
                      下一题 <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">暂无题目</p>
                <button onClick={generateQuestions} className="btn-primary py-2 px-4">生成题目</button>
              </div>
            )}
          </div>
        </main>

        <footer className="border-t border-border py-4 px-6">
          <p className="text-center text-sm text-muted-foreground">UIUE · 个人智能助手 · 注重隐私的个人成长工具</p>
        </footer>
      </div>
    </div>
  );
}
