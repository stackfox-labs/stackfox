import type { DashboardOverview } from "@/lib/dashboard"

const defaultApiBaseUrl = "http://localhost:3443"

function getApiBaseUrl() {
  return (import.meta.env.VITE_STACKFOX_API_URL as string | undefined)?.replace(/\/$/, "") ?? defaultApiBaseUrl
}

export interface AuthProject {
  id: string
  name: string
  created_at: string
  role: string
}

export interface AuthUser {
  id: string
  robloxUserId: string
  username: string
  displayName: string
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthSessionState {
  ok: boolean
  authenticated: boolean
  oauthConfigured: boolean
  user?: AuthUser
  projects?: Array<AuthProject>
}

export async function fetchAuthSession(): Promise<AuthSessionState> {
  const response = await fetch(`${getApiBaseUrl()}/auth/session`, {
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to load auth session: ${response.status}`)
  }

  return (await response.json()) as AuthSessionState
}

export function startRobloxLogin(returnTo = "/dashboard") {
  const loginUrl = new URL(`${getApiBaseUrl()}/auth/roblox/login`)
  loginUrl.searchParams.set("returnTo", returnTo)
  window.location.href = loginUrl.toString()
}

export async function logout() {
  const response = await fetch(`${getApiBaseUrl()}/auth/logout`, {
    method: "POST",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to logout: ${response.status}`)
  }
}

export async function linkProject(apiKey: string) {
  const response = await fetch(`${getApiBaseUrl()}/auth/projects/link`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ apiKey }),
  })

  const payload = (await response.json()) as { ok?: boolean; error?: string; projects?: Array<AuthProject> }
  if (!response.ok) {
    throw new Error(payload.error ?? `Failed to link project: ${response.status}`)
  }

  return payload
}

export async function createProject(name: string): Promise<{ project: { id: string; name: string; apiKey: string; created_at: string }; projects: Array<AuthProject> }> {
  const response = await fetch(`${getApiBaseUrl()}/auth/projects/create`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })

  const payload = (await response.json()) as { ok?: boolean; error?: string; project?: { id: string; name: string; apiKey: string; created_at: string }; projects?: Array<AuthProject> }
  if (!response.ok) {
    throw new Error(payload.error ?? `Failed to create project: ${response.status}`)
  }

  return { project: payload.project!, projects: payload.projects ?? [] }
}

export async function deleteProject(projectId: string): Promise<{ projects: Array<AuthProject> }> {
  const response = await fetch(`${getApiBaseUrl()}/auth/projects/delete`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  })

  const payload = (await response.json()) as { ok?: boolean; error?: string; projects?: Array<AuthProject> }
  if (!response.ok) {
    throw new Error(payload.error ?? `Failed to delete project: ${response.status}`)
  }

  return { projects: payload.projects ?? [] }
}

export async function revokeProjectKey(projectId: string): Promise<{ newApiKey: string }> {
  const response = await fetch(`${getApiBaseUrl()}/auth/projects/revoke-key`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  })

  const payload = (await response.json()) as { ok?: boolean; error?: string; newApiKey?: string }
  if (!response.ok) {
    throw new Error(payload.error ?? `Failed to revoke API key: ${response.status}`)
  }

  return { newApiKey: payload.newApiKey! }
}

export async function fetchBrowserDashboardOverview(projectId: string): Promise<DashboardOverview> {
  const url = new URL(`${getApiBaseUrl()}/v1/dashboard/browser/overview`)
  url.searchParams.set("projectId", projectId)

  const response = await fetch(url.toString(), {
    credentials: "include",
  })

  const payload = (await response.json()) as DashboardOverview & { error?: string }
  if (!response.ok) {
    throw new Error(payload.error ?? `Failed to load dashboard overview: ${response.status}`)
  }

  return payload
}
