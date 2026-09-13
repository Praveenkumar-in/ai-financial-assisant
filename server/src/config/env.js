import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("openai/gpt-oss-20b"),
  AA_BASE_URL: z.string().optional(),
  AA_CLIENT_ID: z.string().optional(),
  AA_CLIENT_SECRET: z.string().optional(),
  AA_ENVIRONMENT: z.string().default("sandbox")
});

export const env = envSchema.parse(process.env);
