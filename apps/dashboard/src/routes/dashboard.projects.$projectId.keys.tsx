import { createFileRoute } from "@tanstack/react-router"
import { CopyIcon, EyeIcon, EyeOffIcon, KeyIcon } from "lucide-react"
import { useState } from "react"
import { useProject } from "@/components/dashboard/project-context"
import { Button } from "@/components/ui/button"
import { LuaCode } from "@/components/ui/lua-code"

export const Route = createFileRoute("/dashboard/projects/$projectId/keys")({
  component: KeysPage,
})

function KeysPage() {
  const { overview } = useProject()
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const apiKey = overview?.project.api_key ?? ""
  const maskedKey = apiKey ? apiKey.slice(0, 8) + "\u2022".repeat(Math.max(0, apiKey.length - 8)) : ""

  function copyKey() {
    void navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-200 bg-white">
        <div>
          <h1 className="text-base font-bold text-zinc-900">API Keys</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Authentication keys for the Luau SDK.</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Key card */}
        <div className="border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-200 bg-zinc-50">
            <KeyIcon className="h-3.5 w-3.5 text-zinc-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Project API Key</p>
            <span className="ml-auto border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
              Active
            </span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-900 overflow-hidden">
                <span className="block truncate">{revealed ? apiKey : maskedKey}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border border-zinc-200 h-9 px-2.5"
                onClick={() => setRevealed(!revealed)}
                title={revealed ? "Hide key" : "Reveal key"}
              >
                {revealed ? <EyeOffIcon className="h-3.5 w-3.5" /> : <EyeIcon className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border border-zinc-200 h-9 px-2.5"
                onClick={copyKey}
                title="Copy key"
              >
                {copied ? (
                  <span className="text-[11px] font-bold text-green-600">Copied!</span>
                ) : (
                  <CopyIcon className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-zinc-400">
              Created{" "}
              {overview?.project.created_at
                ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
                    new Date(overview.project.created_at),
                  )
                : "—"}
            </p>
          </div>
        </div>

        {/* Usage snippet */}
        <div className="border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-200 bg-zinc-50">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Usage</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-zinc-500 mb-3">
              Initialize StackFox in your game server script with this key.
            </p>
            <div className="border border-zinc-200 bg-zinc-900">
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-zinc-700 bg-zinc-800">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="ml-1 text-[10px] text-zinc-500 font-mono">init.server.lua</span>
              </div>
              <LuaCode
                code={`local StackFox = require(game.ReplicatedStorage.StackFox)\n\nStackFox.init({\n    apiKey = "${revealed ? apiKey : "sf_live_..."}",\n    projectId = "${overview?.project.id ?? "..."}",\n})`}
              />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="border border-zinc-100 bg-zinc-50 px-4 py-3">
          <p className="text-xs text-zinc-500">
            An API key is generated automatically when a project is created. Key rotation is coming in a future release.
            To invalidate keys now, use{" "}
            <span className="font-medium text-zinc-700">Settings → Revoke All API Keys</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
