import type { RequestHandler } from "express";
import { getDashboardSession } from "./browser-auth.js";
import { ApiError } from "./errors.js";
import { prisma } from "./prisma.js";
import type { AuthProject, DashboardSession, DashboardUser } from "./types.js";

declare global {
  namespace Express {
    interface Request {
      project?: AuthProject;
      dashboardUser?: DashboardUser;
      dashboardSession?: DashboardSession;
    }
  }
}

export const apiKeyAuthMiddleware: RequestHandler = async (req, _res, next) => {
  try {
    const authorization = req.header("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      throw new ApiError(401, "UNAUTHORIZED", "Missing bearer token");
    }

    const apiKey = authorization.replace("Bearer ", "").trim();
    const project = await prisma.project.findUnique({ where: { apiKey } });
    if (!project) {
      throw new ApiError(401, "UNAUTHORIZED", "Invalid API key");
    }

    req.project = {
      id: project.id,
      name: project.name,
      apiKey: project.apiKey,
      createdAt: project.createdAt.toISOString(),
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const dashboardSessionAuthMiddleware: RequestHandler = async (req, _res, next) => {
  try {
    const result = await getDashboardSession(req);
    if (!result) {
      throw new ApiError(401, "UNAUTHORIZED", "Dashboard session is missing or expired");
    }

    req.dashboardSession = result.session;
    req.dashboardUser = result.user;
    next();
  } catch (error) {
    next(error);
  }
};
