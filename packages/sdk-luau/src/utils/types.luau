--!strict

export type Environment = "development" | "production"
export type RequestOrigin = "studio" | "runtime"
export type HttpMethod = "CONNECT" | "DELETE" | "GET" | "HEAD" | "OPTIONS" | "PATCH" | "POST" | "PUT" | "TRACE"

export type Config = {
	apiKey: string,
	environment: Environment,
	baseUrl: string,
	requestOrigin: RequestOrigin,
}

export type State = {
	config: Config?,
	initResult: any,
}

export type RequestOptions = {
	environment: Environment?,
	origin: RequestOrigin?,
}

export type RequestFn = (method: HttpMethod, path: string, body: any?, options: RequestOptions?) -> any

local Types = {
	DEFAULT_ENVIRONMENT = "production" :: Environment,
	VALID_ENVIRONMENTS = {
		development = true,
		production = true,
	} :: { [string]: boolean },
}

return Types
