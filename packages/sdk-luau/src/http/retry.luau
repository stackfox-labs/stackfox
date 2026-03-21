--!strict

local Retry = {}

--- Execute `callback`, retrying up to `attempts` times with exponential backoff.
--- Returns the callback's result on success, or re-raises the last error.
function Retry.run<T>(callback: () -> T, attempts: number?): T
	local maxAttempts = attempts or 2
	local lastError: any = nil

	for attempt = 1, maxAttempts do
		local ok, result = pcall(callback)
		if ok then
			return result :: T
		end

		lastError = result
		if attempt < maxAttempts then
			task.wait(0.2 * attempt)
		end
	end

	error(lastError, 0)
end

return Retry
