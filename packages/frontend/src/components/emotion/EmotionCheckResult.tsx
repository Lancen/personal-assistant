'use client';

import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';

interface EmotionCheckResultProps {
  totalScore: number;
  isBelowThreshold: boolean;
  suggestion?: string;
  dimensionScores: Record<string, number>;
  threshold: number;
}

export default function EmotionCheckResult({
  totalScore,
  isBelowThreshold,
  suggestion,
  dimensionScores,
  threshold,
}: EmotionCheckResultProps) {
  return (
    <div className="space-y-6">
      {/* 总分卡片 */}
      <div className={`soft-card p-6 text-center ${isBelowThreshold ? 'border-amber-300' : 'border-green-300'}`}>
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary/10">
          <Heart className={`w-8 h-8 ${isBelowThreshold ? 'text-amber-500' : 'text-green-500'}`} />
        </div>
        <h3 className="text-3xl font-bold text-foreground mb-1">
          {totalScore} <span className="text-lg font-normal text-muted-foreground">/ 50</span>
        </h3>
        <p className={`text-sm font-medium ${isBelowThreshold ? 'text-amber-600' : 'text-green-600'}`}>
          {isBelowThreshold ? '情绪偏低' : '情绪良好'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          阈值: {threshold}
        </p>
      </div>

      {/* 建议 */}
      {suggestion && (
        <div className="soft-card p-4 bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-800">{suggestion}</p>
        </div>
      )}

      {/* 维度得分 */}
      <div className="soft-card p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">维度得分</h4>
        <div className="space-y-3">
          {Object.entries(dimensionScores).map(([dimension, score]) => (
            <div key={dimension}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground">{dimension}</span>
                <span className="text-muted-foreground">{score.toFixed(1)} / 5</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(score / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      {isBelowThreshold && (
        <Link href="/emotion/new" className="btn-primary py-2.5 px-6 w-full flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          记录一条情绪
        </Link>
      )}
    </div>
  );
}
