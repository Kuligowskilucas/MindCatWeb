export type Role = 'patient' | 'pro' | 'admin';

export type TreatmentType = 'pre_defined' | 'ai_based';

export interface UserProfile {
  id: number;
  user_id: number;
  use_ai: boolean;
  treatment_type: TreatmentType | null;
  tdah_reminder: boolean;
  push_notifications: boolean;
  progress_bar: boolean;
  consent_share_with_professional: boolean;
  // diary_password_hash NUNCA vem na API (getProfile faz makeHidden)
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

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface Mood {
  id: number;
  user_id: number;
  mood_level: MoodLevel;
  mood_description: string | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface DiaryEntry {
  id: number;
  user_id: number;
  content: string; // criptografado no banco, decriptado pela API
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'active' | 'done';

export interface Task {
  id: number;
  pro_id: number;
  patient_id: number;
  title: string;
  status: TaskStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}