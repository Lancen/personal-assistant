import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmotionRecordForm from '../EmotionRecordForm';

const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock API
const mockRecognize = vi.fn();
vi.mock('@/lib/api', () => ({
  api: {
    ai: {
      recognize: (...args: any[]) => mockRecognize(...args),
    },
    emotion: {
      records: {
        create: vi.fn().mockResolvedValue({ success: true, data: { recordId: 'test-uuid' } }),
        update: vi.fn().mockResolvedValue({ success: true }),
      },
    },
  },
}));

describe('AC-3 前端: AI 情绪识别降级', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('AI 不可用时显示提示，用户仍可手动保存', async () => {
    mockRecognize.mockRejectedValue(new Error('AI service unavailable'));

    render(<EmotionRecordForm onSubmit={mockOnSubmit} />);

    // 填写事件（textarea, placeholder: "描述今天发生的事件..."）
    const eventTextarea = screen.getByPlaceholderText(/描述今天发生/);
    await userEvent.type(eventTextarea, '今天心情不好');

    // 填写需求
    const needTextarea = screen.getByPlaceholderText(/你此刻需要什么/);
    await userEvent.type(needTextarea, '需要休息');

    // 点击 AI 识别情绪按钮
    const aiButton = screen.getByRole('button', { name: /AI.*识别/i });
    await userEvent.click(aiButton);

    // AI 失败后应显示不可用提示
    await waitFor(() => {
      expect(screen.getByText(/暂不可用|不可用|失败/i)).toBeInTheDocument();
    });

    // 手动选择情绪类型（按钮网格）
    const sadButton = screen.getByRole('button', { name: /悲伤/i });
    await userEvent.click(sadButton);

    // 保存按钮应可用
    const saveButton = screen.getByRole('button', { name: /保存/i });
    expect(saveButton).not.toBeDisabled();
  });

  it('AI 识别成功后显示建议可采纳', async () => {
    mockRecognize.mockResolvedValue({
      success: true,
      data: { emotionType: '悲伤', intensity: 4.2, confidence: 0.88 },
    });

    render(<EmotionRecordForm onSubmit={mockOnSubmit} />);

    // 填写表单
    const eventTextarea = screen.getByPlaceholderText(/描述今天发生/);
    await userEvent.type(eventTextarea, '今天被人批评了');

    const needTextarea = screen.getByPlaceholderText(/你此刻需要什么/);
    await userEvent.type(needTextarea, '需要安慰');

    // 点击 AI 识别
    const aiButton = screen.getByRole('button', { name: /AI.*识别/i });
    await userEvent.click(aiButton);

    // 应显示 AI 建议文本
    await waitFor(() => {
      expect(screen.getByText(/AI 建议/)).toBeInTheDocument();
    });

    // 采纳按钮
    const adoptButton = screen.getByRole('button', { name: /采纳/i });
    await userEvent.click(adoptButton);
  });
});
