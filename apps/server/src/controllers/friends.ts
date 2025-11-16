import { eq, inArray } from "drizzle-orm";
import type { Request, Response } from "express";
import db from "../db";
import { friends, users } from "../db/schema";

export default {
    async get(req: Request, res: Response) {
        const user = req.user as typeof users.$inferSelect;

        res.json(
            await db
                .select({ id: users.id, username: users.username })
                .from(users)
                .where(
                    inArray(
                        users.id,
                        db
                            .select({ userId: friends.userId })
                            .from(friends)
                            .where(eq(friends.friendOf, user.id)),
                    ),
                ),
        );
    },
};
