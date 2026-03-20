# @stackfox/sdk-luau

The in-development Luau SDK for StackFox.

Use this package in your Roblox game to send events and read or write records through the StackFox platform.

## Implemented API

```lua
local StackFox = require(...)

StackFox.init({
    apiKey = "YOUR_API_KEY",
    projectId = "YOUR_PROJECT_ID",
    -- Optional for local development
    -- baseUrl = "http://localhost:3443",
})

StackFox.events:track("player_join", {
    userId = tostring(player.UserId),
})

StackFox.records:set("players", tostring(player.UserId), {
    coins = 100,
})

local profile = StackFox.records:get("players", tostring(player.UserId))
StackFox.records:delete("players", tostring(player.UserId))
```

## Tooling

This package includes local Roblox tooling config:

- `rojo` via `rokit.toml`
- `wally` via `rokit.toml`

## Contributing

Contributions to this package are welcome! Please open an issue or submit a pull request with your changes.
