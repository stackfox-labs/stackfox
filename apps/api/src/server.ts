import cors from "cors";
import express from "express";
import { dashboardSessionAuthMiddleware, apiKeyAuthMiddleware } from "./auth.js";
import {
  buildCallbackRedirect,
  buildRobloxAuthorizeUrl,
  clearDashboardSessionCookie,
  consumeOauthLoginState,
  createDashboardSession,
  createOauthLoginState,
  createProjectForUser,
  deleteProjectForUser,
  fetchRobloxUserProfile,
  getAccessibleProjectsForUser,
  getDashboardSession,
  hasRobloxOAuthConfig,
  linkProjectMembership,
  revokeProjectApiKey,
  setDashboardSessionCookie,
  upsertDashboardUser,
  exchangeAuthorizationCode,
  deleteDashboardSession,
} from "./browser-auth.js";
import { config } from "./config.js";
import { ApiError, isApiError } from "./errors.js";
import { prisma } from "./prisma.js";
import type { EventRow, RecordRow } from "./types.js";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = origin?.replace(/\/+$/, "");
      if (!normalizedOrigin || config.allowedAppOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${normalizedOrigin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

function logActivity(projectId: string, action: string, status: "success" | "error", message: string, meta?: Record<string, unknown>) {
  prisma.activityLog.create({
    data: { projectId, action, status, message, meta: (meta as any) ?? undefined },
  }).catch(() => {});
}

function asObject(value: unknown): Record<string, unknown> {
  return (value ?? {}) as Record<string, unknown>;
}

function mapRecord(record: {
  id: string;
  projectId: string;
  collection: string;
  recordKey: string;
  dataJsonb: unknown;
  createdAt: Date;
  updatedAt: Date;
}): RecordRow {
  return {
    id: record.id,
    project_id: record.projectId,
    collection: record.collection,
    record_key: record.recordKey,
    data_jsonb: asObject(record.dataJsonb),
    created_at: record.createdAt.toISOString(),
    updated_at: record.updatedAt.toISOString(),
  };
}

function mapEvent(event: {
  id: string;
  projectId: string;
  eventName: string;
  payloadJson: unknown;
  createdAt: Date;
}): EventRow {
  return {
    id: event.id,
    project_id: event.projectId,
    event_name: event.eventName,
    payload_json: asObject(event.payloadJson),
    created_at: event.createdAt.toISOString(),
  };
}

async function getProjectById(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return null;
  }

  return {
    id: project.id,
    name: project.name,
    api_key: project.apiKey,
    created_at: project.createdAt.toISOString(),
  };
}

const COLLECTION_NAME_RE = /^[a-zA-Z0-9_]+$/;

async function buildDashboardOverview(projectId: string) {
  const project = await getProjectById(projectId);
  if (!project) {
    throw new ApiError(404, "PROJECT_NOT_FOUND", "Project not found");
  }

  const [eventsResult, recordsResult, logsResult] = await Promise.all([
    prisma.event.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.recordEntry.findMany({
      where: { projectId: project.id },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.activityLog.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return {
    ok: true,
    project: {
      id: project.id,
      name: project.name,
      api_key: project.api_key,
      created_at: project.created_at,
    },
    events: eventsResult.map(mapEvent),
    records: recordsResult.map(mapRecord),
    logs: logsResult.map((log: { id: string; action: string; status: string; message: string; meta: unknown; createdAt: Date }) => ({
      id: log.id,
      action: log.action,
      status: log.status,
      message: log.message,
      meta: log.meta,
      created_at: log.createdAt.toISOString(),
    })),
  };
}

// ── Auth routes ──────────────────────────────────────────────────────────

app.get("/auth/roblox/login", async (req, res, next) => {
  try {
    if (!hasRobloxOAuthConfig()) {
      throw new ApiError(500, "OAUTH_NOT_CONFIGURED", "Roblox OAuth is not configured on the backend");
    }

    const requestedReturnTo = typeof req.query.returnTo === "string" ? req.query.returnTo : "/dashboard";
    const returnTo = requestedReturnTo.startsWith("/") ? requestedReturnTo : "/dashboard";
    const state = await createOauthLoginState(returnTo);
    res.redirect(buildRobloxAuthorizeUrl(state));
  } catch (error) {
    next(error);
  }
});

app.get("/auth/roblox/callback", async (req, res) => {
  try {
    if (!hasRobloxOAuthConfig()) {
      throw new ApiError(500, "OAUTH_NOT_CONFIGURED", "Roblox OAuth is not configured on the backend");
    }

    const code = typeof req.query.code === "string" ? req.query.code : "";
    const state = typeof req.query.state === "string" ? req.query.state : "";
    if (!code || !state) {
      throw new ApiError(400, "INVALID_OAUTH_CALLBACK", "Missing code or state in OAuth callback");
    }

    const stateRecord = await consumeOauthLoginState(state);
    const tokenResponse = await exchangeAuthorizationCode(code, stateRecord.codeVerifier);
    const accessToken = String(tokenResponse.access_token ?? "");
    const tokenType = String(tokenResponse.token_type ?? "Bearer");
    const scope = String(tokenResponse.scope ?? "");
    const refreshToken = tokenResponse.refresh_token ? String(tokenResponse.refresh_token) : null;
    const expiresAt = tokenResponse.expires_in
      ? new Date(Date.now() + Number(tokenResponse.expires_in) * 1000).toISOString()
      : null;

    if (!accessToken) {
      throw new ApiError(502, "ROBLOX_TOKEN_EXCHANGE_FAILED", "Roblox token response did not include an access token");
    }

    const profile = await fetchRobloxUserProfile(accessToken);
    const user = await upsertDashboardUser(profile);
    const session = await createDashboardSession({
      userId: user.id,
      accessToken,
      refreshToken,
      tokenType,
      scope,
      expiresAt,
    });

    setDashboardSessionCookie(res, session.id);
    res.redirect(buildCallbackRedirect({ status: "success", returnTo: stateRecord.returnTo }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth callback failed";
    res.redirect(buildCallbackRedirect({ status: "error", message }));
  }
});

app.get("/auth/session", async (req, res, next) => {
  try {
    const result = await getDashboardSession(req);
    if (!result) {
      res.json({ ok: true, authenticated: false, oauthConfigured: hasRobloxOAuthConfig() });
      return;
    }

    const projects = await getAccessibleProjectsForUser(result.user.id);
    res.json({
      ok: true,
      authenticated: true,
      oauthConfigured: hasRobloxOAuthConfig(),
      user: result.user,
      projects,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/logout", async (req, res, next) => {
  try {
    const existing = await getDashboardSession(req);
    if (existing) {
      await deleteDashboardSession(existing.session.id);
    }

    clearDashboardSessionCookie(res);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/projects/link", dashboardSessionAuthMiddleware, async (req, res, next) => {
  try {
    const apiKey = typeof req.body.apiKey === "string" ? req.body.apiKey.trim() : "";
    if (!apiKey) {
      throw new ApiError(400, "INVALID_PROJECT_API_KEY", "A project API key is required to link a project");
    }

    const projectId = await linkProjectMembership(req.dashboardUser!.id, apiKey);
    const projects = await getAccessibleProjectsForUser(req.dashboardUser!.id);
    res.json({ ok: true, projectId, projects });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/projects/create", dashboardSessionAuthMiddleware, async (req, res, next) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    if (!name) {
      throw new ApiError(400, "INVALID_PROJECT_NAME", "A project name is required");
    }

    if (name.length > 100) {
      throw new ApiError(400, "INVALID_PROJECT_NAME", "Project name must be 100 characters or fewer");
    }

    const created = await createProjectForUser(req.dashboardUser!.id, name);
    const projects = await getAccessibleProjectsForUser(req.dashboardUser!.id);
    res.status(201).json({ ok: true, project: created, projects });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/projects/delete", dashboardSessionAuthMiddleware, async (req, res, next) => {
  try {
    const projectId = typeof req.body.projectId === "string" ? req.body.projectId.trim() : "";
    if (!projectId) {
      throw new ApiError(400, "INVALID_PROJECT_ID", "A project ID is required");
    }

    await deleteProjectForUser(req.dashboardUser!.id, projectId);
    const projects = await getAccessibleProjectsForUser(req.dashboardUser!.id);
    res.json({ ok: true, projects });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/projects/revoke-key", dashboardSessionAuthMiddleware, async (req, res, next) => {
  try {
    const projectId = typeof req.body.projectId === "string" ? req.body.projectId.trim() : "";
    if (!projectId) {
      throw new ApiError(400, "INVALID_PROJECT_ID", "A project ID is required");
    }

    const newApiKey = await revokeProjectApiKey(req.dashboardUser!.id, projectId);
    res.json({ ok: true, newApiKey });
  } catch (error) {
    next(error);
  }
});

// ── Dashboard browser overview ───────────────────────────────────────────

app.get("/v1/dashboard/browser/overview", dashboardSessionAuthMiddleware, async (req, res, next) => {
  try {
    const projectId = typeof req.query.projectId === "string" ? req.query.projectId : "";
    if (!projectId) {
      throw new ApiError(400, "PROJECT_REQUIRED", "projectId is required");
    }

    const accessibleProjects = await getAccessibleProjectsForUser(req.dashboardUser!.id);
    const hasAccess = accessibleProjects.some((project: { id: string }) => project.id === projectId);
    if (!hasAccess) {
      throw new ApiError(403, "PROJECT_ACCESS_DENIED", "This Roblox account is not linked to the requested project");
    }

    res.json(await buildDashboardOverview(projectId));
  } catch (error) {
    next(error);
  }
});

// ── SDK API: Projects ────────────────────────────────────────────────────

app.get("/v1/projects", apiKeyAuthMiddleware, async (req, res, next) => {
  try {
    const project = req.project!;
    res.json({
      ok: true,
      projects: [
        {
          id: project.id,
          name: project.name,
          created_at: project.createdAt,
        },
      ],
    });
  } catch (error) {
    next(error);
  }
});

// ── SDK API: Events ──────────────────────────────────────────────────────

app.post("/v1/events", apiKeyAuthMiddleware, async (req, res, next) => {
  try {
    const project = req.project!;
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    if (!name) {
      throw new ApiError(400, "INVALID_EVENT_NAME", "Event name must be a non-empty string");
    }

    const payload = req.body.payload;
    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
      throw new ApiError(400, "INVALID_EVENT_PAYLOAD", "Event payload must be an object");
    }

    const payloadStr = JSON.stringify(payload);
    if (payloadStr.length > 256 * 1024) {
      throw new ApiError(400, "EVENT_PAYLOAD_TOO_LARGE", "Event payload must be less than 256KB");
    }

    const event = await prisma.event.create({
      data: {
        projectId: project.id,
        eventName: name,
        payloadJson: payload,
      },
    });

    logActivity(project.id, "events.track", "success", `Tracked event ${name}`, { eventName: name });

    res.status(201).json({ ok: true, event: mapEvent(event) });
  } catch (error) {
    if (isApiError(error) && req.project) {
      logActivity(req.project.id, "events.track", "error", error.message);
    }
    next(error);
  }
});

// ── SDK API: Records ─────────────────────────────────────────────────────

app.get("/v1/records/:collection/:key", apiKeyAuthMiddleware, async (req, res, next) => {
  try {
    const project = req.project!;
    const collection = String(req.params.collection);
    const key = String(req.params.key);

    if (!COLLECTION_NAME_RE.test(collection)) {
      throw new ApiError(400, "INVALID_COLLECTION", "Collection name must be alphanumeric with underscores");
    }

    const row = await prisma.recordEntry.findUnique({
      where: {
        projectId_collection_recordKey: {
          projectId: project.id,
          collection,
          recordKey: key,
        },
      },
    });

    if (!row) {
      throw new ApiError(404, "RECORD_NOT_FOUND", "Record not found");
    }

    res.json({ ok: true, record: mapRecord(row) });
  } catch (error) {
    next(error);
  }
});

app.put("/v1/records/:collection/:key", apiKeyAuthMiddleware, async (req, res, next) => {
  try {
    const project = req.project!;
    const collection = String(req.params.collection);
    const key = String(req.params.key);

    if (!COLLECTION_NAME_RE.test(collection)) {
      throw new ApiError(400, "INVALID_COLLECTION", "Collection name must be alphanumeric with underscores");
    }

    if (!key) {
      throw new ApiError(400, "INVALID_RECORD_KEY", "Record key must be non-empty");
    }

    const data = req.body.data;
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      throw new ApiError(400, "INVALID_RECORD_DATA", "Record data must be an object");
    }

    const dataStr = JSON.stringify(data);
    if (dataStr.length > 1024 * 1024) {
      throw new ApiError(400, "RECORD_DATA_TOO_LARGE", "Record data must be less than 1MB");
    }

    const record = await prisma.recordEntry.upsert({
      where: {
        projectId_collection_recordKey: {
          projectId: project.id,
          collection,
          recordKey: key,
        },
      },
      update: {
        dataJsonb: data,
      },
      create: {
        projectId: project.id,
        collection,
        recordKey: key,
        dataJsonb: data,
      },
    });

    logActivity(project.id, `records.${collection}.set`, "success", `Set record ${key}`);

    res.json({ ok: true, record: mapRecord(record) });
  } catch (error) {
    if (isApiError(error) && req.project) {
      logActivity(req.project.id, `records.${req.params.collection}.set`, "error", error.message);
    }
    next(error);
  }
});

app.delete("/v1/records/:collection/:key", apiKeyAuthMiddleware, async (req, res, next) => {
  try {
    const project = req.project!;
    const collection = String(req.params.collection);
    const key = String(req.params.key);

    if (!COLLECTION_NAME_RE.test(collection)) {
      throw new ApiError(400, "INVALID_COLLECTION", "Collection name must be alphanumeric with underscores");
    }

    const result = await prisma.recordEntry.deleteMany({
      where: {
        projectId: project.id,
        collection,
        recordKey: key,
      },
    });

    if (result.count === 0) {
      throw new ApiError(404, "RECORD_NOT_FOUND", "Record not found");
    }

    logActivity(project.id, `records.${collection}.delete`, "success", `Deleted record ${key}`);

    res.json({ ok: true });
  } catch (error) {
    if (isApiError(error) && req.project) {
      logActivity(req.project.id, `records.${req.params.collection}.delete`, "error", error.message);
    }
    next(error);
  }
});

app.get("/v1/records/:collection", apiKeyAuthMiddleware, async (req, res, next) => {
  try {
    const project = req.project!;
    const collection = String(req.params.collection);

    if (!COLLECTION_NAME_RE.test(collection)) {
      throw new ApiError(400, "INVALID_COLLECTION", "Collection name must be alphanumeric with underscores");
    }

    const requestedLimit = Number(req.query.limit ?? 20);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 20;
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;

    const where: any = {
      projectId: project.id,
      collection,
    };

    if (cursor) {
      where.id = { gt: cursor };
    }

    const rows = await prisma.recordEntry.findMany({
      where,
      orderBy: { id: "asc" },
      take: limit,
    });

    const nextCursor = rows.length === limit ? rows[rows.length - 1].id : null;

    res.json({
      ok: true,
      records: rows.map(mapRecord),
      cursor: nextCursor,
    });
  } catch (error) {
    next(error);
  }
});

// ── Dashboard overview (API key) ─────────────────────────────────────────

app.get("/v1/dashboard/overview", apiKeyAuthMiddleware, async (req, res, next) => {
  try {
    res.json(await buildDashboardOverview(req.project!.id));
  } catch (error) {
    next(error);
  }
});

// ── Error handler ────────────────────────────────────────────────────────

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (isApiError(error)) {
    res.status(error.status).json({ ok: false, error: error.message, code: error.code });
    return;
  }

  const message = error instanceof Error ? error.message : "Unknown server error";
  res.status(500).json({ ok: false, error: message, code: "INTERNAL_ERROR" });
});

app.listen(config.port, () => {
  console.log(`StackFox backend listening on http://localhost:${config.port}`);
});
