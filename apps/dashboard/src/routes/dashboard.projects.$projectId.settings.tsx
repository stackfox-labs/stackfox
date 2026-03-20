import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AlertTriangleIcon, CopyIcon, EyeIcon, EyeOffIcon, KeyIcon, SettingsIcon } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { useProject } from "@/components/dashboard/project-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export const Route = createFileRoute("/dashboard/projects/$projectId/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  const { projectId } = Route.useParams()
  const navigate = useNavigate()
  const auth = useAuth()
  const { overview, refresh } = useProject()
  const [copiedId, setCopiedId] = useState(false)

  // API key state
  const [revealed, setRevealed] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  // Delete project state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Revoke keys state
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [revokeError, setRevokeError] = useState<string | null>(null)
  const [revokeSuccess, setRevokeSuccess] = useState(false)

  const apiKey = overview?.project.api_key ?? ""
  const maskedKey = apiKey ? apiKey.slice(0, 8) + "\u2022".repeat(Math.max(0, apiKey.length - 8)) : ""

  function copyProjectId() {
    if (!overview?.project.id) return
    void navigator.clipboard.writeText(overview.project.id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  function copyKey() {
    void navigator.clipboard.writeText(apiKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  function handleDelete() {
    setDeleting(true)
    setDeleteError(null)
    void auth
      .deleteProject(projectId)
      .then(() => {
        void navigate({ to: "/dashboard" })
      })
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

  const projectName = overview?.project.name ?? ""

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="border-b-2 border-zinc-900 pb-5">
        <h1 className="text-3xl font-black text-zinc-950">Settings</h1>
        <p className="mt-1 text-sm text-zinc-600">Manage project configuration and API keys.</p>
      </div>

      {/* Project info */}
      <div className="group relative border-2 border-zinc-900 shadow-brutal-lg">
        <div className="absolute top-0 right-0 h-3 w-3 bg-secondary" />
        <div className="flex items-center gap-2 border-b-2 border-zinc-900 bg-zinc-950 px-5 py-3">
          <SettingsIcon className="h-4 w-4 text-secondary" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Project Details</p>
        </div>
        <div className="space-y-4 bg-white p-5">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              Project Name
            </label>
            <Input value={overview?.project.name ?? ""} disabled className="border-2 border-zinc-900 bg-zinc-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              Project ID
            </label>
            <div className="flex items-center gap-2">
              <Input value={overview?.project.id ?? ""} disabled className="flex-1 border-2 border-zinc-900 bg-zinc-100 font-mono" />
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-zinc-900 shadow-brutal-sm"
                onClick={copyProjectId}
              >
                {copiedId ? <span className="text-xs font-bold text-green-600">Copied!</span> : <CopyIcon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              Created
            </label>
            <Input
              value={overview?.project.created_at ? formatDate(overview.project.created_at) : "-"}
              disabled
              className="border-2 border-zinc-900 bg-zinc-100"
            />
          </div>
          <div className="border-t border-zinc-200 pt-4">
            <p className="text-xs text-zinc-500">
              Project renaming and configuration editing is coming in a future release.
            </p>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="group relative border-2 border-zinc-900 shadow-brutal-lg">
        <div className="absolute top-0 right-0 h-3 w-3 bg-secondary" />
        <div className="flex items-center gap-2 border-b-2 border-zinc-900 bg-zinc-950 px-5 py-3">
          <KeyIcon className="h-4 w-4 text-secondary" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">API Key</p>
          <Badge variant="secondary" className="ml-auto rounded-none border-2 border-zinc-700 text-[10px]">
            Active
          </Badge>
        </div>
        <div className="space-y-4 bg-white p-5">
          <div className="flex items-center gap-2">
            <div className="flex-1 border-2 border-zinc-900 bg-zinc-100 px-3 py-2 font-mono text-sm">
              {revealed ? apiKey : maskedKey}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-zinc-900 shadow-brutal-sm"
              onClick={() => setRevealed(!revealed)}
            >
              {revealed ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-zinc-900 shadow-brutal-sm"
              onClick={copyKey}
            >
              {copiedKey ? <span className="text-xs text-green-600 font-bold">Copied!</span> : <CopyIcon className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex gap-6 text-xs text-zinc-500">
            <div>
              <span className="font-bold uppercase tracking-[0.18em] text-zinc-400">Created</span>{" "}
              {overview?.project.created_at ? formatDate(overview.project.created_at) : "-"}
            </div>
          </div>
          <div className="border-t border-zinc-200 pt-4">
            <ul className="space-y-1.5 text-sm text-zinc-600">
              <li>Use this key in your Roblox game server script to authenticate with StackFox.</li>
              <li>Key rotation and multiple keys per project are coming in a future release.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="border-2 border-red-700 shadow-brutal-lg">
        <div className="flex items-center gap-2 border-b-2 border-red-700 bg-red-700 px-5 py-3">
          <AlertTriangleIcon className="h-4 w-4 text-white" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">Danger Zone</p>
        </div>
        <div className="space-y-4 bg-white p-5">
          {/* Revoke All API Keys */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-zinc-900">Revoke All API Keys</p>
              <p className="mt-0.5 text-sm text-zinc-600">
                Invalidate every API key for this project. A new key will be generated. Your game will lose access immediately.
              </p>
              {revokeSuccess && (
                <p className="mt-1 text-sm font-bold text-green-600">API key revoked and regenerated successfully.</p>
              )}
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="shrink-0 border-2 border-red-900"
              onClick={() => setShowRevokeConfirm(true)}
            >
              Revoke
            </Button>
          </div>

          {showRevokeConfirm && (
            <div className="border-2 border-red-300 bg-red-50 p-4 space-y-3">
              <p className="text-sm text-red-800">
                Are you sure? Your game will immediately lose access and you'll need to update your server script with the new key.
              </p>
              {revokeError && <p className="text-sm text-red-700">{revokeError}</p>}
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={revoking}
                  onClick={handleRevoke}
                >
                  {revoking ? "Revoking..." : "Confirm Revoke"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-zinc-900"
                  onClick={() => {
                    setShowRevokeConfirm(false)
                    setRevokeError(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="border-t border-zinc-200 pt-4" />

          {/* Delete Project */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-zinc-900">Delete Project</p>
              <p className="mt-0.5 text-sm text-zinc-600">
                Permanently delete this project and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="shrink-0 border-2 border-red-900"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          </div>

          {showDeleteConfirm && (
            <div className="border-2 border-red-300 bg-red-50 p-4 space-y-3">
              <p className="text-sm font-bold text-red-800">
                Type <code className="bg-red-100 px-1 py-0.5 font-mono text-red-900">{projectName}</code> to confirm deletion:
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={projectName}
                className="border-2 border-red-300"
                autoFocus
              />
              {deleteError && <p className="text-sm text-red-700">{deleteError}</p>}
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
                  className="border-2 border-zinc-900"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText("")
                    setDeleteError(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value))
}
