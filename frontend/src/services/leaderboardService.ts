import axios from 'axios';

// In production, always use relative paths. In development, use the proxy.
const API_BASE_URL = import.meta.env.PROD ? '' : '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const leaderboardService = {
  async getBountyLeaderboard(month: string): Promise<any[]> {
    const response = await api.get(`/api/dashboard/leaderboard/bounty?month=${month}`);
    return Array.isArray(response.data) ? response.data : [];
  },
  async getQuestsLeaderboard(month: string): Promise<any[]> {
    const response = await api.get(`/api/dashboard/leaderboard/quests?month=${month}`);
    return Array.isArray(response.data) ? response.data : [];
  },
};
