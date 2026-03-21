--!strict

local HttpService = game:GetService("HttpService")

local Retry  = require("./retry")
local Errors = require("../utils/errors")
local Types  = require("../types")

type State      = Types.State
type HttpMethod = Types.HttpMethod
type RequestFn  = Types.RequestFn

local Request = {}

local function buildUrl(baseUrl: string, path: string): string
	local base = baseUrl
	if string.sub(base, -1) == "/" then
		base = string.sub(base, 1, #base - 1)
	end
	return base .. path
end

function Request.create(getState: () -> State): RequestFn
	return function(
		method: HttpMethod,
		path: string,
		body: { [string]: any }?
	): { [string]: any }
		local state = getState()
		local config = state.config
		if not config then
			Errors.raise("init() must be called before using the SDK", 3)
			return {}
		end

		local payload: string? = nil
		if body ~= nil then
			payload = HttpService:JSONEncode(body)
		end

		local response = Retry.run(function()
			return HttpService:RequestAsync({
				Url    = buildUrl(config.baseUrl, path),
				Method = method,
				Headers = {
					["Content-Type"] = "application/json",
					["Authorization"] = if typeof(config.apiKey) == "Secret"
						then (config.apiKey :: Secret):AddPrefix("Bearer ")
						else "Bearer " .. (config.apiKey :: string),
				},
				Body     = payload,
				Compress = Enum.HttpCompression.None,
			})
		end, 2)

		local decoded: { [string]: any }? = nil
		if response.Body and response.Body ~= "" then
			local ok, result = pcall(HttpService.JSONDecode, HttpService, response.Body)
			if ok then
				decoded = result :: { [string]: any }
			end
		end

		if not response.Success then
			Errors.raise(Errors.messageFromResponse(response.StatusCode, decoded), 3)
		end

		return decoded or {}
	end
end

return Request
