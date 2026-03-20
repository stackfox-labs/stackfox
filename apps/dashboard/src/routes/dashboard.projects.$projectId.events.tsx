import { createFileRoute } from "@tanstack/react-router"
import { MegaphoneIcon } from "lucide-react"
import { useState } from "react"
import { useProject } from "@/components/dashboard/project-context"

export const Route = createFileRoute("/dashboard/projects/$projectId/events")({
  component: EventsPage,
})

function EventsPage() {
  const { overview, loading } = useProject()
  const [filterName, setFilterName] = useState<string | null>(null)

  const allEventNames = overview ? [...new Set(overview.events.map((e) => e.event_name))] : []

  const filteredEvents = overview
    ? filterName
      ? overview.events.filter((e) => e.event_name === filterName)
      : overview.events
    : []

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Page header */}
      <div className="border-b-2 border-zinc-900 pb-5">
        <h1 className="text-3xl font-black text-zinc-950">Events</h1>
        <p className="mt-1 text-sm text-zinc-600">View incoming events from your game in real time.</p>
      </div>

      {/* Empty state */}
      {!loading && overview && overview.events.length === 0 && (
        <div className="border-2 border-zinc-900 bg-white p-8 text-center shadow-brutal-lg">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border-2 border-zinc-900 bg-primary/10">
            <MegaphoneIcon className="h-6 w-6 text-primary" />
          </div>
          <p className="text-lg font-bold text-zinc-900">No events yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600">
            Send your first event from your game using{" "}
            <code className="bg-zinc-100 px-1 py-0.5 text-xs font-bold">StackFox.events:track("event_name", payload)</code>
          </p>
        </div>
      )}

      {/* Event name filter */}
      {overview && overview.events.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterName(null)}
              className={`border-2 px-3 py-1.5 text-sm font-bold transition-all ${
                !filterName
                  ? "border-zinc-900 bg-primary text-white shadow-brutal-sm"
                  : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-900"
              }`}
            >
              All ({overview.events.length})
            </button>
            {allEventNames.map((name) => {
              const count = overview.events.filter((e) => e.event_name === name).length
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFilterName(name)}
                  className={`border-2 px-3 py-1.5 text-sm font-bold transition-all ${
                    filterName === name
                      ? "border-zinc-900 bg-primary text-white shadow-brutal-sm"
                      : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-900"
                  }`}
                >
                  {name} ({count})
                </button>
              )
            })}
          </div>

          {/* Events list */}
          <div className="border-2 border-zinc-900 shadow-brutal-lg">
            <div className="flex items-center gap-2 border-b-2 border-zinc-900 bg-zinc-950 px-5 py-3">
              <MegaphoneIcon className="h-4 w-4 text-secondary" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                {filterName ?? "All Events"} — {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="divide-y-2 divide-zinc-200 bg-white">
              {filteredEvents.map((event) => (
                <div key={event.id} className="p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="border-2 border-primary bg-red-50 px-2 py-0.5 text-xs font-black text-primary">
                      {event.event_name}
                    </span>
                    <span className="ml-auto text-xs text-zinc-500">{formatDate(event.created_at)}</span>
                  </div>
                  <div className="border-2 border-zinc-900 bg-zinc-900">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-700 bg-zinc-800">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="ml-2 text-[10px] text-zinc-500 font-mono">payload</span>
                    </div>
                    <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-100">
                      {JSON.stringify(event.payload_json, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse border-2 border-zinc-300 bg-zinc-100" />
          ))}
        </div>
      )}
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value))
}
