import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return axios.request(error.config);
        } catch (refreshError) {
          // Refresh failed, logout
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { api };

// API methods
export const authApi = {
  register: (data: { email: string; username: string; password: string; displayName?: string }) =>
    api.post('/auth/register', data),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  logout: () =>
    api.post('/auth/logout'),

  getCurrentUser: () =>
    api.get('/auth/me'),
};

export const projectApi = {
  list: (params?: any) =>
    api.get('/projects', { params }),

  create: (data: any) =>
    api.post('/projects', data),

  get: (owner: string, slug: string) =>
    api.get(`/projects/${owner}/${slug}`),

  update: (owner: string, slug: string, data: any) =>
    api.patch(`/projects/${owner}/${slug}`, data),

  delete: (owner: string, slug: string) =>
    api.delete(`/projects/${owner}/${slug}`),

  star: (owner: string, slug: string) =>
    api.post(`/projects/${owner}/${slug}/star`),

  unstar: (owner: string, slug: string) =>
    api.delete(`/projects/${owner}/${slug}/star`),

  fork: (owner: string, slug: string) =>
    api.post(`/projects/${owner}/${slug}/fork`),
};

export const fileApi = {
  list: (projectId: string) =>
    api.get(`/files/projects/${projectId}`),

  get: (projectId: string, filePath: string) =>
    api.get(`/files/projects/${projectId}/files/${filePath}`),

  save: (projectId: string, filePath: string, content: string) =>
    api.put(`/files/projects/${projectId}/files/${filePath}`, { content }),

  delete: (projectId: string, filePath: string) =>
    api.delete(`/files/projects/${projectId}/files/${filePath}`),
};

export const aiApi = {
  chat: (data: {
    message: string;
    conversationId?: string;
    projectId?: string;
    contextFiles?: string[];
  }) => api.post('/ai/chat', data),

  getConversation: (id: string) =>
    api.get(`/ai/conversations/${id}`),

  listConversations: (params?: any) =>
    api.get('/ai/conversations', { params }),

  deleteConversation: (id: string) =>
    api.delete(`/ai/conversations/${id}`),
};

export const deploymentApi = {
  create: (data: { projectId: string; deploymentType?: string; environment?: any }) =>
    api.post('/deployments', data),

  get: (id: string) =>
    api.get(`/deployments/${id}`),

  listByProject: (projectId: string, params?: any) =>
    api.get(`/deployments/projects/${projectId}`, { params }),

  getLogs: (id: string) =>
    api.get(`/deployments/${id}/logs`),

  cancel: (id: string) =>
    api.post(`/deployments/${id}/cancel`),
};

export const userApi = {
  get: (username: string) =>
    api.get(`/users/${username}`),

  update: (data: any) =>
    api.patch('/users/me', data),

  getProjects: (username: string, params?: any) =>
    api.get(`/users/${username}/projects`, { params }),

  getStars: (username: string, params?: any) =>
    api.get(`/users/${username}/stars`, { params }),
};
