'use client';

import { useState } from 'react';
import { EmotionRecord, EmotionRecognitionResult } from '@personal-assistant/types';
import { Zap } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const COMMON_EMOTIONS = [
  '快乐', '平静', '兴奋', '焦虑', '紧张',
  '悲伤', '愤怒', '沮丧', '惊讶', '厌恶',
];

export interface EmotionFormData {
  event: string;
  emotionType: string;
  emotionIntensity: number;
  need: string;
  recordDate: string;
  aiRecognizedEmotion?: string;
  aiRecognizedIntensity?: number;
}

interface EmotionRecordFormProps {
  initialData?: Partial<EmotionRecord>;
  onSubmit: (data: EmotionFormData) => Promise<void>;
  submitText: string;
}

export default function EmotionRecordForm({
  initialData,
  onSubmit,
  submitText,
}: EmotionRecordFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<EmotionFormData>({
    event: initialData?.event || '',
    emotionType: initialData?.emotionType || '',
    emotionIntensity: initialData?.emotionIntensity || 3.00,
    need: initialData?.need || '',
    recordDate: initialData?.recordDate || today,
    aiRecognizedEmotion: initialData?.aiRecognizedEmotion,
    aiRecognizedIntensity: initialData?.aiRecognizedIntensity,
  });

  const [recognizing, setRecognizing] = useState(false);
  const [recognized, setRecognized] = useState(false);

  async function handleAecognize() {
    if (!formData.event.trim()) {
      return;
    }

    setRecognizing(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/emotion/recognize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token!}`,
        },
        body: JSON.stringify({ text: formData.event }),
      });
      const data = await response.json();
      if (data.success) {
        const result = data.data as EmotionRecognitionResult;
        setFormData(prev => ({
          ...prev,
          aiRecognizedEmotion: result.emotionType,
          aiRecognizedIntensity: result.intensity,
        }));
        setRecognized(true);

        // 如果用户还没选择，自动应用AI结果
        if (!formData.emotionType) {
          setFormData(prev => ({
            ...prev,
            emotionType: result.emotionType,
            emotionIntensity: result.intensity,
          }));
        }
      }
    } catch (error) {
      console.error('AI recognition failed:', error);
    } finally {
      setRecognizing(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(formData);
  }

  function applyAiRecommendation() {
    if (formData.aiRecognizedEmotion && formData.aiRecognizedIntensity) {
      setFormData(prev => ({
        ...prev,
        emotionType: prev.aiRecognizedEmotion!,
        emotionIntensity: prev.aiRecognizedIntensity!,
      }));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 日期 */}
      <div className="space-y-2">
        <label htmlFor="recordDate" className="block text-sm font-medium text-foreground">
          记录日期
        </label>
        <input
          type="date"
          id="recordDate"
          value={formData.recordDate}
          onChange={(e) => setFormData(prev => ({ ...prev, recordDate: e.target.value }))}
          className="input w-full"
          required
        />
      </div>

      {/* 事件 */}
      <div className="space-y-2">
        <label htmlFor="event" className="block text-sm font-medium text-foreground">
          1. 事件（客观描述发生了什么）
        </label>
        <textarea
          id="event"
          value={formData.event}
          onChange={(e) => setFormData(prev => ({ ...prev, event: e.target.value }))}
          placeholder="客观描述发生了什么，避免加入太多主观判断..."
          className="input w-full min-h-[120px] resize-y"
          required
        />
      </div>

      {/* AI识别按钮 */}
      <div>
        <button
          type="button"
          onClick={handleAecognize}
          disabled={recognizing || !formData.event}
          className="btn-secondary flex items-center gap-2 cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          {recognizing ? 'AI识别中...' : 'AI识别情绪'}
        </button>

        {recognized && formData.aiRecognizedEmotion && (
          <div className="mt-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-sm font-medium text-foreground mb-2">AI识别结果：</p>
            <p className="text-sm text-primary/70 mb-2">
              情绪：<strong>{formData.aiRecognizedEmotion}</strong>，强度：<strong>{formData.aiRecognizedIntensity?.toFixed(2)}</strong>
            </p>
            {formData.emotionType !== formData.aiRecognizedEmotion && (
              <button
                type="button"
                onClick={applyAiRecommendation}
                className="text-sm text-accent hover:text-accent/80 font-medium cursor-pointer"
              >
                应用这个结果 →
              </button>
            )}
          </div>
        )}
      </div>

      {/* 情绪类型 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          2. 情绪类型
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {COMMON_EMOTIONS.map((emotion) => (
            <button
              key={emotion}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, emotionType: emotion }))}
              className={`
                px-3 py-2 rounded text-sm border cursor-pointer transition-colors
                ${formData.emotionType === emotion
                  ? 'bg-accent text-white border-accent'
                  : 'border-border bg-background hover:bg-muted'
                }
              `}
            >
              {emotion}
            </button>
          ))}
        </div>
      </div>

      {/* 情绪强度 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground">
            3. 情绪强度
          </label>
          <span className="text-sm text-primary/70">
            {formData.emotionIntensity.toFixed(2)} / 5
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          step="0.01"
          value={formData.emotionIntensity}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            emotionIntensity: parseFloat(e.target.value),
          }))}
          className="w-full accent-accent"
        />
        <div className="flex justify-between text-xs text-primary/50 px-1">
          <span>微弱 (1)</span>
          <span>中等 (3)</span>
          <span>强烈 (5)</span>
        </div>
      </div>

      {/* 需求 */}
      <div className="space-y-2">
        <label htmlFor="need" className="block text-sm font-medium text-foreground">
          4. 需求（你真正想要什么）
        </label>
        <textarea
          id="need"
          value={formData.need}
          onChange={(e) => setFormData(prev => ({ ...prev, need: e.target.value }))}
          placeholder="你内心真正想要的是什么..."
          className="input w-full min-h-[100px] resize-y"
          required
        />
      </div>

      {/* 提交按钮 */}
      <button
        type="submit"
        className="btn-primary w-full cursor-pointer"
      >
        {submitText}
      </button>
    </form>
  );
}
