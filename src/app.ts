import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { env } from "./config/env.js";
import { notFound } from "./middlewares/not-found.middleware.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(helmet());
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(cookieParser());

// Stripe webhook route will need raw body later, so it should be registered before express.json.

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", toNodeHandler(auth.handler));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "AI E-Commerce API is running",
  });
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
