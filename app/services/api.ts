import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'shiplog_jwt_token';
const BASE_URL_KEY = 'shiplog_api_base_url';

// Default base URL:
// For Android emulator: 10.0.2.2 is localhost on host machine
// For physical Android / iOS: Default to localhost:5001 or production Render URL
export const DEFAULT_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';

let currentBaseUrl = DEFAULT_API_URL;

// Cross-platform key-value storage adapter (localStorage for web, SecureStore for native)
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      } catch {
        return null;
      }
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
      } catch {}
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined') window.localStorage.removeItem(key);
      } catch {}
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  }
};

export const setApiBaseUrl = async (url: string) => {
  currentBaseUrl = url.trim().replace(/\/+$/, '');
  await storage.setItem(BASE_URL_KEY, currentBaseUrl);
};

export const getApiBaseUrl = async () => {
  const saved = await storage.getItem(BASE_URL_KEY);
  if (saved) {
    currentBaseUrl = saved;
    return saved;
  }
  return currentBaseUrl;
};

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: currentBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Token & dynamic BaseURL
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await storage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const storedUrl = await storage.getItem(BASE_URL_KEY);
    if (storedUrl) {
      config.baseURL = storedUrl;
    }
  } catch (e) {}
  return config;
});

// Storage Helpers
export const storeToken = async (token: string) => {
  await storage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
  return await storage.getItem(TOKEN_KEY);
};

export const removeToken = async () => {
  await storage.deleteItem(TOKEN_KEY);
};

// API Methods
export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/api/auth/login', data),
  getMe: () => apiClient.get('/api/auth/me'),
  updatePushToken: (token: string) =>
    apiClient.patch('/api/auth/push-token', { token }),

  // Team
  createTeam: (name: string) => apiClient.post('/api/team/create', { name }),
  joinTeam: (code: string) => apiClient.post('/api/team/join', { code }),
  getCrew: () => apiClient.get('/api/team/crew'),

  // Entries
  getEntries: (params?: { tag?: string; userId?: string; page?: number; limit?: number }) =>
    apiClient.get('/api/entries', { params }),
  createEntry: (data: { text: string; tag: string }) =>
    apiClient.post('/api/entries', data),
  deleteEntry: (id: string) => apiClient.delete(`/api/entries/${id}`),

  // Cheers
  toggleCheer: (entryId: string) => apiClient.post(`/api/cheers/${entryId}`),

  // Stats / Heatmap
  getStats: (target: 'team' | string = 'team') =>
    apiClient.get('/api/stats', { params: { target } }),

  // Milestones (Route)
  getMilestones: () => apiClient.get('/api/milestones'),
  createMilestone: (data: { name: string; status?: string; subLabel?: string }) =>
    apiClient.post('/api/milestones', data),
  updateMilestone: (id: string, data: { name?: string; status?: string; subLabel?: string }) =>
    apiClient.patch(`/api/milestones/${id}`, data),
  deleteMilestone: (id: string) => apiClient.delete(`/api/milestones/${id}`),
  reorderMilestones: (orderedIds: string[]) =>
    apiClient.post('/api/milestones/reorder', { orderedIds }),

  // DSA
  getDsaProblems: () => apiClient.get('/api/dsa/problems'),
  updateDsaProgress: (problemId: string, status?: 'todo' | 'done') =>
    apiClient.patch(`/api/dsa/progress/${problemId}`, { status }),

  // GitHub
  getGithubAuthUrl: () => apiClient.get('/api/github/auth-url'),
  syncGithubCommits: () => apiClient.post('/api/github/sync'),

  // Nudge
  sendNudge: (userId: string) => apiClient.post(`/api/nudge/${userId}`),
};
