import { and, eq, or } from "drizzle-orm";
import type { Request, Response } from "express";
import db from "../db";
import { friends, users } from "../db/schema";

export default {
    async delete(req: Request, res: Response) {
        const user = req.user as typeof users.$inferSelect;
        const friendId = +req.params.userId!;

        await db
            .delete(friends)
            .where(
                and(
                    or(
                        eq(friends.userId, user.id),
                        eq(friends.userId, friendId),
                    ),
                    or(
                        eq(friends.friendOf, user.id),
                        eq(friends.friendOf, friendId),
                    ),
                ),
            );

        res.sendStatus(204);
    },
};
