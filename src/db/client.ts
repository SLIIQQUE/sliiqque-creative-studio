import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // Reused across hot reloads in development so connections do not pile up.
  var __studioSql: ReturnType<typeof postgres> | undefined;
}

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  // Serverless functions open short-lived connections; keep the pool small and let a pooled URL do the rest.
  return postgres(url, { max: process.env.NODE_ENV === "production" ? 3 : 5, prepare: false });
}

const sql = globalThis.__studioSql ?? connect();
if (process.env.NODE_ENV !== "production") globalThis.__studioSql = sql;

export const db = drizzle(sql, { schema });
export type Db = typeof db;
