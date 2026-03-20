import { createFileRoute } from "@tanstack/react-router"
import { LuaCode } from "@/components/ui/lua-code"

export const Route = createFileRoute("/dashboard/projects/$projectId/setup")({
  component: SetupPage,
})

const steps = [
  {
    title: "Install the SDK",
    description: "Add StackFox to your Roblox Studio project via the toolbox or package manager.",
    code: `-- Add StackFox to ReplicatedStorage
-- or require from your package manager`,
    filename: "setup.lua",
  },
  {
    title: "Initialize the SDK",
    description: "Call init with your API key at the top of your server script. Find your key in API Keys.",
    code: `local StackFox = require(game.ReplicatedStorage.StackFox)\n\nStackFox.init({\n    apiKey = "YOUR_API_KEY",\n    -- Optional: override for local dev\n    -- baseUrl = "http://localhost:3443",\n})`,
    filename: "init.server.lua",
  },
  {
    title: "Send your first event",
    description: "Track game events like player joins, purchases, and progression.",
    code: `StackFox.events:track("player_join", {\n    userId = tostring(player.UserId),\n    username = player.Name,\n    region = "us-east",\n})`,
    filename: "events.server.lua",
  },
  {
    title: "Sync your first record",
    description: "Write and read external records organized by collection.",
    code: `local playerId = tostring(player.UserId)\nStackFox.records:set("players", playerId, {\n    username = player.Name,\n    coins = 100,\n    level = 1,\n})\n\nlocal data = StackFox.records:get("players", playerId)\nprint(data.coins) -- 100\n\n-- Delete it\nStackFox.records:delete("players", playerId)`,
    filename: "records.server.lua",
  },
]

function SetupPage() {
  return (
    <div>
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-200 bg-white">
        <div>
          <h1 className="text-base font-bold text-zinc-900">Setup</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Connect your Roblox game to StackFox in four steps.</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="border border-zinc-200 bg-white">
            <div className="flex items-start gap-3 px-4 py-3.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-zinc-900 bg-primary text-[11px] font-black text-white">
                {index + 1}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">{step.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{step.description}</p>
              </div>
            </div>
            <div className="border-t border-zinc-200 bg-zinc-900">
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-zinc-700 bg-zinc-800">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="ml-1 text-[10px] text-zinc-500 font-mono">{step.filename}</span>
              </div>
              <LuaCode code={step.code} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
