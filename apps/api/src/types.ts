export interface AuthProject {
  id: string;
  name: string;
  apiKey: string;
  createdAt: string;
}

export interface RecordRow {
  id: string;
  project_id: string;
  collection: string;
  record_key: string;
  data_jsonb: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EventRow {
  id: string;
  project_id: string;
  event_name: string;
  payload_json: Record<string, unknown>;
  created_at: string;
}

export interface DashboardUser {
  id: string;
  robloxUserId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSession {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string | null;
  tokenType: string;
  scope: string;
  expiresAt: string | null;
  createdAt: string;
  lastSeenAt: string;
}

export interface AccessibleProject {
  id: string;
  name: string;
  created_at: string;
  role: string;
}
