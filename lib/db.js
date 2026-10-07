import { neon } from "@neondatabase/serverless";

// Lazy: the connection is only created when a request needs it.
let client;
export function sql(strings, ...values) {
  if (!client) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    client = neon(process.env.DATABASE_URL);
  }
  return client(strings, ...values);
}
