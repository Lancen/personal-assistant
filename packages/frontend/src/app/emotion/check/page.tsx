'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EmotionQuestion, EmotionDailyCheck } from '@personal-assistant/types';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const DEFAULT_THRESHOLD = 25;

export default function EmotionCheckPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [loadingData, setLoadingData] = useState(true);
  const [existingCheck, setExistingCheck] = useState<EmotionDailyCheck | null>(null);
  const [questions, setQuestions] = useState<EmotionQuestion[]>([]);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<{
    totalScore: number;
    isBelowThreshold: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!loading) {
      checkStatus();
    }
  }, [loading, isAuthenticated, router]);

  async function checkStatus() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/emotion-check/status`, {
        headers: {
          Authorization: `Bearer ${token!}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        if (data.data.alreadyCompleted && data.data.existingCheck) {
          setExistingCheck(data.data.existingCheck);
          setCompleted(true);
          setResult({
            totalScore: data.data.existingCheck.totalScore,
            isBelowThreshold: data.data.existingCheck.isBelowThreshold,
            message: data.data.existingCheck.isBelowThreshold
              ? '你当前情绪状态偏低，建议今天不做重大决策'
              : '检测完成，情绪状态正常',
          });
        } else {
          await generateQuestions();
        }
      }
    } catch (error) {
      console.error('Failed to check status:', error);
    } finally {
      setLoadingData(false);
    }
  }

  async function generateQuestions() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/emotion-check/generate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token!}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setQuestions(data.data.questions);
      }
    } catch (error) {
      console.error('Failed to generate questions:', error);
    }
  }

  function handleScoreChange(score: number) {
    const newAnswers = new Map(answers);
    newAnswers.set(questions[currentIndex].id, score);
    setAnswers(newAnswers);
  }

  async function handleSubmit() {
    if (questions.length !== 10) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const answerList = Array.from(answers.entries()).map(([questionId, score]) => ({
        questionId,
        score,
      }));

      const response = await fetch(`${API_BASE}/api/emotion-check/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token!}`,
        },
        body: JSON.stringify({ answers: answerList }),
      });

      const data = await response.json();
      if (data.success) {
        setCompleted(true);
        setResult({
          totalScore: data.data.check.totalScore,
          isBelowThreshold: data.data.check.isBelowThreshold,
          message: data.data.message,
        });
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  const currentScore = questions[currentIndex] ? answers.get(questions[currentIndex].id) || 3 : 3;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const allAnswered = questions.length === 10 && answers.size === 10;

  if (loading) {
    return <div className="text-center py-12 text-primary/60">加载中...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loadingData) {
    return (
      <div className="px-4 py-6 text-center text-primary/60">加载中...</div>
    );
  }

  // 已完成，显示结果
  if (completed && result) {
    return (
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard" className="p-2 -ml-2 text-primary hover:text-accent cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">情绪健康检测结果</h1>
        </div>

        <div className="card text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {result.totalScore} <span className="text-lg text-primary/60">/ 50</span>
          </h2>

          {result.isBelowThreshold ? (
            <div className="my-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-destructive font-medium text-lg">{result.message}</p>
              <p className="text-destructive/80 text-sm mt-2">
                建议减少今日高难度任务安排，适当放松调整
              </p>
            </div>
          ) : (
            <div className="my-6 p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-accent font-medium text-lg">{result.message}</p>
            </div>
          )}

          <Link href="/dashboard" className="btn-primary inline-block cursor-pointer mt-2">
            返回仪表盘
          </Link>
        </div>
      </div>
    );
  }

  // 答题中
  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="p-2 -ml-2 text-primary hover:text-accent cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">情绪健康检测</h1>
        </div>
        <span className="encrypted-badge hidden sm:inline-flex">
          <Lock className="w-3 h-3" />
          数据加密
        </span>
      </div>

      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-primary/60 mb-2">
          <span>进度</span>
          <span>{currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 当前问题 */}
      {questions[currentIndex] && (
        <div className="card mb-6">
          <p className="text-sm text-primary/60 mb-2">
            {questions[currentIndex].dimension}
          </p>
          <h3 className="text-xl font-semibold text-foreground mb-6">
            {questions[currentIndex].questionText}
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary/60">分数</span>
              <span className="text-lg font-medium text-foreground">
                {currentScore.toFixed(0)} / 5
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={currentScore}
              onChange={(e) => handleScoreChange(parseFloat(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-primary/50 px-1">
              <span>完全不符合 (1)</span>
              <span>非常符合 (5)</span>
            </div>
          </div>
        </div>
      )}

      {/* 导航按钮 */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="btn-secondary flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          上一题
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="btn-primary flex items-center gap-2 cursor-pointer"
          >
            下一题
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !allAnswered}
            className="btn-primary flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? '提交中...' : '提交'}
          </button>
        )}
      </div>
    </div>
  );
}
