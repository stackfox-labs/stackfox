--!strict
--[[
	StackFox Luau SDK — Type Definitions

	Single source of truth for all SDK types.
	Import this module wherever type annotations are needed.
]]

-- ── HTTP primitives ───────────────────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | "CONNECT" | "TRACE"

-- ── User-facing config ────────────────────────────────────────────────────────

--- Shape passed by the user to `StackFox.init()`.
--- Only `apiKey` is required.
export type InitConfig = {
	apiKey: string,
	baseUrl: string?,
}

-- ── Internal config ───────────────────────────────────────────────────────────

--- Normalized config stored after `init()`.
export type Config = {
	apiKey: string,
	baseUrl: string,
}

--- Internal SDK state threaded through the request layer.
export type State = {
	config: Config?,
}

-- ── HTTP layer ────────────────────────────────────────────────────────────────

--- The HTTP function injected into `Events` and `Records` at construction time.
export type RequestFn = (
	method: HttpMethod,
	path: string,
	body: { [string]: any }?
) -> { [string]: any }

-- ── API response shapes ───────────────────────────────────────────────────────

--- Shape returned by the API for a tracked event.
export type EventResponse = {
	id: string,
	event_name: string,
	payload_json: { [string]: any },
	created_at: string,
}

--- Raw record envelope as returned by the API.
--- The `data_jsonb` field is what callers actually work with.
export type RecordEnvelope = {
	id: string,
	collection: string,
	record_key: string,
	data_jsonb: { [string]: any },
	created_at: string,
	updated_at: string,
}

-- ── Typed store ───────────────────────────────────────────────────────────────

--- A collection handle scoped to a single collection name and a known data type.
---
--- Create one with `records:store()` and annotate the variable to get
--- full autocomplete for your data shape:
---
---   type Profile = { coins: number, level: number, xp: number }
---   local Profiles = stackfox.records:store("profiles") :: Records.TypedStore<Profile>
---   local profile = Profiles:get(userId)   -- inferred as Profile
---   Profiles:set(userId, { coins = 100, level = 5, xp = 200 })
---
export type TypedStore<T> = {
	get: (self: TypedStore<T>, key: string) -> T,
	set: (self: TypedStore<T>, key: string, data: T) -> T,
	delete: (self: TypedStore<T>, key: string) -> (),
}

-- ── Constants ─────────────────────────────────────────────────────────────────

local Types = {}

return Types
