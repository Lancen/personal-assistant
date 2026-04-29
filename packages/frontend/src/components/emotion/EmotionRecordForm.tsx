'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const EMOTION_TYPES = ['快乐', '满足', '平静', '期待', '感恩', '焦虑', '悲伤', '愤怒', '恐惧', '厌恶', '羞耻', '内疚', '惊讶', '困惑'];

const EMOTION_ICONS: Record<string, string> = {
  '快乐': '😊', '满足': '😌', '平静': '😐', '期待': '🤩',
  '感恩': '🙏', '焦虑': '😰', '悲伤': '😢', '愤怒': '😡',
  '恐惧': '😨', '厌恶': '🤢', '羞耻': '😳', '内疚': '😔',
  '惊讶': '😲', '困惑': '😕',
};

interface EmotionRecordFormProps {
  initialData?: {
    recordId?: string;
    event?: string;
    emotionType?: string;
    emotionIntensity?: number;
    need?: string;
  };
  onSubmit: (data: {
    event: string;
    emotionType: string;
    emotionIntensity: number;
    need: string;
    aiRecognizedEmotion?: string;
    aiRecognizedIntensity?: number;
  }) => Promise<void>;
  submitLabel?: string;
}

export default function EmotionRecordForm({ initialData, onSubmit, submitLabel = '保存' }: EmotionRecordFormProps) {
  const [event, setEvent] = useState(initialData?.event || '');
  const [emotionType, setEmotionType] = useState(initialData?.emotionType || '');
  const [emotionIntensity, setEmotionIntensity] = useState(initialData?.emotionIntensity || 3);
  const [need, setNeed] = useState(initialData?.need || '');
  const [aiSuggestion, setAiSuggestion] = useState<{ emotionType: string; intensity: number } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleAIRecognize() {
    if (!event.trim() && !need.trim()) {
      setAiError('请先填写事件或需求描述');
      return;
    }

    setAiLoading(true);
    setAiError('');
    setAiSuggestion(null);

    try {
      const text = [event, need].filter(Boolean).join('。');
      const res = await api.ai.recognize(text);
      if (res.success && res.data) {
        setAiSuggestion({
          emotionType: res.data.emotionType,
          intensity: res.data.intensity,
        });
      }
    } catch {
      setAiError('AI 暂不可用');
    } finally {
      setAiLoading(false);
    }
  }

  function adoptSuggestion() {
    if (aiSuggestion) {
      setEmotionType(aiSuggestion.emotionType);
      setEmotionIntensity(aiSuggestion.intensity);
      setAiSuggestion(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!event.trim() || !emotionType || !need.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        event: event.trim(),
        emotionType,
        emotionIntensity,
        need: need.trim(),
        aiRecognizedEmotion: aiSuggestion?.emotionType,
        aiRecognizedIntensity: aiSuggestion?.intensity,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 事件 */}
      <div>
        <label className="form-label block text-sm font-medium text-foreground mb-2">发生了什么？</label>
        <textarea
          value={event}
          onChange={e => setEvent(e.target.value)}
          placeholder="描述今天发生的事件..."
          rows={3}
          className="form-input w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          required
        />
      </div>

      {/* AI 识别按钮 */}
      <div>
        <button
          type="button"
          onClick={handleAIRecognize}
          disabled={aiLoading}
          className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
        >
          {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {aiLoading ? '识别中...' : 'AI 识别情绪'}
        </button>

        {aiSuggestion && (
          <div className="mt-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-sm text-foreground">
              AI 建议: {EMOTION_ICONS[aiSuggestion.emotionType] || ''} {aiSuggestion.emotionType} (强度 {aiSuggestion.intensity})
            </p>
            <button type="button" onClick={adoptSuggestion} className="mt-2 text-sm text-accent hover:underline">
              采纳建议
            </button>
          </div>
        )}

        {aiError && (
          <p className="mt-2 text-sm text-destructive">{aiError}</p>
        )}
      </div>

      {/* 情绪类型 */}
      <div>
        <label className="form-label block text-sm font-medium text-foreground mb-2">你的情绪</label>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {EMOTION_TYPES.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setEmotionType(type)}
              className={`p-2 rounded-lg text-center text-sm transition-all ${
                emotionType === type
                  ? 'bg-primary text-primary-foreground shadow-soft-sm'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              <span className="text-lg block">{EMOTION_ICONS[type]}</span>
              <span className="text-xs">{type}</span>
            </button>
          ))}
        </div>
        <input type="hidden" value={emotionType} required />
      </div>

      {/* 强度 */}
      <div>
        <label className="form-label block text-sm font-medium text-foreground mb-2">
          情绪强度: <span className="text-primary font-bold">{emotionIntensity.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min="1"
          max="5"
          step="0.01"
          value={emotionIntensity}
          onChange={e => setEmotionIntensity(parseFloat(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>1 微弱</span>
          <span>3 中等</span>
          <span>5 强烈</span>
        </div>
      </div>

      {/* 需求 */}
      <div>
        <label className="form-label block text-sm font-medium text-foreground mb-2">你的需求</label>
        <textarea
          value={need}
          onChange={e => setNeed(e.target.value)}
          placeholder="你此刻需要什么？"
          rows={3}
          className="form-input w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          required
        />
      </div>

      {/* 提交 */}
      <button
        type="submit"
        disabled={submitting || !event.trim() || !emotionType || !need.trim()}
        className="btn-primary py-2.5 px-6 w-full disabled:opacity-50"
      >
        {submitting ? '保存中...' : submitLabel}
      </button>
    </form>
  );
}
