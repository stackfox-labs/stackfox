import { createFileRoute } from "@tanstack/react-router"
import { LuaCode } from "@/components/ui/lua-code"

export const Route = createFileRoute("/dashboard/projects/$projectId/setup")({
  component: SetupPage,
})

function SetupPage() {
  const steps = [
    {
      title: "Install the SDK",
      description: "Add StackFox to your Roblox Studio project. Download the module from the toolbox or use a package manager.",
      code: `-- Add StackFox to ReplicatedStorage
-- or require from your package manager`,
      filename: "setup.lua",
    },
    {
      title: "Initialize the SDK",
      description: "Call init with your API key at the start of your game server script. You can find your API key in Settings.",
      code: `local StackFox = require(game.ReplicatedStorage.StackFox)\n\nStackFox.init({\n    apiKey = "YOUR_API_KEY",\n    -- Optional: override base URL for local dev\n    -- baseUrl = "http://localhost:3443",\n})`,
      filename: "init.server.lua",
    },
    {
      title: "Send your first event",
      description: "Track game events like player joins, purchases, and milestones.",
      code: `StackFox.events:track("player_join", {\n    userId = tostring(player.UserId),\n    username = player.Name,\n    region = "us-east",\n})`,
      filename: "events.server.lua",
    },
    {
      title: "Store your first record",
      description: "Use the records API to persist key-value data organized by collection.",
      code: `-- Save player data\nStackFox.records:set("players", tostring(player.UserId), {\n    username = player.Name,\n    coins = 100,\n    level = 1,\n})\n\n-- Read it back\nlocal data = StackFox.records:get("players", tostring(player.UserId))\nprint(data.coins) -- 100\n\n-- Delete it\nStackFox.records:delete("players", tostring(player.UserId))`,
      filename: "records.server.lua",
    },
  ]

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Page header */}
      <div className="border-b-2 border-zinc-900 pb-5">
        <h1 className="text-3xl font-black text-zinc-950">Setup</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Get from zero to a working integration in four steps.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="border-2 border-zinc-900 bg-white shadow-brutal-sm">
            <div className="flex items-start gap-4 p-5 pb-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-zinc-900 bg-primary text-sm font-black text-white shadow-brutal-sm">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-black text-zinc-950">{step.title}</h2>
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
  )
}
