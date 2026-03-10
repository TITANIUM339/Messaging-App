import { and, eq, not } from "drizzle-orm";
import type { Request, Response } from "express";
import db from "../db";
import { chatMembers, chats, users } from "../db/schema";

export default {
    async get(req: Request, res: Response) {
        const user = req.user as typeof users.$inferSelect;

        const [privateChats, groupChats] = await Promise.all([
            db
                .select({
                    id: chats.id,
                    userId: users.id,
                    username: users.username,
                })
                .from(chats)
                .leftJoin(chatMembers, eq(chats.id, chatMembers.chat))
                .leftJoin(users, eq(chatMembers.user, users.id))
                .where(
                    and(
                        not(eq(chatMembers.user, user.id)),
                        eq(chats.type, "private"),
                    ),
                ),
            db
                .select({
                    id: chats.id,
                    title: chats.title,
                    icon: chats.icon,
                    owner: chats.owner,
                })
                .from(chats)
                .leftJoin(chatMembers, eq(chats.id, chatMembers.chat))
                .where(
                    and(eq(chatMembers.user, user.id), eq(chats.type, "group")),
                ),
        ]);

        res.json({ privateChats, groupChats });
    },
};
