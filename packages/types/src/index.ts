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

// 用户信息
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: number;
}
