import { Link, createFileRoute } from "@tanstack/react-router"
import { ClockIcon, CodeIcon, RocketIcon } from "lucide-react"
import { useProject } from "@/components/dashboard/project-context"
import { LuaCode } from "@/components/ui/lua-code"

export const Route = createFileRoute("/dashboard/projects/$projectId/")({
  component: OverviewPage,
})

const setupSteps = [
  {
    title: "Install the SDK",
    description: "Add StackFox to your Roblox Studio project via the toolbox or package manager.",
    code: `-- Add StackFox to ReplicatedStorage\n-- or require from your package manager`,
    filename: "setup.lua",
  },
  {
    title: "Initialize the SDK",
    description: "Call init with your API key at the top of your server script.",
    code: `local StackFox = require(game.ReplicatedStorage.StackFox)\n\nStackFox.init({\n    apiKey = "YOUR_API_KEY",\n})`,
    filename: "init.server.lua",
  },
  {
    title: "Send your first event",
    description: "Track game events like player joins, purchases, and milestones.",
    code: `StackFox.events:track("player_join", {\n    userId = tostring(player.UserId),\n    username = player.Name,\n})`,
    filename: "events.server.lua",
  },
  {
    title: "Sync your first record",
    description: "Write and read external records organized by collection.",
    code: `local playerId = tostring(player.UserId)\nStackFox.records:set("players", playerId, {\n    username = player.Name,\n    coins = 100,\n    level = 1,\n})\n\nlocal data = StackFox.records:get("players", playerId)\nprint(data.coins) -- 100`,
    filename: "records.server.lua",
  },
]

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

        {/* Setup guide */}
        {overview && !hasData && !error && (
          <div className="border border-zinc-200 bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-200 bg-zinc-50">
              <RocketIcon className="h-3.5 w-3.5 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Get Started</p>
            </div>
            <div className="p-4 space-y-1.5">
              <div className="flex items-start gap-3 pb-3 border-b border-zinc-100">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-zinc-200 bg-zinc-50">
                  <CodeIcon className="h-4 w-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">No data yet</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Connect your game to start sending events and syncing records. Find your API key in{" "}
                    <Link
                      to="/dashboard/projects/$projectId/keys"
                      params={{ projectId }}
                      className="text-primary underline"
                    >
                      API Keys
                    </Link>.
                  </p>
                </div>
              </div>

              {setupSteps.map((step, index) => (
                <div key={index} className="border border-zinc-200">
                  <div className="flex items-start gap-3 px-4 py-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-zinc-900 bg-primary text-[11px] font-black text-white">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900">{step.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{step.description}</p>
                    </div>
                  </div>
                  <div className="border-t border-zinc-200 bg-zinc-900">
                    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-zinc-700 bg-zinc-800">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="ml-1 text-[10px] text-zinc-500 font-mono">{step.filename}</span>
                    </div>
                    <LuaCode code={step.code} />
                  </div>
                </div>
              ))}
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
