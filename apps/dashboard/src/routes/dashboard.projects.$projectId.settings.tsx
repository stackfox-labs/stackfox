import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { AlertTriangleIcon, CopyIcon, KeyIcon, SettingsIcon } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { useProject } from "@/components/dashboard/project-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const Route = createFileRoute("/dashboard/projects/$projectId/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  const { projectId } = Route.useParams()
  const navigate = useNavigate()
  const auth = useAuth()
  const { overview, refresh } = useProject()
  const [copiedId, setCopiedId] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [revokeError, setRevokeError] = useState<string | null>(null)
  const [revokeSuccess, setRevokeSuccess] = useState(false)

  const projectName = overview?.project.name ?? ""

  function copyProjectId() {
    if (!overview?.project.id) return
    void navigator.clipboard.writeText(overview.project.id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  function handleDelete() {
    setDeleting(true)
    setDeleteError(null)
    void auth
      .deleteProject(projectId)
      .then(() => void navigate({ to: "/dashboard" }))
      .catch((err: Error) => {
        setDeleteError(err.message)
        setDeleting(false)
      })
  }

  function handleRevoke() {
    setRevoking(true)
    setRevokeError(null)
    void auth
      .revokeProjectKey(projectId)
      .then(() => {
        setRevokeSuccess(true)
        setShowRevokeConfirm(false)
        setRevoking(false)
        void refresh()
        setTimeout(() => setRevokeSuccess(false), 3000)
      })
      .catch((err: Error) => {
        setRevokeError(err.message)
        setRevoking(false)
      })
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-200 bg-white">
        <div>
          <h1 className="text-base font-bold text-zinc-900">Settings</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage project configuration.</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* API Keys link */}
        <div className="border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-200 bg-zinc-50">
            <KeyIcon className="h-3.5 w-3.5 text-zinc-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">API Keys</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-zinc-500">
              Manage your project API keys on the{" "}
              <Link
                to="/dashboard/projects/$projectId/keys"
                params={{ projectId }}
                className="font-medium text-primary underline underline-offset-2 hover:no-underline"
              >
                API Keys page
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Project info */}
        <div className="border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-200 bg-zinc-50">
            <SettingsIcon className="h-3.5 w-3.5 text-zinc-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Project Details</p>
          </div>
          <div className="p-4 space-y-3">
            <Field label="Project Name">
              <Input
                value={overview?.project.name ?? ""}
                disabled
                className="border border-zinc-200 bg-zinc-50 text-sm h-9"
              />
            </Field>
            <Field label="Project ID">
              <div className="flex items-center gap-2">
                <Input
                  value={overview?.project.id ?? ""}
                  disabled
                  className="flex-1 border border-zinc-200 bg-zinc-50 font-mono text-sm h-9"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="border border-zinc-200 h-9 px-2.5 shrink-0"
                  onClick={copyProjectId}
                >
                  {copiedId ? (
                    <span className="text-[11px] font-bold text-green-600">Copied!</span>
                  ) : (
                    <CopyIcon className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </Field>
            <Field label="Created">
              <Input
                value={
                  overview?.project.created_at
                    ? new Intl.DateTimeFormat("en", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(overview.project.created_at))
                    : "—"
                }
                disabled
                className="border border-zinc-200 bg-zinc-50 text-sm h-9"
              />
            </Field>
            <p className="text-[10px] text-zinc-400 border-t border-zinc-100 pt-2">
              Project renaming is coming in a future release.
            </p>
          </div>
        </div>

        {/* Danger zone */}
        <div className="border border-red-200 bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-red-200 bg-red-50">
            <AlertTriangleIcon className="h-3.5 w-3.5 text-red-500" />
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Danger Zone</p>
          </div>
          <div className="p-4 space-y-5">
            {/* Revoke keys */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-zinc-900">Revoke All API Keys</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Invalidate all keys and generate a new one. Your game loses access immediately.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="shrink-0"
                onClick={() => setShowRevokeConfirm(true)}
              >
                Revoke
              </Button>
            </div>

            {revokeSuccess && (
              <p className="text-xs font-medium text-green-700">API key revoked and a new one generated.</p>
            )}

            {showRevokeConfirm && (
              <div className="border border-red-200 bg-red-50 p-3 space-y-3">
                <p className="text-xs text-red-800">
                  Your game will immediately lose access. Update your server script with the new key.
                </p>
                {revokeError && <p className="text-xs text-red-700">{revokeError}</p>}
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm" disabled={revoking} onClick={handleRevoke}>
                    {revoking ? "Revoking..." : "Confirm Revoke"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border border-zinc-300"
                    onClick={() => { setShowRevokeConfirm(false); setRevokeError(null) }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="border-t border-zinc-100" />

            {/* Delete project */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-zinc-900">Delete Project</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Permanently delete this project and all associated data. Cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="shrink-0"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </Button>
            </div>

            {showDeleteConfirm && (
              <div className="border border-red-200 bg-red-50 p-3 space-y-3">
                <p className="text-xs font-semibold text-red-800">
                  Type{" "}
                  <code className="bg-red-100 px-1 font-mono text-red-900">{projectName}</code>{" "}
                  to confirm:
                </p>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={projectName}
                  className="border border-red-300 h-9 text-sm"
                  autoFocus
                />
                {deleteError && <p className="text-xs text-red-700">{deleteError}</p>}
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteConfirmText !== projectName || deleting}
                    onClick={handleDelete}
                  >
                    {deleting ? "Deleting..." : "Confirm Delete"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border border-zinc-300"
                    onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); setDeleteError(null) }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </label>
      {children}
    </div>
  )
}
