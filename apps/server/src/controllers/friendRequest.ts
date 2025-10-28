import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import db from "../db";
import { friendRequests, friends } from "../db/schema";

export default {
    async post(req: Request, res: Response) {
        const senderId = +req.params.senderId!;
        const receiverId = +req.params.receiverId!;

        await db.transaction(async (tx) => {
            await Promise.all([
                tx
                    .delete(friendRequests)
                    .where(
                        and(
                            eq(friendRequests.senderId, senderId),
                            eq(friendRequests.receiverId, receiverId),
                        ),
                    ),

                tx.insert(friends).values([
                    {
                        userId: senderId,
                        friendOf: receiverId,
                    },
                    {
                        userId: receiverId,
                        friendOf: senderId,
                    },
                ]),
            ]);
        });

        res.sendStatus(201);
    },
};
