import { createFileRoute } from "@tanstack/react-router"
import { ActivityIcon } from "lucide-react"
import { useProject } from "@/components/dashboard/project-context"

export const Route = createFileRoute("/dashboard/projects/$projectId/usage")({
  component: UsagePage,
})

function UsagePage() {
  const { overview } = useProject()

  const metrics = [
    { label: "Events Ingested", value: overview ? String(overview.events.length) : "—", accent: "primary" as const },
    { label: "Records Stored", value: overview ? String(overview.records.length) : "—", accent: "default" as const },
    { label: "Log Entries", value: overview ? String(overview.logs.length) : "—", accent: "default" as const },
  ]

  return (
    <div>
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-200 bg-white">
        <div>
          <h1 className="text-base font-bold text-zinc-900">Usage</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Project usage and platform metrics.</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="border border-zinc-200 bg-white p-4">
              <p className="text-xs text-zinc-500 font-medium">{m.label}</p>
              <p
                className={`text-2xl font-bold mt-1 ${m.accent === "primary" ? "text-primary" : "text-zinc-900"}`}
              >
                {m.value}
              </p>
            </div>
          ))}
        </div>

        <div className="border border-zinc-200 bg-white p-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border border-zinc-200 bg-zinc-50">
            <ActivityIcon className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="text-sm font-semibold text-zinc-900">Detailed metrics coming soon</p>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
            Request counts, storage usage, read/write breakdowns, and billing will be available in a future release.
          </p>
        </div>
      </div>
    </div>
  )
}
