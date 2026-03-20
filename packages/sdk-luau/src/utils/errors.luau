--!strict

local RunService = game:GetService("RunService")

local Errors = {}

function Errors.raise(message: string, level: number?)
	error("[StackFox] " .. message, level or 2)
end

function Errors.assertStudio(level: number?)
	if not RunService:IsStudio() then
		Errors.raise("schema operations can only run inside Roblox Studio.", level or 3)
	end
end

function Errors.messageFromResponse(statusCode: number, decoded: any): string
	if decoded and decoded.error then
		return tostring(decoded.error)
	end

	return "Request failed (" .. tostring(statusCode) .. ")"
end

return Errors
