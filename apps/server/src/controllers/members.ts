import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import db from "../db";
import { chatMembers, users } from "../db/schema";

export default {
    async get(req: Request, res: Response) {
        const chatId = +req.params.chatId!;

        const members = await db
            .select({
                id: users.id,
                username: users.username,
                publicKey: users.publicKey,
            })
            .from(chatMembers)
            .leftJoin(users, eq(chatMembers.user, users.id))
            .where(eq(chatMembers.chat, chatId));

        res.json(members);
    },
};
