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
    <div>
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-200 bg-white">
        <div>
          <h1 className="text-base font-bold text-zinc-900">Logs</h1>
          <p className="text-xs text-zinc-500 mt-0.5">API activity for this project.</p>
        </div>
        {logs.length > 0 && (
          <span className="text-xs text-zinc-400">{logs.length} entries</span>
        )}
      </div>

      <div className="p-6">
        {logs.length === 0 && !loading && (
          <div className="border border-zinc-200 bg-white p-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border border-zinc-200 bg-zinc-50">
              <ScrollTextIcon className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-900">No activity yet</p>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              Once your game starts using StackFox, events, record writes, errors, and API calls will be logged here.
            </p>
          </div>
        )}

        {logs.length > 0 && (
          <div className="border border-zinc-200 bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-200 bg-zinc-50">
              <ScrollTextIcon className="h-3.5 w-3.5 text-zinc-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Activity Log</p>
            </div>
            <div className="divide-y divide-zinc-100">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        log.status === "success" ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-semibold text-primary">{log.action}</code>
                        {log.status === "error" && (
                          <span className="border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-600">
                            Error
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-500 break-all">{log.message}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] text-zinc-400">{formatTime(log.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && logs.length === 0 && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse border border-zinc-200 bg-zinc-50" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatTime(value: string) {
  const date = new Date(value)
  const now = new Date()
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)
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
