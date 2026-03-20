import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/logo"

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-5 w-5 animate-pulse border-2 border-zinc-900 bg-zinc-200" />
      </div>
    )
  }

  if (auth.authenticated && auth.projects.length > 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-400">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-zinc-100 items-center justify-center p-6">
      <div className="w-full max-w-sm border-2 border-zinc-900 bg-white shadow-brutal-xl">
        <div className="border-b-2 border-zinc-900 bg-zinc-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <Logo type="full" size="5" />
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Dashboard</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h1 className="text-xl font-black text-zinc-950">Create your first project</h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Give your project a name. An API key will be generated automatically.
            </p>
          </div>

          <div>
            <label
              htmlFor="project-name"
              className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400"
            >
              Project Name
            </label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && projectName.trim() && !creating) {
                  e.preventDefault()
                  // trigger submit
                  document.getElementById("create-project-btn")?.click()
                }
              }}
              placeholder="My Roblox Game"
              className="border-2 border-zinc-900"
              autoFocus
            />
          </div>

          {error && (
            <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <Button
            id="create-project-btn"
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
  )
}
