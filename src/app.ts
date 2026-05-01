import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";

import { env } from "./config/env.js";
import { auth } from "./lib/auth.js";
import routes from "./routes/index.js";
import { notFound } from "./middlewares/not-found.middleware.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(helmet());
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(cookieParser());

/*
 * Better Auth route.
 *
 * Express v5 requires named wildcard:
 * /api/auth/*splat
 *
 * If you are using Express v4, use:
 * /api/auth/*
 */
app.all("/api/auth/*splat", toNodeHandler(auth));

/*
 * Stripe webhook route will also need raw body later.
 * We will add it before express.json() when we build payment module.
 */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "AI E-Commerce API is running",
  });
});

app.use("/api", routes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;