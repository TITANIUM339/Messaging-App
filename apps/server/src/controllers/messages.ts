import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import * as z from "zod";
import db from "../db";
import { chatMembers, messages, users } from "../db/schema";

export default {
    async post(req: Request, res: Response) {
        const user = req.user as typeof users.$inferSelect;
        const chatId = +req.params.chatId!;
        const io = req.app.io;

        const Message = z.array(
            z.object({
                content: z.string().trim().nonempty(),
                to: z.coerce
                    .number()
                    .pipe(z.int({ abort: true }).min(1, { abort: true }))
                    .refine(
                        async (value) => {
                            const [member] = await db
                                .select()
                                .from(chatMembers)
                                .where(
                                    and(
                                        eq(chatMembers.chat, chatId),
                                        eq(chatMembers.user, value),
                                    ),
                                );

                            if (!member) {
                                return false;
                            }

                            return true;
                        },
                        { error: "User does not exist in this chat" },
                    ),
            }),
        );

        const result = await Message.safeParseAsync(req.body);

        if (!result.success) {
            res.status(400).json(z.treeifyError(result.error));

            return;
        }

        const newMessages = await db
            .insert(messages)
            .values(
                result.data.map((message) => ({
                    chat: chatId,
                    to: message.to,
                    from: user.id,
                    content: message.content,
                })),
            )
            .returning();

        newMessages.forEach((message) =>
            io.to(`${message.to}`).emit(`chat-${message.chat}:new_message`, {
                ...message,
                senderId: user.id,
                senderUsername: user.username,
            }),
        );

        res.sendStatus(201);
    },
    async get(req: Request, res: Response) {
        const user = req.user as typeof users.$inferSelect;
        const chatId = +req.params.chatId!;

        res.json(
            await db
                .select({
                    id: messages.id,
                    content: messages.content,
                    senderId: messages.from,
                    senderUsername: users.username,
                    chat: messages.chat,
                    createdAt: messages.createdAt,
                })
                .from(messages)
                .leftJoin(users, eq(messages.from, users.id))
                .where(and(eq(messages.chat, chatId), eq(messages.to, user.id)))
                .orderBy(messages.createdAt),
        );
    },
};
