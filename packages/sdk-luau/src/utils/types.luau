--!strict
-- Moved to `src/types.luau`. This shim exists for backwards compatibility.
-- Update any imports to use `../types` (or `@self/types` from the root).

local Types = require("../types")

export type HttpMethod  = Types.HttpMethod
export type InitConfig  = Types.InitConfig
export type Config      = Types.Config
export type State          = Types.State
export type RequestFn      = Types.RequestFn
export type EventResponse  = Types.EventResponse
export type RecordEnvelope = Types.RecordEnvelope
export type TypedStore<T>  = Types.TypedStore<T>

return Types
