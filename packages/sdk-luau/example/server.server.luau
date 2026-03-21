local StackFox = require("../src")
local http = game:GetService("HttpService")

StackFox.init({
    apiKey = http:GetSecret("STACKFOX_API_KEY"),
    projectId = "proj_6d2ee47eb2547a69",
    baseUrl = "http://localhost:3443/",
})

StackFox.events:track("Server Started", {
    timestamp = os.time(),
})

-- On player join, track an event
game:GetService("Players").PlayerAdded:Connect(function(player)
    StackFox.events:track("Player Joined", {
        playerId = player.UserId,
        timestamp = os.time(),
    })
end)

-- On player leave, track an event
game:GetService("Players").PlayerRemoving:Connect(function(player)
    StackFox.events:track("Player Left", {
        playerId = player.UserId,
        timestamp = os.time(),
    })
end)

-- On server shutdown, track an event
game:BindToClose(function()
    StackFox.events:track("Server Shutdown", {
        timestamp = os.time(),
    })
end)

-- Records

-- StackFox.records:set("profiles", tostring(player.UserId), {
--   xp = 2400,
--   level = 12,
--   lastSeen = os.time(),
-- })

-- local profile = StackFox.records:get("profiles", tostring(player.UserId))
 
-- if profile then
--   print("Level:", profile.level)
-- else
--   -- First time player — create default profile
--   StackFox.records:set("profiles", tostring(player.UserId), {
--     xp = 0,
--     level = 1,
--   })
-- end

-- Update serverUpdate record every 5 seconds
task.spawn(function()
    while true do
        StackFox.records:set("serverUpdate", "latest", {
            timestamp = os.time(),
            playerCount = #game:GetService("Players"):GetPlayers(),
        })
        task.wait(5)
    end
end)

-- 