import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Do not intercept 401s for login or register requests
    if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  auth: {
    register: (data: { email: string; password: string; name: string }) => api.post('/auth/register', data),
    login: (data: { email: string; password: string }) => api.post('/auth/login', data),
    refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
    updateProfile: (data: Record<string, any>) => api.patch('/auth/profile', data),
  },
  dashboard: {
    getSummary: () => api.get('/dashboard/summary'),
  },
  resumes: {
    list: () => api.get('/resumes'),
    getById: (id: string) => api.get(`/resumes/${id}`),
    create: (data: { title: string; content: Record<string, unknown> }) => api.post('/resumes', data),
    update: (id: string, data: Record<string, unknown>) => api.patch(`/resumes/${id}`, data),
    delete: (id: string) => api.delete(`/resumes/${id}`),
    setDefault: (id: string) => api.post(`/resumes/${id}/default`),
    duplicate: (id: string) => api.post(`/resumes/${id}/duplicate`),
    improveBullet: (data: { bullet: string; role?: string; company?: string }) => api.post('/resumes/ai/improve-bullet', data),
    generateSummary: (data?: any) => api.post('/resumes/ai/generate-summary', data),
  },
  ats: {
    getHistory: () => api.get('/ats/history'),
    analyze: (data: { resumeText: string; jobDescription?: string }) => api.post('/ats/analyze', data),
    upload: (formData: FormData) => api.post('/ats/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    enhance: (data: { resumeText: string; jobDescription?: string; atsIssues?: any; historyId?: string | null }) => api.post('/ats/enhance', data),
  },
  portfolio: {
    getBySlug: (slug: string) => api.get(`/portfolio/slug/${slug}`),
    getMine: () => api.get('/portfolio/mine'),
    download: () => api.get('/portfolio/download/mine', { responseType: 'blob' }),
    update: (data: Record<string, unknown>) => api.patch('/portfolio/mine', data),
    generateBio: (data?: { resumeText: string }) => api.post('/portfolio/generate-bio', data),
    extractText: (formData: FormData) => api.post('/portfolio/extract-text', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  },
  jobs: {
    list: (status?: string) => api.get(`/jobs${status ? `?status=${status}` : ''}`),
    getById: (id: string) => api.get(`/jobs/${id}`),
    create: (data: Record<string, unknown>) => api.post('/jobs', data),
    update: (id: string, data: Record<string, unknown>) => api.patch(`/jobs/${id}`, data),
    delete: (id: string) => api.delete(`/jobs/${id}`),
    analytics: () => api.get('/jobs/analytics'),
    search: (params: { query: string; location?: string; type?: string; remote?: boolean; page?: number }) =>
      api.get('/jobs/search', { params }),
  },
  interview: {
    start: (data: { type: string; domain: string }) => api.post('/interview/start', data),
    submitAnswer: (sessionId: string, data: { questionIndex: number; answer: string }) => api.post(`/interview/${sessionId}/answer`, data),
    history: () => api.get('/interview/history'),
    getSession: (id: string) => api.get(`/interview/${id}`),
  },
  coding: {
    listProblems: (params?: { topic?: string; difficulty?: string }) => api.get('/coding/problems', { params }),
    getProblem: (id: string) => api.get(`/coding/problems/${id}`),
    submit: (problemId: string, data: { code: string; language: string }) => api.post(`/coding/problems/${problemId}/submit`, data),
    submissions: (problemId?: string) => api.get(`/coding/submissions${problemId ? `?problemId=${problemId}` : ''}`),
    stats: () => api.get('/coding/stats'),
  },
  skillGap: {
    analyze: (targetRole: string) => api.post('/skill-gap/analyze', { targetRole }),
    updateSkills: (skills: string[]) => api.post('/skill-gap/skills', { skills }),
  },
  roadmaps: {
    getAll: () => api.get('/roadmaps'),
    getById: (id: string) => api.get(`/roadmaps/${id}`),
    updateProgress: (id: string, data: { nodeId: string; completed: boolean }) => api.post(`/roadmaps/${id}/progress`, data),
  },
  autonomous: {
    getConfig: () => api.get('/autonomous/config'),
    updateConfig: (data: any) => api.patch('/autonomous/config', data),
    getLogs: () => api.get('/autonomous/logs'),
  },
  github: {
    getAnalytics: () => api.get('/github/analytics'),
    updateUsername: (username: string) => api.patch('/github/username', { username }),
  },
  chat: {
    send: (message: string) => api.post('/chat/message', { message }),
    history: () => api.get('/chat/history'),
    clear: () => api.delete('/chat/history'),
  },
  admin: {
    stats: () => api.get('/admin/stats'),
    users: () => api.get('/admin/users'),
    updateUserRole: (userId: string, role: string) => api.patch(`/admin/users/${userId}/role`, { role }),
    deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  },
  architect: {
    generateBlueprint: (data: { idea: string }) => api.post('/architect/generate', data),
  },
  simulator: {
    simulateTurn: (data: { role: 'INTERVIEWER' | 'CANDIDATE', jobDescription: string, resumeText?: string, history: any[] }) => api.post('/simulator/turn', data),
  }
};
