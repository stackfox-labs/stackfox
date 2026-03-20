--!strict

local Types = require("./utils/types")

type RequestFn = Types.RequestFn

local Events = {}
Events.__index = Events

function Events.new(request: RequestFn)
	return setmetatable({
		_request = request,
	}, Events)
end

function Events:track(name: string, payload: { [string]: any }?)
	assert(type(name) == "string" and #name > 0, "[StackFox] events:track() requires a non-empty event name")

	local body = {
		name = name,
		payload = payload or {},
	}

	local result = self._request("POST", "/v1/events", body)
	return result.event
end

return Events
