import { createContext, useContext } from "react"
import type { DashboardOverview } from "@/lib/dashboard"

interface ProjectContextValue {
  overview: DashboardOverview | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export const ProjectContext = createContext<ProjectContextValue | null>(null)

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) {
    throw new Error("useProject must be used inside a project route")
  }
  return ctx
}

export function useProjectOptional() {
  return useContext(ProjectContext)
}
