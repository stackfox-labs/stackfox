--!strict

local Types = require("./types")

type RequestFn     = Types.RequestFn
type EventResponse = Types.EventResponse

export type EventsClass = {
	track: (self: EventsClass, name: string, payload: { [string]: any }?) -> EventResponse,
}

local Events = {}

function Events.new(request: RequestFn): EventsClass
	return {
		track = function(_: EventsClass, name: string, payload: { [string]: any }?): EventResponse
			assert(
				type(name) == "string" and #name > 0,
				"[StackFox] events:track() — name must be a non-empty string"
			)

			local result = request("POST", "/v1/events", {
				name    = name,
				payload = (payload or {}) :: { [string]: any },
			})

			return result.event :: any
		end,
	}
end

return Events
