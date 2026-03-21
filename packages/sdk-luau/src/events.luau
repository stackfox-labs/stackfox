--!strict

local Types = require("./types")

type RequestFn     = Types.RequestFn
type EventResponse = Types.EventResponse

local Events = {}
Events.__index = Events

function Events.new(request: RequestFn)
	return setmetatable({
		_request = request,
	}, Events)
end

--- Track a named event with an optional payload.
--- Returns the event object created by the API.
function Events:track(name: string, payload: { [string]: any }?): EventResponse
	assert(
		type(name) == "string" and #name > 0,
		"[StackFox] events:track() — name must be a non-empty string"
	)

	local result = self._request("POST", "/v1/events", {
		name    = name,
		payload = payload or {},
	})

	return result.event :: any
end

return Events
