export interface Prayer {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  is_answered: boolean;
  is_archived: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreatePrayerRequest {
  title: string;
  description?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface UpdatePrayerRequest {
  title?: string;
  description?: string;
  category?: string;
  is_answered?: boolean;
  is_archived?: boolean;
  metadata?: Record<string, any>;
}

export type PrayerCategory =
  | "personal"
  | "family"
  | "friends"
  | "health"
  | "work"
  | "other";

export type PrayerStatus = "active" | "answered" | "archived";