import { createFileRoute } from "@tanstack/react-router"
import { ActivityIcon } from "lucide-react"
import { useProject } from "@/components/dashboard/project-context"

export const Route = createFileRoute("/dashboard/projects/$projectId/usage")({
  component: UsagePage,
})

function UsagePage() {
  const { overview } = useProject()

  const metrics = [
    { label: "Events Ingested", value: overview ? String(overview.events.length) : "-", accent: "primary" as const },
    { label: "Records Stored", value: overview ? String(overview.records.length) : "-", accent: "secondary" as const },
    { label: "Log Entries", value: overview ? String(overview.logs.length) : "-", accent: "primary" as const },
  ]

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="border-b-2 border-zinc-900 pb-5">
        <h1 className="text-3xl font-black text-zinc-950">Usage</h1>
        <p className="mt-1 text-sm text-zinc-600">Project usage and platform metrics.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="group relative border-2 border-zinc-900 bg-white p-4 shadow-brutal-sm transition-all hover:shadow-brutal-md hover:-translate-y-0.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">{m.label}</p>
            <p className={`mt-2 text-3xl font-black ${m.accent === "primary" ? "text-primary" : "text-zinc-950"}`}>{m.value}</p>
            <div className={`absolute top-0 right-0 h-2.5 w-2.5 ${m.accent === "primary" ? "bg-primary" : "bg-secondary"} transition-colors group-hover:bg-primary`} />
          </div>
        ))}
      </div>

      <div className="border-2 border-zinc-900 bg-white p-8 text-center shadow-brutal-lg">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border-2 border-zinc-900 bg-primary/10">
          <ActivityIcon className="h-6 w-6 text-primary" />
        </div>
        <p className="text-lg font-bold text-zinc-900">Detailed usage metrics coming soon</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600">
          Request counts, storage usage, read/write breakdowns, and billing information will be available here in a future release.
        </p>
      </div>
    </div>
  )
}
