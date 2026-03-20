--!strict

local HttpService = game:GetService("HttpService")
local Retry = require("./retry")
local Errors = require("../utils/errors")
local Types = require("../utils/types")

type State = Types.State
type HttpMethod = Types.HttpMethod
type RequestFn = Types.RequestFn
type RequestOptions = Types.RequestOptions

local Request = {}

local function buildUrl(baseUrl: string, path: string): string
	local normalizedBase = baseUrl
	if string.sub(normalizedBase, -1) == "/" then
		normalizedBase = string.sub(normalizedBase, 1, #normalizedBase - 1)
	end

	return normalizedBase .. path
end

function Request.create(getState: () -> State): RequestFn
	return function(method: HttpMethod, path: string, body: any?, options: RequestOptions?)
		local state = getState()
		local config = state.config
		if not config then
			Errors.raise("init() must be called before using the SDK", 3)
			return {}
		end

		local payload = nil
		if body ~= nil then
			payload = HttpService:JSONEncode(body)
		end

		local environment = if options and options.environment then options.environment else config.environment
		local origin = if options and options.origin then options.origin else config.requestOrigin

		local response = Retry.run(function()
			local requestOptions = {
				Url = buildUrl(config.baseUrl, path),
				Method = method,
				Headers = {
					["Content-Type"] = "application/json",
					["Authorization"] = "Bearer " .. config.apiKey,
					["x-stackfox-environment"] = environment,
					["x-stackfox-origin"] = origin,
				},
				Body = payload,
				Compress = Enum.HttpCompression.None,
			}
			return HttpService:RequestAsync(requestOptions)
		end, 2)

		local decoded = nil
		if response.Body and response.Body ~= "" then
			local ok, result = pcall(function()
				return HttpService:JSONDecode(response.Body)
			end)

			if ok then
				decoded = result
			end
		end

		if not response.Success then
			Errors.raise(Errors.messageFromResponse(response.StatusCode, decoded), 3)
		end

		return decoded or {}
	end
end

return Request
