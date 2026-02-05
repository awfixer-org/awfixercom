// preload-db.ts
import { db } from "./db-load"; // your Drizzle/Kysely/etc client
import { redis } from "./cache";

// optional: force connection creation
await db.query("SELECT 1");
await redis.ping();
