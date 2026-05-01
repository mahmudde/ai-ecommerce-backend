import type { Response } from "express";

type SendResponseArgs<T> = {
  res: Response;
  statusCode?: number;
  success?: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
};

export const sendResponse = <T>({
  res,
  statusCode = 200,
  success = true,
  message,
  data,
  meta,
}: SendResponseArgs<T>) => {
  res.status(statusCode).json({
    success,
    message,
    data,
    meta,
  });
};
