import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "Database belum dikonfigurasi. Isi DATABASE_URL sebelum mengakses data.",
    );
  }

  return drizzle(neon(databaseUrl), { schema });
}
