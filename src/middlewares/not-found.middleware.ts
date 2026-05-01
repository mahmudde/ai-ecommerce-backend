import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(404, `Route not found: ${req.originalUrl}`));
};

export default notFound;
