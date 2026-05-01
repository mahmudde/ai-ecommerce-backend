import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

type ValidateSchemas = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

export const validateRequest = (schemas: ValidateSchemas) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      req.validatedBody = schemas.body.parse(req.body);
    }

    if (schemas.params) {
      req.validatedParams = schemas.params.parse(req.params);
    }

    if (schemas.query) {
      req.validatedQuery = schemas.query.parse(req.query);
    }

    next();
  };
};