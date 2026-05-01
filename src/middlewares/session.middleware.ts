import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { AppError } from "../utils/AppError.js";

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user || !session?.session) {
      throw new AppError(401, "You are not authenticated");
    }

    if (session.user.status === "BLOCKED") {
      throw new AppError(403, "Your account has been blocked");
    }

    req.user = session.user;
    req.authSession = session.session;

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session?.user && session?.session) {
      req.user = session.user;
      req.authSession = session.session;
    }

    next();
  } catch {
    next();
  }
};