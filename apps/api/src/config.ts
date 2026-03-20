import dotenv from "dotenv";

dotenv.config();

function splitScopes(value: string | undefined) {
  return (value ?? "openid profile").split(/[\s,]+/).filter(Boolean);
}

export const config = {
  port: Number(process.env.PORT ?? 3443),
  databaseUrl: process.env.DATABASE_URL ?? "",
  appOrigin: process.env.APP_ORIGIN ?? "http://localhost:3442",
  robloxOauthClientId: process.env.ROBLOX_OAUTH_CLIENT_ID ?? "",
  robloxOauthClientSecret: process.env.ROBLOX_OAUTH_CLIENT_SECRET ?? "",
  robloxOauthRedirectUri: process.env.ROBLOX_OAUTH_REDIRECT_URI ?? "http://localhost:3443/auth/roblox/callback",
  robloxOauthScopes: splitScopes(process.env.ROBLOX_OAUTH_SCOPES),
};
