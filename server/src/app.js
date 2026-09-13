import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";

import { authRouter } from "./routes/auth.js";
import {
  accountsRouter,
  transactionsRouter,
  budgetsRouter,
  goalsRouter,
  dashboardRouter
} from "./routes/crud.js";
import { aiRouter } from "./routes/ai.js";
import { bankRouter } from "./routes/bank.js";
import { categoriesRouter } from "./routes/categories.js";

import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/error.js";

export const app = express();

app.set("trust proxy", 1);

app.use(helmet());

/*
 * IMPORTANT:
 * Netlify frontend -> Render backend
 * Must use the exact Netlify URL WITHOUT a trailing slash.
 */
const allowedOrigins = [
  "https://financeai-ai.netlify.app",
  env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / Postman requests with no Origin header
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(
  express.json({
    limit: "1mb"
  })
);

app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

/* Health check */
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok"
    }
  });
});

/* Routes */
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/budgets", budgetsRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/ai", aiRouter);
app.use("/api/bank", bankRouter);
app.use("/api/categories", categoriesRouter);

/* 404 */
app.use(notFound);

/* Error handler */
app.use(errorHandler);
