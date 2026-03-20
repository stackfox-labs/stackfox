--!strict

local Types = require("./utils/types")

type RequestFn = Types.RequestFn

local Records = {}
Records.__index = Records

function Records.new(request: RequestFn)
	return setmetatable({
		_request = request,
	}, Records)
end

function Records:get(collection: string, key: string)
	assert(type(collection) == "string" and #collection > 0, "[StackFox] records:get() requires a collection name")
	assert(type(key) == "string" and #key > 0, "[StackFox] records:get() requires a record key")

	local result = self._request("GET", "/v1/records/" .. collection .. "/" .. key)
	return result.record.data_jsonb
end

function Records:set(collection: string, key: string, data: { [string]: any })
	assert(type(collection) == "string" and #collection > 0, "[StackFox] records:set() requires a collection name")
	assert(type(key) == "string" and #key > 0, "[StackFox] records:set() requires a record key")
	assert(type(data) == "table", "[StackFox] records:set() requires a data table")

	local result = self._request("PUT", "/v1/records/" .. collection .. "/" .. key, {
		data = data,
	})
	return result.record.data_jsonb
end

function Records:delete(collection: string, key: string)
	assert(type(collection) == "string" and #collection > 0, "[StackFox] records:delete() requires a collection name")
	assert(type(key) == "string" and #key > 0, "[StackFox] records:delete() requires a record key")

	return self._request("DELETE", "/v1/records/" .. collection .. "/" .. key)
end

return Records
