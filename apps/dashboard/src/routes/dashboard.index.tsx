import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
})

function DashboardIndex() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [projectName, setProjectName] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (auth.authenticated && auth.projects.length > 0) {
      void navigate({ to: `/dashboard/projects/${auth.projects[0].id}` })
    }
  }, [auth.authenticated, auth.projects, navigate])

  if (auth.loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-8 w-8 animate-pulse border-2 border-zinc-900 bg-zinc-200" />
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (auth.authenticated && auth.projects.length > 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-zinc-500">Redirecting to project...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="border-2 border-zinc-900 bg-white shadow-brutal-lg">
          <div className="border-b-2 border-zinc-900 bg-zinc-950 px-6 py-4">
            <h1 className="text-xl font-black text-white">Create your first project</h1>
            <p className="mt-1 text-xs text-zinc-500">
              A project holds your events, records, and API keys.
            </p>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <label htmlFor="project-name" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Project Name
              </label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Roblox Game"
                className="border-2 border-zinc-900"
                autoFocus
              />
            </div>

            {error && <p className="text-sm text-red-700">{error}</p>}

            <Button
              className="w-full"
              disabled={!projectName.trim() || creating}
              onClick={() => {
                setCreating(true)
                setError(null)
                void auth
                  .createProject(projectName.trim())
                  .then((project) => {
                    void navigate({ to: `/dashboard/projects/${project.id}` })
                  })
                  .catch((err: Error) => {
                    setError(err.message)
                    setCreating(false)
                  })
              }}
            >
              {creating ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
