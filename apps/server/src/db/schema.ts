import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    username: varchar({ length: 32 }).notNull().unique(),
    passwordHash: varchar({ length: 256 }).notNull(),
});

export const refreshTokens = pgTable("refreshTokens", {
    token: varchar({ length: 256 }).notNull().unique(),
    expiresAt: timestamp().notNull(),
    userId: integer()
        .notNull()
        .references(() => users.id),
});
