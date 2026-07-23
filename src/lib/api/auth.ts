import { http } from '@/lib/http';
import { setAccessToken } from '@/lib/authToken';
import type { Role, User } from '@/lib/types';

interface AuthResponse {
  message: string;
  user: User;
  token: string;
  expires_in: number;
}

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await http.post<AuthResponse>('/login', { email, password });
    setAccessToken(res.token);
    return res;
  },

  register: async (data: { name: string; email: string; password: string; role: Role }) => {
    const res = await http.post<AuthResponse>('/register', data);
    setAccessToken(res.token);
    return res;
  },

  logout: async () => {
    try {
      return await http.post<{ message: string }>('/logout');
    } finally {
      setAccessToken(null);
    }
  },

  me: () => http.get<User>('/me', { silent401: true }),

  forgotPassword: (email: string) =>
    http.post<{ message: string }>('/forgot-password', { email }),

  resetPassword: (data: { email: string; code: string; password: string }) =>
    http.post<{ message: string }>('/reset-password', data),
};