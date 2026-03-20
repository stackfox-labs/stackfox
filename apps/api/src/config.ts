import dotenv from "dotenv";

dotenv.config();

function normalizeOrigin(value: string) {
  return value.replace(/\/+$/, "");
}

function splitScopes(value: string | undefined) {
  return (value ?? "openid profile").split(/[\s,]+/).filter(Boolean);
}

function splitOrigins(value: string | undefined, fallback: string) {
  const rawValues = (value ?? fallback).split(/[\s,]+/).filter(Boolean);
  const normalized = rawValues.map(normalizeOrigin);
  return Array.from(new Set(normalized));
}

const appOrigin = normalizeOrigin(process.env.APP_ORIGIN ?? "http://localhost:3442");
const allowedAppOrigins = splitOrigins(process.env.APP_ORIGINS, appOrigin);

export const config = {
  port: Number(process.env.PORT ?? 3443),
  databaseUrl: process.env.DATABASE_URL ?? "",
  appOrigin,
  allowedAppOrigins,
  robloxOauthClientId: process.env.ROBLOX_OAUTH_CLIENT_ID ?? "",
  robloxOauthClientSecret: process.env.ROBLOX_OAUTH_CLIENT_SECRET ?? "",
  robloxOauthRedirectUri: process.env.ROBLOX_OAUTH_REDIRECT_URI ?? "http://localhost:3443/auth/roblox/callback",
  robloxOauthScopes: splitScopes(process.env.ROBLOX_OAUTH_SCOPES),
};
