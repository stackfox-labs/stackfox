import { createFileRoute } from "@tanstack/react-router"
import { BookOpenIcon, DatabaseIcon } from "lucide-react"
import { useState } from "react"
import { useProject } from "@/components/dashboard/project-context"

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
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-200 bg-white">
        <div>
          <h1 className="text-base font-bold text-zinc-900">Records</h1>
          <p className="text-xs text-zinc-500 mt-0.5">External records synced from your game.</p>
        </div>
        {overview && overview.records.length > 0 && (
          <span className="text-xs text-zinc-400">{overview.records.length} total</span>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Empty state */}
        {!loading && overview && overview.records.length === 0 && (
          <div className="border border-zinc-200 bg-white p-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border border-zinc-200 bg-zinc-50">
              <DatabaseIcon className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-900">No records yet</p>
            <p className="mt-1 text-xs text-zinc-500 max-w-xs mx-auto">
              Write records from your game using{" "}
              <code className="bg-zinc-100 px-1 py-0.5 font-mono text-[11px]">
                StackFox.records:set(...)
              </code>
            </p>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("stackfox:open-docs", { detail: { slug: "records" } }))}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900"
            >
              <BookOpenIcon className="h-3.5 w-3.5" />
              Records docs
            </button>
          </div>
        )}

        {/* Collection filter */}
        {overview && overview.records.length > 0 && (
          <>
            <div className="flex flex-wrap gap-1.5">
              <FilterButton
                label={`All (${overview.records.length})`}
                active={!selectedCollection}
                onClick={() => setSelectedCollection(null)}
              />
              {allCollections.map((name) => {
                const count = overview.records.filter((r) => r.collection === name).length
                return (
                  <FilterButton
                    key={name}
                    label={`${name} (${count})`}
                    active={selectedCollection === name}
                    onClick={() => setSelectedCollection(name)}
                  />
                )
              })}
            </div>

            <div className="border border-zinc-200 bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-200 bg-zinc-50">
                <DatabaseIcon className="h-3.5 w-3.5 text-zinc-400" />
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {selectedCollection ?? "All Collections"}
                </p>
                <span className="ml-auto text-xs text-zinc-400">
                  {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-zinc-100">
                {filteredRecords.map((record) => (
                  <div key={record.id} className="p-4">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <span className="border border-primary/30 bg-red-50 px-2 py-0.5 text-[11px] font-bold text-primary">
                        {record.collection}
                      </span>
                      <span className="font-mono text-xs font-semibold text-zinc-700">{record.record_key}</span>
                      <span className="ml-auto text-[10px] text-zinc-400">{formatDate(record.updated_at)}</span>
                    </div>
                    <div className="border border-zinc-200 bg-zinc-900">
                      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-zinc-700 bg-zinc-800">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="ml-1 text-[10px] text-zinc-500 font-mono">{record.record_key}.json</span>
                      </div>
                      <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-zinc-100">
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
  }).format(new Date(value))
}
