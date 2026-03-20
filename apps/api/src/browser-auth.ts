import crypto from "node:crypto";
import type { Request, Response } from "express";
import { config } from "./config.js";
import { ApiError } from "./errors.js";
import { prisma } from "./prisma.js";
import type { AccessibleProject, DashboardSession, DashboardUser } from "./types.js";

const SESSION_COOKIE_NAME = "stackfox_session";
const ROBLOX_AUTHORIZE_URL = "https://apis.roblox.com/oauth/v1/authorize";
const ROBLOX_TOKEN_URL = "https://apis.roblox.com/oauth/v1/token";
const ROBLOX_USERINFO_URL = "https://apis.roblox.com/oauth/v1/userinfo";

function base64UrlEncode(input: Buffer) {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function hashCodeVerifier(codeVerifier: string) {
  return base64UrlEncode(crypto.createHash("sha256").update(codeVerifier).digest());
}

function isSecureCookie() {
  return config.appOrigin.startsWith("https://");
}

function parseCookieHeader(headerValue: string | undefined) {
  const pairs = (headerValue ?? "").split(/;\s*/).filter(Boolean);
  const cookies = new Map<string, string>();

  for (const pair of pairs) {
    const index = pair.indexOf("=");
    if (index === -1) {
      continue;
    }

    const name = pair.slice(0, index);
    const value = pair.slice(index + 1);
    cookies.set(name, decodeURIComponent(value));
  }

  return cookies;
}

function getSessionCookie(req: Request) {
  return parseCookieHeader(req.header("cookie")).get(SESSION_COOKIE_NAME) ?? null;
}

export function hasRobloxOAuthConfig() {
  return Boolean(config.robloxOauthClientId && config.robloxOauthClientSecret && config.robloxOauthRedirectUri);
}

export function setDashboardSessionCookie(res: Response, sessionId: string) {
  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
  });
}

export function clearDashboardSessionCookie(res: Response) {
  res.cookie(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
    expires: new Date(0),
  });
}

export async function createOauthLoginState(returnTo: string) {
  const state = crypto.randomUUID();
  const codeVerifier = base64UrlEncode(crypto.randomBytes(32));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.oauthLoginState.create({
    data: {
      state,
      codeVerifier,
      returnTo,
      expiresAt,
    },
  });

  return {
    state,
    codeVerifier,
    codeChallenge: hashCodeVerifier(codeVerifier),
  };
}

