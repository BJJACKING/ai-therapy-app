import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },
  anonymousLogin: async () => {
    const response = await api.post('/auth/anonymous');
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Chat API
export const chatAPI = {
  sendMessage: async (message: string, aiRole: string = 'gentle', history: any[] = []) => {
    const response = await api.post('/chat', { message, aiRole, history });
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/chat/history');
    return response.data;
  },
  clearHistory: async () => {
    const response = await api.delete('/chat/clear');
    return response.data;
  }
};

// Diary API
export const diaryAPI = {
  create: async (data: any) => {
    const response = await api.post('/diary', data);
    return response.data;
  },
  list: async (params?: any) => {
    const response = await api.get('/diary', { params });
    return response.data;
  },
  stats: async (days: number = 7) => {
    const response = await api.get(`/diary/stats?days=${days}`);
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get(`/diary/${id}`);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/diary/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/diary/${id}`);
    return response.data;
  }
};

// Assessment API
export const assessmentAPI = {
  get: async (type: string) => {
    const response = await api.get(`/assessments/${type}`);
    return response.data;
  },
  submit: async (type: string, answers: any[]) => {
    const response = await api.post(`/assessments/${type}/submit`, { answers });
    return response.data;
  },
  history: async (type: string) => {
    const response = await api.get(`/assessments/${type}/history`);
    return response.data;
  }
};

// User API
export const userAPI = {
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  update: async (data: any) => {
    const response = await api.patch('/users/me', data);
    return response.data;
  },
  delete: async () => {
    const response = await api.delete('/users/me');
    return response.data;
  },
  stats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  }
};

export default api;
