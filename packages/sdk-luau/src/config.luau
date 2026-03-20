--!strict

local RunService = game:GetService("RunService")
local Types = require("./utils/types")

type ConfigValue = Types.Config
type Environment = Types.Environment

local Config = {}

Config.DEFAULT_BASE_URL = "https://api.stackfox.dev"

function Config.normalize(input): ConfigValue
	assert(type(input) == "table", "[StackFox] init() expects a config table")
	assert(type(input.apiKey) == "string" and #input.apiKey > 0, "[StackFox] init() requires apiKey")

	local environment = input.environment or Types.DEFAULT_ENVIRONMENT
	if type(environment) ~= "string" or not Types.VALID_ENVIRONMENTS[environment] then
		error("[StackFox] init() environment must be 'development' or 'production'", 3)
	end

	if input.baseUrl ~= nil then
		assert(type(input.baseUrl) == "string" and #input.baseUrl > 0, "[StackFox] baseUrl must be a non-empty string")
	end

	return {
		apiKey = input.apiKey,
		environment = environment :: Environment,
		baseUrl = input.baseUrl or Config.DEFAULT_BASE_URL,
		requestOrigin = if RunService:IsStudio() then "studio" else "runtime",
	}
end

return Config
