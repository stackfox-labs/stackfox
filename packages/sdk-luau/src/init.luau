--!strict
--[[
	StackFox Luau SDK
	Roblox data bridge: Events and Records.

	── Quick start ───────────────────────────────────────────────────────────────

	  local StackFox = require(path.to.StackFox)

	  StackFox.init({ apiKey = "your-api-key" })

	── Events ────────────────────────────────────────────────────────────────────

	  StackFox.events:track("player_joined", { userId = userId, level = 5 })

	── Records — untyped ────────────────────────────────────────────────────────

	  local data = StackFox.records:get("players", userId)
	  StackFox.records:set("players", userId, { coins = 100 })

	── Records — annotated generic ──────────────────────────────────────────────

	  type PlayerData = { coins: number, level: number, xp: number }
	  local data: PlayerData = StackFox.records:get("players", userId)

	── Records — TypedStore (best for repeated use) ─────────────────────────────

	  type PlayerData = { coins: number, level: number, xp: number }
	  local Players = StackFox.records:store("players") :: Records.TypedStore<PlayerData>

	  local data  = Players:get(userId)           -- inferred as PlayerData
	  Players:set(userId, { coins = 100, ... })   -- type-checked against PlayerData
	  Players:delete(userId)
]]

local Config  = require("@self/config")
local Request = require("@self/http/request")
local Events  = require("@self/events")
local Records = require("@self/records")
local Types   = require("@self/types")

type State      = Types.State
type RequestFn  = Types.RequestFn
type InitConfig = Types.InitConfig

local state: State = {
	config = nil,
}

local request: RequestFn = Request.create(function(): State
	return state
end)

local StackFox = {
	events  = Events.new(request),
	records = Records.new(request),
}

--- Initialize the SDK. Must be called once before `events` or `records` are used.
---
---   StackFox.init({ apiKey = "sk-..." })
---   StackFox.init({ apiKey = "sk-...", environment = "development" })
function StackFox.init(config: InitConfig)
	state.config = Config.normalize(config)
	return StackFox
end

return StackFox
