--!strict

local Retry = {}

function Retry.run(callback, attempts: number?)
	local maxAttempts = attempts or 2
	local lastError = nil

	for attempt = 1, maxAttempts do
		local ok, result = pcall(callback)
		if ok then
			return result
		end

		lastError = result
		if attempt < maxAttempts then
			task.wait(0.2 * attempt)
		end
	end

	error(lastError, 0)
end

return Retry
