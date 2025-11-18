import { and, eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import * as z from "zod";
import db from "../db";
import { friends, users } from "../db/schema";

export default async function checkFriend(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const user = req.user as typeof users.$inferSelect;

    const Friend = z.object({
        userId: z.coerce
            .number()
            .pipe(z.int({ abort: true }).min(1, { abort: true }))
            .refine(async (data) => {
                const [friend] = await db
                    .select()
                    .from(friends)
                    .where(
                        and(
                            eq(friends.friendOf, user.id),
                            eq(friends.userId, data),
                        ),
                    );

                if (!friend) {
                    return false;
                }

                return true;
            }),
    });

    const result = await Friend.safeParseAsync(req.params);

    if (!result.success) {
        next("router");

        return;
    }

    next();
}
