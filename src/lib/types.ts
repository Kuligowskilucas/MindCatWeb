export type Role = 'patient' | 'pro' | 'admin';

export interface UserProfile {
  id: number;
  user_id: number;
  crp?: string | null;
  bio?: string | null;
  consent_share_with_professional: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  profile?: UserProfile | null;
  created_at: string;
  updated_at: string;
}

export interface Mood {
  id: number;
  user_id: number;
  mood: 1 | 2 | 3 | 4 | 5;
  note?: string | null;
  created_at: string;
}

export interface DiaryEntry {
  id: number;
  title?: string | null;
  content: string;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  done: boolean;
  patient_id: number;
  pro_id: number;
  created_at: string;
}