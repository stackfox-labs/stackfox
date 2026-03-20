import { createFileRoute } from "@tanstack/react-router"
import { ScrollTextIcon } from "lucide-react"
import { useProject } from "@/components/dashboard/project-context"

export const Route = createFileRoute("/dashboard/projects/$projectId/logs")({
  component: LogsPage,
})

function LogsPage() {
  const { overview, loading } = useProject()
  const logs = overview?.logs ?? []

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="border-b-2 border-zinc-900 pb-5">
        <h1 className="text-3xl font-black text-zinc-950">Logs</h1>
        <p className="mt-1 text-sm text-zinc-600">API activity and events for this project.</p>
      </div>

      {logs.length === 0 && !loading && (
        <div className="border-2 border-zinc-900 bg-white p-8 text-center shadow-brutal-lg">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border-2 border-zinc-900 bg-primary/10">
            <ScrollTextIcon className="h-6 w-6 text-primary" />
          </div>
          <p className="text-lg font-bold text-zinc-900">No activity yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600">
            Once your game starts using StackFox, schema applies, record CRUD, errors, and validation failures will be logged here.
          </p>
        </div>
      )}

      {logs.length > 0 && (
        <div className="border-2 border-zinc-900 shadow-brutal-lg">
          <div className="flex items-center gap-2 border-b-2 border-zinc-900 bg-zinc-950 px-5 py-3">
            <ScrollTextIcon className="h-4 w-4 text-secondary" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
              Activity Log
            </p>
            <span className="ml-auto text-xs text-zinc-500">{logs.length} entries</span>
          </div>
          <div className="divide-y divide-zinc-200 bg-white">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-4 px-5 py-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 ${
                      log.status === "success" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-bold text-primary">{log.action}</code>
                      {log.status === "error" && (
                        <span className="border border-red-300 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-600">
                          Error
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-zinc-600 break-all">{log.message}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-zinc-400">{formatTime(log.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && logs.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse border-2 border-zinc-300 bg-zinc-100" />
          ))}
        </div>
      )}
    </div>
  )
}

function formatTime(value: string) {
  const date = new Date(value)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}
