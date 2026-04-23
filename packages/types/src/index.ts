// 共享类型定义

// 消息类型
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

// 对话会话
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// API 响应格式
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 成功响应
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// 失败响应
export interface ErrorResponse {
  success: false;
  error: string;
}

// 分页信息
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 分页响应
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationInfo;
}

// 默认分页大小
export const DEFAULT_PAGE_SIZE = 20;

// 用户信息
export interface User {
  id: string;
  userId: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

// 情绪记录
export interface EmotionRecord {
  id: string;
  userId: string;
  event: string;
  emotionType?: string;
  emotionIntensity?: number;
  need: string;
  aiRecognizedEmotion?: string;
  aiRecognizedIntensity?: number;
  recordDate: string;
  createdAt: string;
  updatedAt: string;
}

// 情绪检测问题
export interface EmotionQuestion {
  id: number;
  dimension: string;
  questionText: string;
}

// 每日情绪检测结果
export interface EmotionDailyCheck {
  id: number;
  userId: string;
  checkDate: string;
  totalScore: number;
  isBelowThreshold: boolean;
  questions: Array<{
    questionId: number;
    questionText: string;
    dimension: string;
    score: number;
  }>;
  createdAt: string;
}

// 情绪分析结果
export interface EmotionAnalysisResult {
  trendData: Array<{
    date: string;
    score: number;
  }>;
  emotionDistribution: Array<{
    emotion: string;
    count: number;
    percentage: number;
  }>;
  aiSummary: {
    commonTriggers: string[];
    conclusion: string;
    suggestions: string[];
  };
}

// AI情绪识别结果
export interface EmotionRecognitionResult {
  emotionType: string;
  intensity: number;
}
