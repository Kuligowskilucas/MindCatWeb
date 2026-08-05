import { http } from '@/lib/http';
import { setAccessToken } from '@/lib/authToken';
import type { Role, User } from '@/lib/types';

interface AuthResponse {
  message: string;
  user: User;
  token: string;
  expires_in: number;
}

interface TwoFactorRequiredResponse {
  two_factor_required: true;
  challenge: string;
  message: string;
}

export type LoginApiResult = AuthResponse | TwoFactorRequiredResponse;

interface RegisterResponse {
  message: string;
  user: User;
}

interface VerifyEmailResponse {
  message: string;
  already_verified?: boolean;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginApiResult> => {
    const res = await http.post<LoginApiResult>('/login', { email, password });
    if ('token' in res) {
      setAccessToken(res.token);
    }
    return res;
  },

  verifyOtp: async (challenge: string, code: string) => {
    const res = await http.post<AuthResponse>('/login/verify-otp', { challenge, code });
    setAccessToken(res.token);
    return res;
  },

  resendOtp: (challenge: string) => http.post<{ message: string }>('/login/resend-otp', { challenge }),

  register: (data: { name: string; email: string; password: string; role: Role }) =>
    http.post<RegisterResponse>('/register', data),

  verifyEmail: (id: string, hash: string, query: string) =>
    http.get<VerifyEmailResponse>(
      `/email/verify/${id}/${hash}${query ? `?${query}` : ''}`,
    ),

  resendVerification: (email: string) =>
    http.post<{ message: string }>('/email/verification-notification', { email }),

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