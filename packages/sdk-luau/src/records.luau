--!strict
--[[
	Records module — CRUD access to StackFox record collections.

	── Untyped (quick, one-off) ──────────────────────────────────────────────────

	  local data = stackfox.records:get("players", userId)
	  stackfox.records:set("players", userId, { coins = 100 })

	── Generic (typed return, single call) ──────────────────────────────────────

	  type PlayerData = { coins: number, level: number, xp: number }
	  local data: PlayerData = stackfox.records:get("players", userId)

	── TypedStore (typed, scoped to one collection) ──────────────────────────────

	  type PlayerData = { coins: number, level: number, xp: number }
	  local Players = stackfox.records:store("players") :: Records.TypedStore<PlayerData>

	  local data   = Players:get(userId)            -- inferred as PlayerData
	  local saved  = Players:set(userId, { ... })   -- expects PlayerData
	  Players:delete(userId)
]]

local Types = require("./types")

type RequestFn = Types.RequestFn

-- Re-export so callers can annotate `Records.TypedStore<T>` without importing types directly.
export type TypedStore<T> = Types.TypedStore<T>

local Records = {}
Records.__index = Records

function Records.new(request: RequestFn)
	return setmetatable({
		_request = request,
	}, Records)
end

--- Fetch a record's data from `collection` under `key`.
---
--- Annotate the receiving variable (or use `::`) to unlock autocomplete:
---   `local profile: PlayerData = stackfox.records:get("players", userId)`
function Records:get<T>(collection: string, key: string): T
	assert(
		type(collection) == "string" and #collection > 0,
		"[StackFox] records:get() — collection must be a non-empty string"
	)
	assert(
		type(key) == "string" and #key > 0,
		"[StackFox] records:get() — key must be a non-empty string"
	)

	local result = self._request("GET", "/v1/records/" .. collection .. "/" .. key)
	return result.record.data_jsonb :: T
end

--- Write `data` to `collection` under `key` and return the saved value.
---
--- The type of `data` and the return value are unified under `T`:
---   `local saved: PlayerData = stackfox.records:set("players", userId, { coins = 50 })`
function Records:set<T>(collection: string, key: string, data: T): T
	assert(
		type(collection) == "string" and #collection > 0,
		"[StackFox] records:set() — collection must be a non-empty string"
	)
	assert(
		type(key) == "string" and #key > 0,
		"[StackFox] records:set() — key must be a non-empty string"
	)
	assert(type(data) == "table", "[StackFox] records:set() — data must be a table")

	local result = self._request("PUT", "/v1/records/" .. collection .. "/" .. key, {
		data = data :: any,
	})
	return result.record.data_jsonb :: T
end

--- Delete the record at `collection`/`key`.
function Records:delete(collection: string, key: string): ()
	assert(
		type(collection) == "string" and #collection > 0,
		"[StackFox] records:delete() — collection must be a non-empty string"
	)
	assert(
		type(key) == "string" and #key > 0,
		"[StackFox] records:delete() — key must be a non-empty string"
	)

	self._request("DELETE", "/v1/records/" .. collection .. "/" .. key)
end

--- Create a typed, collection-scoped store.
---
--- Annotate the variable to bind the data type `T`:
---   type PlayerData = { coins: number, level: number }
---   local Players = stackfox.records:store("players") :: Records.TypedStore<PlayerData>
---
--- All methods on the returned store are then typed to `PlayerData`.
function Records:store<T>(collection: string): TypedStore<T>
	assert(
		type(collection) == "string" and #collection > 0,
		"[StackFox] records:store() — collection must be a non-empty string"
	)

	local request: RequestFn = self._request

	local function path(key: string): string
		return "/v1/records/" .. collection .. "/" .. key
	end

	return {
		get = function(_self: TypedStore<T>, key: string): T
			assert(
				type(key) == "string" and #key > 0,
				"[StackFox] store:get() — key must be a non-empty string"
			)
			local result = request("GET", path(key))
			return result.record.data_jsonb :: T
		end,

		set = function(_self: TypedStore<T>, key: string, data: T): T
			assert(
				type(key) == "string" and #key > 0,
				"[StackFox] store:set() — key must be a non-empty string"
			)
			assert(type(data) == "table", "[StackFox] store:set() — data must be a table")
			local result = request("PUT", path(key), { data = data :: any })
			return result.record.data_jsonb :: T
		end,

		delete = function(_self: TypedStore<T>, key: string): ()
			assert(
				type(key) == "string" and #key > 0,
				"[StackFox] store:delete() — key must be a non-empty string"
			)
			request("DELETE", path(key))
		end,
	}
end

return Records
