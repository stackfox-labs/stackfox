--!strict

local Types = require("./types")

type ConfigValue = Types.Config
type InitConfig  = Types.InitConfig

local Config = {}

Config.DEFAULT_BASE_URL = "https://api.stackfox.dev"

function Config.normalize(input: InitConfig): ConfigValue
	assert(type(input) == "table", "[StackFox] init() expects a config table")
	assert(
		type(input.apiKey) == "string" and #input.apiKey > 0,
		"[StackFox] init() — apiKey must be a non-empty string"
	)

	if input.baseUrl ~= nil then
		assert(
			type(input.baseUrl) == "string" and #input.baseUrl > 0,
			"[StackFox] init() — baseUrl must be a non-empty string"
		)
	end

	return {
		apiKey  = input.apiKey,
		baseUrl = input.baseUrl or Config.DEFAULT_BASE_URL,
	}
end

return Config
