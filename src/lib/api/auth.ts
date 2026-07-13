import { http } from '@/lib/http';
import type { Role, User } from '@/lib/types';

interface AuthResponse {
  message: string;
  user: User;
}

export const authApi = {
  login: (email: string, password: string) =>
    http.post<AuthResponse>('/login', { email, password }),

  register: (data: { name: string; email: string; password: string; role: Role }) =>
    http.post<AuthResponse>('/register', data),

  logout: () => http.post<{ message: string }>('/logout'),

  me: () => http.get<User>('/me', { silent401: true }),

  forgotPassword: (email: string) =>
    http.post<{ message: string }>('/forgot-password', { email }),

  resetPassword: (data: { email: string; code: string; password: string }) =>
    http.post<{ message: string }>('/reset-password', data),
};