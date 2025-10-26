import { eq, not } from "drizzle-orm";
import {
    check,
    integer,
    pgTable,
    primaryKey,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    username: varchar({ length: 32 }).notNull().unique(),
    passwordHash: varchar({ length: 256 }).notNull(),
});

export const friendRequests = pgTable(
    "friendRequests",
    {
        senderId: integer()
            .notNull()
            .references(() => users.id),
        receiverId: integer()
            .notNull()
            .references(() => users.id),
    },
    (table) => [
        primaryKey({ columns: [table.senderId, table.receiverId] }),
        check("self_friend_check", not(eq(table.senderId, table.receiverId))),
    ],
);

export const friendGroups = pgTable("friendGroups", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer()
        .notNull()
        .unique()
        .references(() => users.id),
});

export const friendGroupMembers = pgTable(
    "friendGroupMembers",
    {
        userId: integer()
            .notNull()
            .references(() => users.id),
        friendGroupId: integer()
            .notNull()
            .references(() => friendGroups.id),
    },
    (table) => [primaryKey({ columns: [table.userId, table.friendGroupId] })],
);

export const refreshTokens = pgTable("refreshTokens", {
    token: varchar({ length: 256 }).notNull().unique(),
    expiresAt: timestamp().notNull(),
    userId: integer()
        .notNull()
        .references(() => users.id),
});
