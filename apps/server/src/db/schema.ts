import { eq, not } from "drizzle-orm";
import {
    check,
    integer,
    pgEnum,
    pgTable,
    primaryKey,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";

export const chatType = pgEnum("chatType", ["private", "group"]);

export const users = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    username: varchar({ length: 32 }).notNull().unique(),
    passwordHash: text().notNull(),
    publicKey: text().notNull(),
    passphrase: varchar({ length: 128 }).notNull(),
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

export const friends = pgTable(
    "friends",
    {
        userId: integer()
            .notNull()
            .references(() => users.id),
        friendOf: integer()
            .notNull()
            .references(() => users.id),
    },
    (table) => [
        primaryKey({ columns: [table.userId, table.friendOf] }),
        check("self_friend_check", not(eq(table.userId, table.friendOf))),
    ],
);

export const refreshTokens = pgTable("refreshTokens", {
    token: text().notNull().unique(),
    expiresAt: timestamp().notNull(),
    userId: integer()
        .notNull()
        .references(() => users.id),
});

export const chats = pgTable("chats", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({ length: 32 }),
    icon: varchar({ length: 256 }),
    type: chatType().notNull(),
    owner: integer().references(() => users.id),
});

export const chatMembers = pgTable(
    "chatMembers",
    {
        user: integer()
            .notNull()
            .references(() => users.id),
        chat: integer()
            .notNull()
            .references(() => chats.id),
    },
    (table) => [primaryKey({ columns: [table.user, table.chat] })],
);

export const messages = pgTable("messages", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    content: text(),
    from: integer()
        .notNull()
        .references(() => users.id),
    to: integer()
        .notNull()
        .references(() => users.id),
    chat: integer()
        .notNull()
        .references(() => chats.id),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
