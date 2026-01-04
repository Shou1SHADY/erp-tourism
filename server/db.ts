import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL not found, running with in-memory storage.");
} else {
  console.log(`DATABASE_URL found: ${process.env.DATABASE_URL.substring(0, 10)}..., connecting to database.`);
}

export const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
export const db = pool ? drizzle(pool, { schema }) : null;
