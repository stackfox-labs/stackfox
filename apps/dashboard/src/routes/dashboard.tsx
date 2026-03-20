import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router"
import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
})

function DashboardLayout() {
  const auth = useAuth()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<"create" | "link">("create")
  const [projectName, setProjectName] = useState("")
  const [linkApiKey, setLinkApiKey] = useState("")
  const [modalError, setModalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const projectMatch = pathname.match(/^\/dashboard\/projects\/([^/]+)/)
  const activeProjectId = projectMatch?.[1]
  const showSidebar = !!activeProjectId && auth.projects.length > 0

  function closeModal() {
    setModalOpen(false)
    setModalError(null)
    setProjectName("")
    setLinkApiKey("")
    setSubmitting(false)
  }

  if (!auth.loading && !auth.authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md border-2 border-zinc-900 bg-white p-8 text-center shadow-brutal-lg">
          <div className="mx-auto mb-4 h-12 w-12 border-2 border-zinc-900 bg-zinc-950" />
          <h1 className="text-2xl font-black text-zinc-950">Sign in to StackFox</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Access your projects, models, and records from the developer dashboard.
          </p>
          {auth.oauthConfigured ? (
            <Button className="mt-6 w-full" onClick={() => auth.login("/dashboard")}>
              Sign In with Roblox
            </Button>
          ) : (
            <div className="mt-6 border-2 border-amber-500 bg-amber-50 p-3 text-sm text-zinc-800">
              Configure Roblox OAuth in the backend before sign-in is available.
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex min-h-0 flex-1">
        {showSidebar && (
          <DashboardSidebar
            projects={auth.projects}
            projectId={activeProjectId}
            onNewProject={() => {
              setModalTab("create")
              setModalOpen(true)
            }}
          />
        )}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* New Project / Link Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60">
          <div className="w-full max-w-md border-2 border-zinc-900 bg-white shadow-brutal-lg">
            {/* Tabs */}
            <div className="flex border-b-2 border-zinc-900">
              <button
                type="button"
                onClick={() => { setModalTab("create"); setModalError(null) }}
                className={`flex-1 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] transition-colors ${
                  modalTab === "create"
                    ? "bg-zinc-950 text-white"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                }`}
              >
                New Project
              </button>
              <button
                type="button"
                onClick={() => { setModalTab("link"); setModalError(null) }}
                className={`flex-1 border-l-2 border-zinc-900 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] transition-colors ${
                  modalTab === "link"
                    ? "bg-zinc-950 text-white"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                }`}
              >
                Link Existing
              </button>
            </div>

            <div className="space-y-4 p-5">
              {modalTab === "create" ? (
                <>
                  <p className="text-sm text-zinc-600">
                    Create a new project. An API key will be generated automatically.
                  </p>
                  <div>
                    <label htmlFor="modal-project-name" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                      Project Name
                    </label>
                    <Input
                      id="modal-project-name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="My Roblox Game"
                      className="border-2 border-zinc-900"
                      autoFocus
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-zinc-600">
                    Link an existing project using its API key.
                  </p>
                  <div>
                    <label htmlFor="modal-api-key" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                      API Key
                    </label>
                    <Input
                      id="modal-api-key"
                      value={linkApiKey}
                      onChange={(e) => setLinkApiKey(e.target.value)}
                      placeholder="sf_live_..."
                      className="border-2 border-zinc-900 font-mono"
                      autoFocus
                    />
                  </div>
                </>
              )}

              {modalError && <p className="text-sm text-red-700">{modalError}</p>}

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  disabled={submitting || (modalTab === "create" ? !projectName.trim() : !linkApiKey.trim())}
                  onClick={() => {
                    setSubmitting(true)
                    setModalError(null)

                    if (modalTab === "create") {
                      void auth
                        .createProject(projectName.trim())
                        .then((project) => {
                          closeModal()
                          void navigate({ to: `/dashboard/projects/${project.id}` })
                        })
                        .catch((err: Error) => {
                          setModalError(err.message)
                          setSubmitting(false)
                        })
                    } else {
                      void auth
                        .linkProject(linkApiKey.trim())
                        .then(() => closeModal())
                        .catch((err: Error) => {
                          setModalError(err.message)
                          setSubmitting(false)
                        })
                    }
                  }}
                >
                  {submitting
                    ? modalTab === "create" ? "Creating..." : "Linking..."
                    : modalTab === "create" ? "Create Project" : "Link Project"
                  }
                </Button>
                <Button variant="outline" className="border-2 border-zinc-900" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
