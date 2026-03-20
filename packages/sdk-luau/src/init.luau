--!strict
--[[
	StackFox Luau SDK
	Roblox data bridge: Events and Records.
]]

local Config = require("@self/config")
local Request = require("@self/http/request")
local Events = require("@self/events")
local Records = require("@self/records")
local Types = require("@self/utils/types")

type State = Types.State
type RequestFn = Types.RequestFn

local StackFox = {}

local state: State = {
	config = nil,
	initResult = nil,
}

local request: RequestFn = Request.create(function(): State
	return state
end)

StackFox.events = Events.new(request)
StackFox.records = Records.new(request)

function StackFox.init(config)
	local normalizedConfig = Config.normalize(config)
	state.config = normalizedConfig
	state.initResult = { ok = true }
	return StackFox
end

return StackFox
