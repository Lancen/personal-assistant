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

// 任务四象限类型
export type Quadrant = 'important-urgent' | 'important-not-urgent' | 'urgent-not-important' | 'not-important-not-urgent';

// 任务
export interface Task {
  id: string;
  taskId: string;
  userId: string;
  title: string;
  description?: string;
  quadrant: Quadrant;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  linkedNoteId?: string;
  createdAtTs: string;
  updatedAt: string;
}

// 创建任务请求
export interface CreateTaskRequest {
  title: string;
  description?: string;
  quadrant: Quadrant;
}

// 更新任务请求
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  quadrant?: Quadrant;
  completed?: boolean;
}

// 笔记
export interface Note {
  id: string;
  noteId: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// 创建笔记请求
export interface CreateNoteRequest {
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
}

// 更新笔记请求
export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  tags?: string[];
  isPinned?: boolean;
}

// 日历事件（聚合跨模块活动）
export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: 'task' | 'note';
}

// 任务统计
export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
}

// 笔记统计
export interface NoteStats {
  total: number;
  tags: number;
}

// 情绪记录
export interface EmotionRecord {
  recordId: string;
  userId: string;
  event: string;
  emotionType: string;
  emotionIntensity: number;
  need: string;
  aiRecognizedEmotion?: string;
  aiRecognizedIntensity?: number;
  recordDate: string;
  createdAt: string;
  updatedAt: string;
}

// 创建情绪记录请求
export interface CreateEmotionRecordRequest {
  event: string;
  emotionType: string;
  emotionIntensity: number;
  need: string;
  recordDate?: string;
}

// 更新情绪记录请求
export interface UpdateEmotionRecordRequest {
  event?: string;
  emotionType?: string;
  emotionIntensity?: number;
  need?: string;
  aiRecognizedEmotion?: string;
  aiRecognizedIntensity?: number;
}

// 情绪检测问题
export interface EmotionQuestion {
  id: number;
  dimension: string;
  questionText: string;
  isActive: boolean;
}

// 情绪每日检测
export interface EmotionDailyCheck {
  checkId: string;
  userId: string;
  checkDate: string;
  totalScore: number;
  questionsJson: EmotionCheckQuestion[];
  isBelowThreshold: boolean;
  createdAt: string;
}

// 检测问题（含答案）
export interface EmotionCheckQuestion {
  id: number;
  dimension: string;
  questionText: string;
  score?: number;
}

// 情绪检测状态
export interface EmotionCheckStatus {
  completed: boolean;
  checkDate: string | null;
  totalScore: number | null;
}

// 情绪检测结果
export interface EmotionCheckResult {
  checkId: string;
  totalScore: number;
  isBelowThreshold: boolean;
  suggestion?: string;
  dimensionScores: Record<string, number>;
}

// AI 识别请求
export interface AIRecognizeRequest {
  text: string;
}

// AI 识别结果
export interface AIRecognizeResult {
  emotionType: string;
  intensity: number;
  confidence: number;
}

// 用户设置
export interface UserSettings {
  aiProvider: string;
  aiModel: string;
  hasApiKey: boolean;
  emotionThreshold: number;
  notificationEnabled: boolean;
}

// 更新用户设置请求
export interface UpdateUserSettingsRequest {
  aiProvider?: string;
  aiModel?: string;
  apiKey?: string;
  emotionThreshold?: number;
  notificationEnabled?: boolean;
}

// AI 模型选项
export interface AIModelOption {
  value: string;
  label: string;
}

// AI 模型选项映射
export const AI_MODEL_OPTIONS: Record<string, AIModelOption[]> = {
  zhipu: [
    { value: 'glm-4', label: 'GLM-4' },
    { value: 'glm-4-flash', label: 'GLM-4 Flash' },
  ],
  deepseek: [
    { value: 'deepseek-chat', label: 'DeepSeek Chat' },
    { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner' },
  ],
};