export function buildRobloxAuthorizeUrl(input: { state: string; codeChallenge: string }) {
  const url = new URL(ROBLOX_AUTHORIZE_URL);
  url.searchParams.set("client_id", config.robloxOauthClientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", config.robloxOauthRedirectUri);
  url.searchParams.set("scope", config.robloxOauthScopes.join(" "));
  url.searchParams.set("state", input.state);
  url.searchParams.set("code_challenge", input.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

export async function consumeOauthLoginState(state: string) {
  const row = await prisma.oauthLoginState.findUnique({ where: { state } });
  if (!row) {
    throw new ApiError(400, "INVALID_OAUTH_STATE", "OAuth state is invalid or has expired");
  }

  await prisma.oauthLoginState.delete({ where: { state } });

  if (row.expiresAt.getTime() < Date.now()) {
    throw new ApiError(400, "INVALID_OAUTH_STATE", "OAuth state has expired");
  }

  return row;
}

export async function exchangeAuthorizationCode(code: string, codeVerifier: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.robloxOauthClientId,
    client_secret: config.robloxOauthClientSecret,
    code,
    redirect_uri: config.robloxOauthRedirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch(ROBLOX_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });

  const payload = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    throw new ApiError(502, "ROBLOX_TOKEN_EXCHANGE_FAILED", String(payload.error_description ?? payload.error ?? "Token exchange failed"));
  }

  return payload;
}

export async function fetchRobloxUserProfile(accessToken: string) {
  const response = await fetch(ROBLOX_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const payload = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    throw new ApiError(502, "ROBLOX_USERINFO_FAILED", String(payload.error_description ?? payload.error ?? "Failed to fetch Roblox profile"));
  }

  const robloxUserId = payload.sub ?? payload.id ?? payload.user_id;
  const username = payload.preferred_username ?? payload.username ?? payload.name ?? payload.nickname;
  const displayName = payload.name ?? payload.display_name ?? payload.nickname ?? payload.preferred_username ?? username;

  if (!robloxUserId || !username || !displayName) {
    throw new ApiError(502, "ROBLOX_USERINFO_INVALID", "Roblox user profile response was missing required fields");
  }

  return {
    robloxUserId: String(robloxUserId),
    username: String(username),
    displayName: String(displayName),
    avatarUrl: payload.picture ? String(payload.picture) : null,
  };
}

export async function upsertDashboardUser(profile: {
  robloxUserId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}) {
  const row = await prisma.dashboardUser.upsert({
    where: { robloxUserId: profile.robloxUserId },
    update: {
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    },
    create: {
      robloxUserId: profile.robloxUserId,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    },
  });

  return {
    id: row.id,
    robloxUserId: row.robloxUserId,
    username: row.username,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  } satisfies DashboardUser;
}

export async function createDashboardSession(input: {
  userId: string;
  accessToken: string;
  refreshToken: string | null;
  tokenType: string;
  scope: string;
  expiresAt: string | null;
}) {
  const row = await prisma.dashboardSession.create({
    data: {
      userId: input.userId,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      tokenType: input.tokenType,
      scope: input.scope,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
  });

  return {
    id: row.id,
    userId: row.userId,
    accessToken: row.accessToken,
    refreshToken: row.refreshToken,
    tokenType: row.tokenType,
    scope: row.scope,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    lastSeenAt: row.lastSeenAt.toISOString(),
  } satisfies DashboardSession;
}

export async function deleteDashboardSession(sessionId: string) {
  await prisma.dashboardSession.deleteMany({ where: { id: sessionId } });
}

export async function getDashboardSession(req: Request) {
  const sessionId = getSessionCookie(req);
  if (!sessionId) {
    return null;
  }

  const row = await prisma.dashboardSession.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!row) {
    return null;
  }

  // Fire-and-forget: don't block the response for a non-critical timestamp update
  void prisma.dashboardSession.update({
    where: { id: sessionId },
    data: { lastSeenAt: new Date() },
  }).catch(() => {});

  return {
    session: {
      id: row.id,
      userId: row.userId,
      accessToken: row.accessToken,
      refreshToken: row.refreshToken,
      tokenType: row.tokenType,
      scope: row.scope,
      expiresAt: row.expiresAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      lastSeenAt: row.lastSeenAt.toISOString(),
    } satisfies DashboardSession,
    user: {
      id: row.user.id,
      robloxUserId: row.user.robloxUserId,
      username: row.user.username,
      displayName: row.user.displayName,
      avatarUrl: row.user.avatarUrl,
      createdAt: row.user.createdAt.toISOString(),
      updatedAt: row.user.updatedAt.toISOString(),
    } satisfies DashboardUser,
  };
}

export async function getAccessibleProjectsForUser(userId: string) {
  const rows = await prisma.projectMembership.findMany({
    where: { userId },
    include: { project: true },
    orderBy: { createdAt: "asc" },
  });

  return rows.map(
    (row: { project: { id: string; name: string; createdAt: Date }; role: string }) =>
      ({
        id: row.project.id,
        name: row.project.name,
        created_at: row.project.createdAt.toISOString(),
        role: row.role,
      }) satisfies AccessibleProject,
  );
}

export async function linkProjectMembership(userId: string, apiKey: string) {
  const project = await prisma.project.findUnique({ where: { apiKey } });
  if (!project) {
    throw new ApiError(404, "PROJECT_NOT_FOUND", "No project matched the provided API key");
  }

  await prisma.projectMembership.upsert({
    where: {
      userId_projectId: {
        userId,
        projectId: project.id,
      },
    },
    update: {},
    create: {
      userId,
      projectId: project.id,
    },
  });

  return project.id;
}

export async function createProjectForUser(userId: string, name: string) {
  const id = `proj_${crypto.randomBytes(8).toString("hex")}`;
  const apiKey = `sf_live_${crypto.randomBytes(16).toString("hex")}`;

  const project = await prisma.project.create({
    data: { id, name, apiKey },
  });

  await prisma.projectMembership.create({
    data: { userId, projectId: project.id, role: "owner" },
  });

  return {
    id: project.id,
    name: project.name,
    apiKey: project.apiKey,
    created_at: project.createdAt.toISOString(),
  };
}

export async function deleteProjectForUser(userId: string, projectId: string) {
  const membership = await prisma.projectMembership.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (!membership) {
    throw new ApiError(403, "PROJECT_ACCESS_DENIED", "You do not have access to this project");
  }

  if (membership.role !== "owner") {
    throw new ApiError(403, "NOT_PROJECT_OWNER", "Only the project owner can delete the project");
  }

  await prisma.project.delete({ where: { id: projectId } });
}

export async function revokeProjectApiKey(userId: string, projectId: string) {
  const membership = await prisma.projectMembership.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (!membership) {
    throw new ApiError(403, "PROJECT_ACCESS_DENIED", "You do not have access to this project");
  }

  if (membership.role !== "owner") {
    throw new ApiError(403, "NOT_PROJECT_OWNER", "Only the project owner can revoke API keys");
  }

  const newApiKey = `sf_live_${crypto.randomBytes(16).toString("hex")}`;
  await prisma.project.update({ where: { id: projectId }, data: { apiKey: newApiKey } });

  return newApiKey;
}

export function buildCallbackRedirect(params: Record<string, string>) {
  const url = new URL("/auth/callback", config.appOrigin);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

