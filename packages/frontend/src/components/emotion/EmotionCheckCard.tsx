'use client';

interface EmotionCheckCardProps {
  dimension: string;
  questionText: string;
  questionIndex: number;
  totalQuestions: number;
  selectedScore: number | null;
  onSelect: (score: number) => void;
}

export default function EmotionCheckCard({
  dimension,
  questionText,
  questionIndex,
  totalQuestions,
  selectedScore,
  onSelect,
}: EmotionCheckCardProps) {
  const scores = [1, 2, 3, 4, 5];
  const scoreLabels: Record<number, string> = {
    1: '完全不符合',
    2: '比较不符合',
    3: '一般',
    4: '比较符合',
    5: '完全符合',
  };

  return (
    <div className="soft-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
          {dimension}
        </span>
        <span className="text-sm text-muted-foreground">
          {questionIndex + 1} / {totalQuestions}
        </span>
      </div>

      <h3 className="text-lg font-medium text-foreground mb-6">
        {questionText}
      </h3>

      <div className="flex items-center justify-between gap-2">
        {scores.map(score => (
          <button
            key={score}
            type="button"
            onClick={() => onSelect(score)}
            className={`flex-1 py-3 rounded-lg text-center text-sm font-medium transition-all ${
              selectedScore === score
                ? 'bg-primary text-primary-foreground shadow-soft-md'
                : 'bg-muted hover:bg-muted/80 text-foreground'
            }`}
          >
            {score}
          </button>
        ))}
      </div>

      {selectedScore && (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          {scoreLabels[selectedScore]}
        </p>
      )}
    </div>
  );
}
