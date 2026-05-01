import type { NextFunction, Request, Response } from "express";

import { ZodError } from "zod";
import multer from "multer";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";
import { Prisma } from "../../prisma/generated/prisma/client/client.js";



export const globalErrorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: unknown = undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errors = error.flatten().fieldErrors;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;

    if (error.code === "P2002") {
      message = "Duplicate value already exists";
      errors = error.meta;
    } else if (error.code === "P2025") {
      statusCode = 404;
      message = "Requested resource not found";
    } else {
      message = "Database request failed";
      errors = error.meta;
    }
  } else if (error instanceof multer.MulterError) {
    statusCode = 400;

    if (error.code === "LIMIT_FILE_SIZE") {
      message = "File is too large. Maximum file size is 2MB.";
    } else if (error.code === "LIMIT_FILE_COUNT") {
      message = "Too many files uploaded.";
    } else {
      message = error.message;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: env.NODE_ENV === "production" ? undefined : error.stack,
  });
};
