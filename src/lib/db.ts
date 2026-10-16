import "server-only";
import { Pool } from "pg";
const globalPool = globalThis as typeof globalThis & { __zvlPoolV2?: Pool };
export function pool() {
  if (!globalPool.__zvlPoolV2) {
    const connectionString = process.env.DATABASE_PRO_URL || process.env.DIRECT_PRO_URL;
    if (!connectionString) throw new Error("DATABASE_PRO_URL is required to save video history.");
    const url = new URL(connectionString);
    // Honor the existing libpq sslmode=require semantics on the configured Supabase pooler.
    // For certificate validation use sslmode=verify-full and a trusted CA instead.
    const requireTls = url.searchParams.get("sslmode") === "require";
    if (requireTls) { url.searchParams.delete("sslmode"); url.searchParams.delete("uselibpqcompat"); }
    globalPool.__zvlPoolV2 = new Pool({ connectionString: url.toString(), ...(requireTls ? { ssl: { rejectUnauthorized: false } } : {}), max: 5, connectionTimeoutMillis: 8000 });
  }
  return globalPool.__zvlPoolV2;
}
