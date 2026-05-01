import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

type Role = "USER" | "MANAGER" | "ADMIN";

export const requireRole = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "You are not authenticated"));
    }

    const userRole = req.user.role as Role;

    if (!roles.includes(userRole)) {
      return next(new AppError(403, "You do not have permission to perform this action"));
    }

    next();
  };
};