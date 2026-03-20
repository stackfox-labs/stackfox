import { createContext, startTransition, useContext, useEffect, useState } from "react"
import type {AuthProject, AuthSessionState, AuthUser} from "@/lib/auth";
import {
  
  
  
  createProject as createProjectRequest,
  deleteProject as deleteProjectRequest,
  fetchAuthSession,
  linkProject as linkProjectRequest,
  logout as logoutRequest,
  revokeProjectKey as revokeProjectKeyRequest,
  startRobloxLogin
} from "@/lib/auth"

interface AuthContextValue {
  loading: boolean
  authenticated: boolean
  oauthConfigured: boolean
  user: AuthUser | null
  projects: Array<AuthProject>
  refresh: () => Promise<void>
  login: (returnTo?: string) => void
  logout: () => Promise<void>
  createProject: (name: string) => Promise<{ id: string; name: string; apiKey: string; created_at: string }>
  linkProject: (apiKey: string) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  revokeProjectKey: (projectId: string) => Promise<string>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function emptySession(): AuthSessionState {
  return {
    ok: true,
    authenticated: false,
    oauthConfigured: false,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSessionState>(emptySession)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    const nextSession = await fetchAuthSession()
    startTransition(() => {
      setSession(nextSession)
    })
  }

  useEffect(() => {
    let active = true

    fetchAuthSession()
      .then((nextSession) => {
        if (!active) {
          return
        }

        setSession(nextSession)
      })
      .catch(() => {
        if (!active) {
          return
        }

        setSession(emptySession())
      })
      .finally(() => {
        if (!active) {
          return
        }

        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const value: AuthContextValue = {
    loading,
    authenticated: session.authenticated,
    oauthConfigured: session.oauthConfigured,
    user: session.user ?? null,
    projects: session.projects ?? [],
    refresh: async () => {
      await refresh()
    },
    login: (returnTo = "/dashboard") => {
      startRobloxLogin(returnTo)
    },
    logout: async () => {
      await logoutRequest()
      await refresh()
    },
    createProject: async (name: string) => {
      const result = await createProjectRequest(name)
      await refresh()
      return result.project
    },
    linkProject: async (apiKey: string) => {
      await linkProjectRequest(apiKey)
      await refresh()
    },
    deleteProject: async (projectId: string) => {
      await deleteProjectRequest(projectId)
      await refresh()
    },
    revokeProjectKey: async (projectId: string) => {
      const result = await revokeProjectKeyRequest(projectId)
      return result.newApiKey
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return value
}
