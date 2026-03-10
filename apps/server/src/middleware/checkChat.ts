import { and, eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import * as z from "zod";
import db from "../db";
import { chatMembers, type users } from "../db/schema";

export default async function checkChat(
    req: Request,
    res: Response,
    next: NextFunction,
    chatId: unknown,
) {
    const user = req.user as typeof users.$inferSelect;

    const ChatId = z.coerce
        .number()
        .pipe(z.int({ abort: true }).min(1, { abort: true }))
        .refine(async (value) => {
            const [member] = await db
                .select()
                .from(chatMembers)
                .where(
                    and(
                        eq(chatMembers.chat, value),
                        eq(chatMembers.user, user.id),
                    ),
                );

            if (!member) {
                return false;
            }

            return true;
        });

    const result = await ChatId.safeParseAsync(chatId);

    if (!result.success) {
        next("router");

        return;
    }

    next();
}
