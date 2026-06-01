import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let pool: any = null;
let db: any = null;

// In-memory storage for when DATABASE_URL is not set
const inMemoryDb = {
  submissions: [] as any[],
  adminSessions: [] as any[],
  nextId: 1,
};

if (!process.env.DATABASE_URL) {
  console.log("Using in-memory database (no DATABASE_URL set)");
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
}

export { pool, db, inMemoryDb };
export * from "./schema";
