import type { AuthSession } from "../lib/auth.js";

declare global {
  namespace Express {
    interface Request {
      authSession?: AuthSession["session"];
      user?: AuthSession["user"];
      validatedQuery?: unknown;
      validatedBody?: unknown;
      validatedParams?: unknown;
    }
  }
}

export {};