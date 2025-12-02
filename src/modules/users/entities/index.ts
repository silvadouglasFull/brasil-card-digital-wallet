import { baseSchema } from "@/core/database/schema-utils";
import { boolean, pgTable, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  ...baseSchema,
  fullName: varchar("full_name", { length: 100 }).notNull(),
  document: varchar("document", { length: 14 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
});
