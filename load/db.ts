// preload-db.ts
import { db } from "./db"; // your Drizzle/Kysely/etc client
import { redis } from "../src/lib/cache";

// optional: force connection creation
await db.query("SELECT 1");
await redis.ping();
