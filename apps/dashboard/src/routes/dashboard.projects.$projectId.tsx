import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router"
import { startTransition, useCallback, useEffect, useState } from "react"
import type { DashboardOverview } from "@/lib/dashboard"
import { useAuth } from "@/components/auth/auth-provider"
import { fetchBrowserDashboardOverview } from "@/lib/auth"
import { ProjectContext } from "@/components/dashboard/project-context"

export const Route = createFileRoute("/dashboard/projects/$projectId")({
  component: ProjectLayout,
})

function ProjectLayout() {
  const { projectId } = Route.useParams()
  const auth = useAuth()
  const navigate = useNavigate()
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasProjectAccess = auth.projects.some((project) => project.id === projectId)

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    startTransition(() => {
      fetchBrowserDashboardOverview(projectId)
        .then((data) => {
          setOverview(data)
          setError(null)
        })
        .catch((err: Error) => {
          setError(err.message)
        })
        .finally(() => {
          setLoading(false)
        })
    })
  }, [projectId])

  useEffect(() => {
    if (auth.loading) {
      return
    }

    if (!auth.authenticated) {
      setOverview(null)
      setError(null)
      setLoading(false)
      void navigate({ to: "/dashboard", replace: true })
      return
    }

    if (!hasProjectAccess) {
      setOverview(null)
      setError(null)
      setLoading(false)

      if (auth.projects.length > 0) {
        void navigate({
          to: "/dashboard/projects/$projectId",
          params: { projectId: auth.projects[0].id },
          replace: true,
        })
      } else {
        void navigate({ to: "/dashboard", replace: true })
      }
      return
    }

    refresh()
  }, [auth.authenticated, auth.loading, auth.projects, hasProjectAccess, navigate, refresh])

  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener("stackfox:refresh", handler)
    return () => window.removeEventListener("stackfox:refresh", handler)
  }, [refresh])

  if (auth.loading || !auth.authenticated || !hasProjectAccess) {
    return null
  }

  return (
    <ProjectContext.Provider value={{ overview, loading, error, refresh }}>
      <Outlet />
    </ProjectContext.Provider>
  )
}