import { createFileRoute } from "@tanstack/react-router"
import { CopyIcon, EyeIcon, EyeOffIcon, KeyIcon } from "lucide-react"
import { useState } from "react"
import { useProject } from "@/components/dashboard/project-context"
import { Badge } from "@/components/ui/badge"
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
    <div className="space-y-6 p-6 lg:p-8">
      {/* Page header */}
      <div className="border-b-2 border-zinc-900 pb-5">
        <h1 className="text-3xl font-black text-zinc-950">API Keys</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Manage project-scoped API keys for SDK authentication.
        </p>
      </div>

      {/* Default key */}
      <div className="group relative border-2 border-zinc-900 shadow-brutal-lg">
        <div className="absolute top-0 right-0 h-3 w-3 bg-secondary" />
        <div className="flex items-center gap-2 border-b-2 border-zinc-900 bg-zinc-950 px-5 py-3">
          <div className="flex h-6 w-6 items-center justify-center border border-primary/40 bg-primary/10">
            <KeyIcon className="h-3.5 w-3.5 text-primary" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Project API Key</p>
          <Badge variant="secondary" className="ml-auto rounded-none border-2 border-zinc-700 text-[10px]">
            Active
          </Badge>
        </div>
        <div className="space-y-4 bg-white p-5">
          <div className="flex items-center gap-2">
            <div className="flex-1 border-2 border-zinc-900 bg-zinc-100 px-3 py-2 font-mono text-sm">
              {revealed ? apiKey : maskedKey}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-zinc-900 shadow-brutal-sm"
              onClick={() => setRevealed(!revealed)}
            >
              {revealed ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-zinc-900 shadow-brutal-sm"
              onClick={copyKey}
            >
              {copied ? <span className="text-xs text-green-600 font-bold">Copied!</span> : <CopyIcon className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex gap-6 text-xs text-zinc-500">
            <div>
              <span className="font-bold uppercase tracking-[0.18em] text-zinc-400">Created</span>{" "}
              {overview?.project.created_at ? formatDate(overview.project.created_at) : "-"}
            </div>
          </div>
        </div>
      </div>

      {/* Usage snippet */}
      <div className="border-2 border-zinc-900 shadow-brutal-lg">
        <div className="border-b-2 border-zinc-900 bg-zinc-950 px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Usage</p>
        </div>
        <div className="bg-white p-5">
          <p className="mb-3 text-sm text-zinc-600">Use this key to initialize StackFox in your game server script.</p>
          <div className="border-2 border-zinc-900 bg-zinc-900">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-700 bg-zinc-800">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-2 text-[10px] text-zinc-500 font-mono">init.server.lua</span>
            </div>
            <LuaCode code={`local StackFox = require(game.ReplicatedStorage.StackFox)\n\nStackFox.init({\n    apiKey = "${revealed ? apiKey : "sf_live_..."}",\n    projectId = "${overview?.project.id ?? "..."}",\n    -- Optional: override for local dev or regions\n    -- baseUrl = "http://localhost:3443",\n})`} />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="border-2 border-zinc-300 bg-zinc-50 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">About API Keys</p>
        <ul className="space-y-1.5 text-sm text-zinc-600">
          <li>An API key is generated automatically when a project is created.</li>
          <li>Use this key in your Roblox game server script to authenticate with StackFox.</li>
          <li>Key rotation and multiple keys per project are coming in a future release.</li>
        </ul>
      </div>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
}
