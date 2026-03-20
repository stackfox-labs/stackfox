import { Link, createFileRoute } from "@tanstack/react-router"
import {
  ClockIcon,
  CodeIcon,
  RocketIcon,
} from "lucide-react"
import { useProject } from "@/components/dashboard/project-context"
import { LuaCode } from "@/components/ui/lua-code"

export const Route = createFileRoute("/dashboard/projects/$projectId/")({
  component: OverviewPage,
})

function OverviewPage() {
  const { projectId } = Route.useParams()
  const { overview, error } = useProject()

  const hasData = overview && (overview.events.length > 0 || overview.records.length > 0)
  const setupSteps = [
    {
      title: "Install the SDK",
      description: "Add StackFox to your Roblox Studio project. Download the module from the toolbox or use a package manager.",
      code: `-- Add StackFox to ReplicatedStorage\n-- or require from your package manager`,
      filename: "setup.lua",
    },
    {
      title: "Initialize the SDK",
      description: "Call init with your API key at the start of your game server script. You can find your API key in Settings.",
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
      title: "Store your first record",
      description: "Use the records API to persist key-value data organized by collection.",
      code: `-- Save player data\nStackFox.records:set("players", tostring(player.UserId), {\n    username = player.Name,\n    coins = 100,\n    level = 1,\n})\n\n-- Read it back\nlocal data = StackFox.records:get("players", tostring(player.UserId))\nprint(data.coins) -- 100`,
      filename: "records.server.lua",
    },
  ]

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Page header */}
      <div className="border-b-2 border-zinc-900 pb-5">
        <h1 className="text-3xl font-black text-zinc-950">Overview</h1>
      </div>

      {error && (
        <div className="border-2 border-red-700 bg-red-50 p-4 shadow-brutal-sm">
          <p className="font-bold text-red-800">Failed to load project</p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Metric label="Events" value={overview ? String(overview.events.length) : "-"} accent="primary" />
        <Metric label="Records" value={overview ? String(overview.records.length) : "-"} accent="secondary" />
        <Metric label="Log Entries" value={overview ? String(overview.logs.length) : "-"} accent="primary" />
      </div>

      {/* Setup guide Ã¢â‚¬â€ shown when no data exists */}
      {overview && !hasData && !error && (
        <div className="border-2 border-zinc-900 shadow-brutal-lg">
          <div className="flex items-center gap-2 border-b-2 border-zinc-900 bg-zinc-950 px-5 py-3">
            <RocketIcon className="h-4 w-4 text-secondary" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Get Started</p>
          </div>
          <div className="space-y-5 bg-white p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-zinc-900 bg-primary/10">
                <CodeIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-base font-bold text-zinc-900">No data yet</p>
                <p className="mt-0.5 text-sm text-zinc-600">
                  Install the SDK, send events and store records from your Roblox game. Follow the steps below to get started.
                  You can find your API key in <Link to="/dashboard/projects/$projectId/settings" params={{ projectId }} className="font-medium text-primary hover:underline">Settings</Link>.
                </p>
              </div>
            </div>

            {setupSteps.map((step, index) => (
              <div key={index} className="border-2 border-zinc-900 bg-white">
                <div className="flex items-start gap-4 p-4 pb-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-zinc-900 bg-primary text-sm font-black text-white shadow-brutal-sm">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-zinc-950">{step.title}</h3>
                    <p className="mt-0.5 text-sm text-zinc-600">{step.description}</p>
                  </div>
                </div>
                <div className="border-t-2 border-zinc-900 bg-zinc-900">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-700 bg-zinc-800">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="ml-2 text-[10px] text-zinc-500 font-mono">{step.filename}</span>
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
        <div className="border-2 border-zinc-900 shadow-brutal-lg">
          <div className="flex items-center justify-between border-b-2 border-zinc-900 bg-zinc-950 px-5 py-3">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-secondary" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Recent Logs</p>
            </div>
            <Link to="/dashboard/projects/$projectId/logs" params={{ projectId }} className="text-xs font-bold text-primary hover:underline cursor-pointer">
              View all
            </Link>
          </div>
          <div className="divide-y divide-zinc-200 bg-white">
            {overview.logs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 shrink-0 ${log.status === "success" ? "bg-green-500" : "bg-red-500"}`} />
                  <code className="text-xs font-bold text-primary">{log.action}</code>
                  <span className="text-sm text-zinc-600">{log.message}</span>
                </div>
                <span className="shrink-0 text-xs text-zinc-400">{formatRelative(log.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, accent }: { label: string; value: string; accent: "primary" | "secondary" }) {
  return (
    <div className="group relative border-2 border-zinc-900 bg-white p-4 shadow-brutal-sm transition-all hover:shadow-brutal-md hover:-translate-y-0.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className={`mt-2 text-3xl font-black ${accent === "primary" ? "text-primary" : "text-zinc-950"}`}>{value}</p>
      <div className={`absolute top-0 right-0 h-2.5 w-2.5 ${accent === "primary" ? "bg-primary" : "bg-secondary"} transition-colors group-hover:bg-primary`} />
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
