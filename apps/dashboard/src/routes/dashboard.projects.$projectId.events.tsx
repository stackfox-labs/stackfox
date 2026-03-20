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
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-200 bg-white">
        <div>
          <h1 className="text-base font-bold text-zinc-900">Events</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Incoming events from your game in real time.</p>
        </div>
        {overview && overview.events.length > 0 && (
          <span className="text-xs text-zinc-400">{overview.events.length} total</span>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Empty state */}
        {!loading && overview && overview.events.length === 0 && (
          <div className="border border-zinc-200 bg-white p-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border border-zinc-200 bg-zinc-50">
              <MegaphoneIcon className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-900">No events yet</p>
            <p className="mt-1 text-xs text-zinc-500 max-w-xs mx-auto">
              Send your first event using{" "}
              <code className="bg-zinc-100 px-1 py-0.5 font-mono text-[11px]">
                StackFox.events:track(...)
              </code>
            </p>
          </div>
        )}

        {/* Filter tabs */}
        {overview && overview.events.length > 0 && (
          <>
            <div className="flex flex-wrap gap-1.5">
              <FilterButton
                label={`All (${overview.events.length})`}
                active={!filterName}
                onClick={() => setFilterName(null)}
              />
              {allEventNames.map((name) => {
                const count = overview.events.filter((e) => e.event_name === name).length
                return (
                  <FilterButton
                    key={name}
                    label={`${name} (${count})`}
                    active={filterName === name}
                    onClick={() => setFilterName(name)}
                  />
                )
              })}
            </div>

            <div className="border border-zinc-200 bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-200 bg-zinc-50">
                <MegaphoneIcon className="h-3.5 w-3.5 text-zinc-400" />
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {filterName ?? "All Events"}
                </p>
                <span className="ml-auto text-xs text-zinc-400">
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-zinc-100">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="p-4">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <span className="border border-primary/30 bg-red-50 px-2 py-0.5 text-[11px] font-bold text-primary">
                        {event.event_name}
                      </span>
                      <span className="ml-auto text-[10px] text-zinc-400">{formatDate(event.created_at)}</span>
                    </div>
                    <div className="border border-zinc-200 bg-zinc-900">
                      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-zinc-700 bg-zinc-800">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="ml-1 text-[10px] text-zinc-500 font-mono">payload</span>
                      </div>
                      <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-zinc-100">
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
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse border border-zinc-200 bg-zinc-50" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
      }`}
    >
      {label}
    </button>
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
