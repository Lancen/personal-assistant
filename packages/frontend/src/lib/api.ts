const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ConversationSummary {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: number;
  messageCount: number;
}

export const api = {
  // Generic HTTP methods
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  patch: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, {
      method: 'DELETE',
    }),
  put: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  auth: {
    login: (email: string, password: string) =>
      apiRequest<{ token: string; user: { id: string; email: string; name: string } }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (name: string, email: string, password: string) =>
      apiRequest<{ token: string; user: { id: string; email: string; name: string } }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),
    me: () => apiRequest<{ user: { id: string; email: string; name: string } }>('/api/auth/me'),
  },

  conversations: {
    list: () => apiRequest<{ conversations: ConversationSummary[] }>('/api/conversations'),
    get: (id: string) => apiRequest<{ conversation: Conversation }>(`/api/conversations/${id}`),
    create: () => apiRequest<{ conversation: Conversation }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ title: 'New Conversation' }),
    }),
    sendMessage: (id: string, content: string) =>
      apiRequest<{ message: ChatMessage }>(`/api/conversations/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    delete: (id: string) => apiRequest<void>(`/api/conversations/${id}`, {
      method: 'DELETE',
    }),
  },

  emotion: {
    records: {
      list: (page?: number, pageSize?: number) =>
        api.get<{ success: true; data: any[]; pagination: any }>(
          `/api/emotion/records?page=${page || 1}&pageSize=${pageSize || 20}`
        ),
      get: (id: string) =>
        api.get<{ success: true; data: any }>(`/api/emotion/records/${id}`),
      create: (data: { event: string; emotionType: string; emotionIntensity: number; need: string; recordDate?: string }) =>
        api.post<{ success: true; data: any }>('/api/emotion/records', data),
      update: (id: string, data: { event?: string; emotionType?: string; emotionIntensity?: number; need?: string; aiRecognizedEmotion?: string; aiRecognizedIntensity?: number }) =>
        api.put<{ success: true; data: any }>(`/api/emotion/records/${id}`, data),
      delete: (id: string) =>
        api.delete<{ success: true }>(`/api/emotion/records/${id}`),
    },
  },

  emotionCheck: {
    status: () =>
      api.get<{ success: true; data: any }>('/api/emotion-check/status'),
    generate: () =>
      api.post<{ success: true; data: any }>('/api/emotion-check/generate'),
    submit: (answers: { questionId: number; score: number }[]) =>
      api.post<{ success: true; data: any }>('/api/emotion-check/submit', { answers }),
    history: (page?: number, pageSize?: number) =>
      api.get<{ success: true; data: any[]; pagination: any }>(
        `/api/emotion-check/history?page=${page || 1}&pageSize=${pageSize || 20}`
      ),
  },

  ai: {
    recognize: (text: string) =>
      api.post<{ success: true; data: any }>('/api/ai/recognize', { text }),
  },

  settings: {
    get: () =>
      api.get<{ success: true; data: any }>('/api/settings'),
    update: (data: { aiProvider?: string; aiModel?: string; apiKey?: string; emotionThreshold?: number; notificationEnabled?: boolean }) =>
      api.put<{ success: true; data: any }>('/api/settings', data),
    testAI: (data: { aiProvider: string; aiModel: string; apiKey: string }) =>
      api.post<{ success: true; data: any }>('/api/settings/test-ai', data),
  },
};

export default api;
