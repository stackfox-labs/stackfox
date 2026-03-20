import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { DocsPanel } from "@/components/dashboard/docs-panel"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
})

const DOCS_KEY = "sf-docs-open"
const DOCS_URL = (import.meta.env.VITE_STACKFOX_SITE_URL as string | undefined) ?? "https://stackfox.dev"

function DashboardLayout() {
  const auth = useAuth()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()

  // Project modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<"create" | "link">("create")
  const [projectName, setProjectName] = useState("")
  const [linkApiKey, setLinkApiKey] = useState("")
  const [modalError, setModalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Docs panel state (persisted)
  const [docsOpen, setDocsOpen] = useState(() => {
    try {
      return localStorage.getItem(DOCS_KEY) === "1"
    } catch {
      return false
    }
  })

  // Refresh state for topbar
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(DOCS_KEY, docsOpen ? "1" : "0")
    } catch {}
  }, [docsOpen])

  function handleDocsToggle() {
    setDocsOpen((v) => !v)
  }

  function handleRefresh() {
    setRefreshing(true)
    window.dispatchEvent(new CustomEvent("stackfox:refresh"))
    setTimeout(() => setRefreshing(false), 1000)
  }

  const projectMatch = pathname.match(/^\/dashboard\/projects\/([^/]+)/)
  const activeProjectId = projectMatch?.[1]
  const showSidebar = !!activeProjectId && auth.projects.length > 0
  const currentProject = auth.projects.find((p) => p.id === activeProjectId)

  function closeModal() {
    setModalOpen(false)
    setModalError(null)
    setProjectName("")
    setLinkApiKey("")
    setSubmitting(false)
  }

  // Sign-in page
  if (!auth.loading && !auth.authenticated) {
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
              <h1 className="text-xl font-black text-zinc-950">Sign in to StackFox</h1>
              <p className="mt-1.5 text-sm text-zinc-500">
                Connect your Roblox account to access your projects.
              </p>
            </div>

            {auth.oauthConfigured ? (
              <Button className="w-full" onClick={() => auth.login("/dashboard")}>
                Sign In with Roblox
              </Button>
            ) : (
              <div className="border-2 border-amber-400 bg-amber-50 p-3 text-sm text-zinc-800">
                Roblox OAuth is not configured. Set up credentials in the API to enable sign-in.
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      {showSidebar && (
        <DashboardSidebar
          projects={auth.projects}
          projectId={activeProjectId}
          docsOpen={docsOpen}
          onDocsToggle={handleDocsToggle}
        />
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {showSidebar && (
          <Topbar
            projects={auth.projects}
            projectId={activeProjectId}
            projectName={currentProject?.name ?? ""}
            onNewProject={() => {
              setModalTab("create")
              setModalOpen(true)
            }}
            docsOpen={docsOpen}
            onDocsToggle={handleDocsToggle}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        )}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <DocsPanel open={docsOpen} siteUrl={DOCS_URL} />

      {/* New Project / Link Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4">
          <div className="w-full max-w-md border-2 border-zinc-900 bg-white shadow-brutal-lg">
            {/* Header tabs */}
            <div className="flex border-b-2 border-zinc-900">
              <button
                type="button"
                onClick={() => { setModalTab("create"); setModalError(null) }}
                className={`flex-1 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
                  modalTab === "create"
                    ? "bg-zinc-950 text-white"
                    : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                }`}
              >
                New Project
              </button>
              <button
                type="button"
                onClick={() => { setModalTab("link"); setModalError(null) }}
                className={`flex-1 border-l-2 border-zinc-900 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
                  modalTab === "link"
                    ? "bg-zinc-950 text-white"
                    : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                }`}
              >
                Link Existing
              </button>
            </div>

            <div className="p-5 space-y-4">
              {modalTab === "create" ? (
                <>
                  <p className="text-sm text-zinc-500">
                    Give your project a name. An API key will be generated automatically.
                  </p>
                  <div>
                    <label
                      htmlFor="modal-project-name"
                      className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400"
                    >
                      Project Name
                    </label>
                    <Input
                      id="modal-project-name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && projectName.trim() && !submitting) {
                          e.currentTarget.form?.requestSubmit()
                        }
                      }}
                      placeholder="My Roblox Game"
                      className="border-2 border-zinc-900 text-sm"
                      autoFocus
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-zinc-500">
                    Paste an API key to link an existing project to your account.
                  </p>
                  <div>
                    <label
                      htmlFor="modal-api-key"
                      className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400"
                    >
                      API Key
                    </label>
                    <Input
                      id="modal-api-key"
                      value={linkApiKey}
                      onChange={(e) => setLinkApiKey(e.target.value)}
                      placeholder="sf_live_..."
                      className="border-2 border-zinc-900 font-mono text-sm"
                      autoFocus
                    />
                  </div>
                </>
              )}

              {modalError && (
                <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2">
                  {modalError}
                </p>
              )}

              <div className="flex gap-2 pt-1">
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
                    : modalTab === "create" ? "Create Project" : "Link Project"}
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
