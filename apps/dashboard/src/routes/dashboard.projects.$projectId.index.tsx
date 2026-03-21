import { Link, createFileRoute } from "@tanstack/react-router"
import { BookOpenIcon, ClockIcon } from "lucide-react"
import { useProject } from "@/components/dashboard/project-context"

export const Route = createFileRoute("/dashboard/projects/$projectId/")({
  component: OverviewPage,
})

function openDocs(slug?: string) {
  window.dispatchEvent(new CustomEvent("stackfox:open-docs", { detail: { slug } }))
}

function OverviewPage() {
  const { projectId } = Route.useParams()
  const { overview, error } = useProject()

  const hasData = overview && (overview.events.length > 0 || overview.records.length > 0)

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-200 bg-white">
        <div>
          <h1 className="text-base font-bold text-zinc-900">Overview</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Project summary and quick start.</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {error && (
          <div className="border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-800">Failed to load project</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard label="Events" value={overview ? String(overview.events.length) : "—"} accent="primary" />
          <MetricCard label="Records" value={overview ? String(overview.records.length) : "—"} accent="default" />
          <MetricCard label="Log Entries" value={overview ? String(overview.logs.length) : "—"} accent="default" />
        </div>

        {/* Getting started prompt */}
        {overview && !hasData && !error && (
          <div className="border border-zinc-200 bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-200 bg-zinc-50">
              <BookOpenIcon className="h-3.5 w-3.5 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Get Started</p>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-zinc-900">No data yet</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Connect your game to start sending events and syncing records.
                  Get your API key from{" "}
                  <Link
                    to="/dashboard/projects/$projectId/keys"
                    params={{ projectId }}
                    className="text-primary underline"
                  >
                    API Keys
                  </Link>
                  , then follow the quick start guide.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openDocs("quick-start")}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900"
              >
                <BookOpenIcon className="h-3.5 w-3.5" />
                Quick Start
              </button>
            </div>
          </div>
        )}

        {/* Recent logs */}
        {overview && overview.logs.length > 0 && (
          <div className="border border-zinc-200 bg-white">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 bg-zinc-50">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-3.5 w-3.5 text-zinc-400" />
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Recent Logs</p>
              </div>
              <Link
                to="/dashboard/projects/$projectId/logs"
                params={{ projectId }}
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-zinc-100">
              {overview.logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${log.status === "success" ? "bg-green-500" : "bg-red-500"}`} />
                    <code className="text-xs font-semibold text-primary shrink-0">{log.action}</code>
                    <span className="text-xs text-zinc-500 truncate">{log.message}</span>
                  </div>
                  <span className="shrink-0 text-[10px] text-zinc-400">{formatRelative(log.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent: "primary" | "default"
}) {
  return (
    <div className="border border-zinc-200 bg-white p-4">
      <p className="text-xs text-zinc-500 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent === "primary" ? "text-primary" : "text-zinc-900"}`}>
        {value}
      </p>
    </div>
  )
}

function formatRelative(value: string) {
  const diffSec = Math.floor((Date.now() - new Date(value).getTime()) / 1000)
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
  }).format(new Date(value))
}
