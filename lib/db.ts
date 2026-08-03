import { Pool, types } from "pg";

// Return DATE columns as plain "YYYY-MM-DD" strings instead of pg's default
// JS Date objects, which serialize to full UTC timestamps and shift by a day
// depending on local timezone.
types.setTypeParser(types.builtins.DATE, (val) => val);

declare global {
  // eslint-disable-next-line no-var
  var __paPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  return new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    max: 5,
  });
}

export const pool = global.__paPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  global.__paPool = pool;
}

export async function query<T = unknown>(text: string, params?: unknown[]) {
  const result = await pool.query(text, params);
  return result.rows as T[];
}
