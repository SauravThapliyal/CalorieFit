import axios from 'axios';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserProfile,
  CreateUserProfileRequest,
  Exercise,
  Food,
  CreateFoodRequest,
  DietLog,
  CreateDietLogRequest,
} from '../types';

const API_BASE_URL = 'http://localhost:5263/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
};

export const userProfileApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/userprofile');
    return response.data;
  },

  createProfile: async (data: CreateUserProfileRequest): Promise<UserProfile> => {
    const response = await api.post('/userprofile', data);
    return response.data;
  },

  updateProfile: async (data: CreateUserProfileRequest): Promise<UserProfile> => {
    const response = await api.put('/userprofile', data);
    return response.data;
  },
};

export const exerciseApi = {
  getAll: async (params?: any): Promise<any> => {
    const response = await api.get('/exercise', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Exercise> => {
    const response = await api.get(`/exercise/${id}`);
    return response.data;
  },

  logExercise: async (data: any): Promise<any> => {
    const response = await api.post('/exercise/logs', data);
    return response.data;
  },

  getExerciseLogs: async (date?: string): Promise<any> => {
    console.log('Fetching exercise logs with date:', date);
    const response = await api.get('/exercise/logs', { params: { date } });
    console.log('Exercise logs response:', response.data);
    return response.data;
  },

  // Admin methods
  getAllAdmin: async (): Promise<any[]> => {
    const response = await api.get('/admin/exercises');
    return response.data;
  },

  getByIdAdmin: async (id: number): Promise<any> => {
    const response = await api.get(`/admin/exercises/${id}`);
    return response.data;
  },

  create: async (exerciseData: any): Promise<any> => {
    const response = await api.post('/admin/exercises', exerciseData);
    return response.data;
  },

  update: async (id: number, exerciseData: any): Promise<any> => {
    const response = await api.put(`/admin/exercises/${id}`, exerciseData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/exercises/${id}`);
  },

  uploadImage: async (id: number, imageFile: File): Promise<any> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await api.post(`/admin/exercises/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const foodApi = {
  getAll: async (params?: any): Promise<Food[]> => {
    const response = await api.get('/food', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Food> => {
    const response = await api.get(`/food/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/food/categories');
    return response.data;
  },

  create: async (food: any): Promise<any> => {
    const response = await api.post('/admin/foods', food);
    return response.data;
  },

  // Admin methods
  getAllAdmin: async (): Promise<any[]> => {
    const response = await api.get('/admin/foods');
    return response.data;
  },

  getByIdAdmin: async (id: number): Promise<any> => {
    const response = await api.get(`/admin/foods/${id}`);
    return response.data;
  },

  update: async (id: number, foodData: any): Promise<any> => {
    const response = await api.put(`/admin/foods/${id}`, foodData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/foods/${id}`);
  },
};

export const dietLogApi = {
  getDietLogs: async (date?: string): Promise<any> => {
    const response = await api.get('/dietlog', { params: { date } });
    return response.data;
  },

  logFood: async (data: any): Promise<any> => {
    const response = await api.post('/dietlog', data);
    return response.data;
  },

  updateDietLog: async (id: number, data: any): Promise<any> => {
    const response = await api.put(`/dietlog/${id}`, data);
    return response.data;
  },

  deleteDietLog: async (id: number): Promise<any> => {
    const response = await api.delete(`/dietlog/${id}`);
    return response.data;
  },

  getDailySummary: async (date?: string): Promise<any> => {
    const response = await api.get('/dietlog/daily-summary', { params: { date } });
    return response.data;
  },
};

export const achievementApi = {
  getAll: async (): Promise<any> => {
    const response = await api.get('/achievement');
    return response.data;
  },

  getUserAchievements: async (): Promise<any> => {
    const response = await api.get('/achievement/user');
    return response.data;
  },

  checkAchievements: async (): Promise<any> => {
    const response = await api.post('/achievement/check');
    return response.data;
  },

  // Admin methods
  getAllAdmin: async (): Promise<any[]> => {
    const response = await api.get('/admin/achievements');
    return response.data;
  },

  getByIdAdmin: async (id: number): Promise<any> => {
    const response = await api.get(`/admin/achievements/${id}`);
    return response.data;
  },

  create: async (achievementData: any): Promise<any> => {
    const response = await api.post('/admin/achievements', achievementData);
    return response.data;
  },

  update: async (id: number, achievementData: any): Promise<any> => {
    const response = await api.put(`/admin/achievements/${id}`, achievementData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/achievements/${id}`);
  },
};

export const streakApi = {
  getCurrentStreak: async (): Promise<any> => {
    const response = await api.get('/streak/current');
    return response.data;
  },

  updateStreak: async (): Promise<any> => {
    const response = await api.post('/streak/update');
    return response.data;
  },

  getStreakCalendar: async (year?: number, month?: number): Promise<any> => {
    const response = await api.get('/streak/calendar', { params: { year, month } });
    return response.data;
  },

  getStreakStats: async (): Promise<any> => {
    const response = await api.get('/streak/stats');
    return response.data;
  },
};

export const weightApi = {
  getWeightRecords: async (days?: number): Promise<any> => {
    const response = await api.get('/weight', { params: { days } });
    return response.data;
  },

  logWeight: async (data: any): Promise<any> => {
    const response = await api.post('/weight', data);
    return response.data;
  },

  getWeightProgress: async (): Promise<any> => {
    const response = await api.get('/weight/progress');
    return response.data;
  },

  getLatestWeight: async (): Promise<any> => {
    const response = await api.get('/weight/latest');
    return response.data;
  },
};

// Admin API for user management
export const userApi = {
  getAll: async (): Promise<any[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getById: async (id: number): Promise<any> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  update: async (id: number, userData: any): Promise<any> => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
};

export default api;
