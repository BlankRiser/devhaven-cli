import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  verbose: true,
  dbCredentials: {
    url: "./sqlite.db",
  },
});

