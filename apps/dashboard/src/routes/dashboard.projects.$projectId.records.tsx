import { Link, createFileRoute } from "@tanstack/react-router"
import { DatabaseIcon } from "lucide-react"
import { useState } from "react"
import { useProject } from "@/components/dashboard/project-context"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/dashboard/projects/$projectId/records")({
  component: RecordsPage,
})

function RecordsPage() {
  const { projectId } = Route.useParams()
  const { overview, loading } = useProject()

  const allCollections = overview ? [...new Set(overview.records.map((r) => r.collection))] : []

  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)

  const filteredRecords = overview
    ? selectedCollection
      ? overview.records.filter((r) => r.collection === selectedCollection)
      : overview.records
    : []

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Page header */}
      <div className="border-b-2 border-zinc-900 pb-5">
        <h1 className="text-3xl font-black text-zinc-950">Records</h1>
        <p className="mt-1 text-sm text-zinc-600">Browse stored records by collection.</p>
      </div>

      {/* Empty state */}
      {!loading && overview && overview.records.length === 0 && (
        <div className="border-2 border-zinc-900 bg-white p-8 text-center shadow-brutal-lg">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border-2 border-zinc-900 bg-primary/10">
            <DatabaseIcon className="h-6 w-6 text-primary" />
          </div>
          <p className="text-lg font-bold text-zinc-900">No records yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600">
            Store records from your game using the SDK.
          </p>
          <Button asChild className="mt-4">
            <Link to="/dashboard/projects/$projectId/setup" params={{ projectId }}>View Setup</Link>
          </Button>
        </div>
      )}

      {/* Collection filter */}
      {overview && overview.records.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCollection(null)}
              className={`border-2 px-3 py-1.5 text-sm font-bold transition-all ${
                !selectedCollection
                  ? "border-zinc-900 bg-primary text-white shadow-brutal-sm"
                  : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-900"
              }`}
            >
              All ({overview.records.length})
            </button>
            {allCollections.map((name) => {
              const count = overview.records.filter((r) => r.collection === name).length
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedCollection(name)}
                  className={`border-2 px-3 py-1.5 text-sm font-bold transition-all ${
                    selectedCollection === name
                      ? "border-zinc-900 bg-primary text-white shadow-brutal-sm"
                      : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-900"
                  }`}
                >
                  {name} ({count})
                </button>
              )
            })}
          </div>

          {/* Records list */}
          <div className="border-2 border-zinc-900 shadow-brutal-lg">
            <div className="flex items-center gap-2 border-b-2 border-zinc-900 bg-zinc-950 px-5 py-3">
              <DatabaseIcon className="h-4 w-4 text-secondary" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                {selectedCollection ?? "All Collections"} â€” {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="divide-y-2 divide-zinc-200 bg-white">
              {filteredRecords.map((record) => (
                <div key={record.id} className="p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="border-2 border-primary bg-red-50 px-2 py-0.5 text-xs font-black text-primary">
                      {record.collection}
                    </span>
                    <span className="font-mono text-sm font-semibold text-zinc-900">{record.record_key}</span>
                    <span className="ml-auto text-xs text-zinc-500">{formatDate(record.updated_at)}</span>
                  </div>
                  <div className="border-2 border-zinc-900 bg-zinc-900">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-700 bg-zinc-800">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="ml-2 text-[10px] text-zinc-500 font-mono">{record.record_key}.json</span>
                    </div>
                    <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-100">
                      {JSON.stringify(record.data_jsonb, null, 2)}
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
  }).format(new Date(value))
}
