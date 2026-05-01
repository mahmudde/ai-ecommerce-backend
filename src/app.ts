import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import { toNodeHandler } from "better-auth/node";

import { env } from "./config/env.js";
import { auth } from "./lib/auth.js";
import routes from "./routes/index.js";
import { paymentController } from "./modules/payments/payment.controller.js";
import { notFound } from "./middlewares/not-found.middleware.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import {
  authRateLimiter,
  globalRateLimiter,
} from "./middlewares/rate-limit.middleware.js";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(compression());
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(cookieParser());

app.use(globalRateLimiter);

/**
 * Better Auth must be mounted before express.json().
 */
app.all("/api/auth/*splat", authRateLimiter, toNodeHandler(auth));

/**
 * Stripe webhook must be mounted before express.json()
 * because Stripe signature verification requires raw request body.
 */
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentController.stripeWebhook
);

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