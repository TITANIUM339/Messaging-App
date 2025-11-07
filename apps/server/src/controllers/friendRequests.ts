import { eq, sql } from "drizzle-orm";
import type { Request, Response } from "express";
import * as z from "zod";
import db from "../db";
import { friendRequests, friends, users } from "../db/schema";

export default {
    async post(req: Request, res: Response) {
        const user = req.user as typeof users.$inferSelect;

        const FriendRequest = z.object({
            username: z
                .string()
                .trim()
                .nonempty({ abort: true })
                .max(32, { abort: true })
                .superRefine(async (data, ctx) => {
                    const [friend] = await db
                        .select({
                            id: users.id,
                            isFriend: sql<boolean>`(SELECT ${users.id} IN (SELECT ${friends.userId} FROM ${friends} WHERE ${friends.friendOf} = ${user.id}))`,
                        })
                        .from(users)
                        .where(eq(users.username, data));

                    if (!friend) {
                        ctx.addIssue("User does not exits");
                    } else if (user.id === friend.id) {
                        ctx.addIssue("Cannot friend yourself");
                    } else if (friend.isFriend) {
                        ctx.addIssue("This user is already your friend");
                    }
                }),
        });

        const result = await FriendRequest.safeParseAsync(req.body);

        if (!result.success) {
            res.status(400).json(z.treeifyError(result.error));

            return;
        }

        await db
            .insert(friendRequests)
            .values({
                senderId: user.id,
                receiverId: sql`(SELECT ${users.id} FROM ${users} WHERE ${users.username} = ${result.data.username})`,
            })
            .onConflictDoNothing();

        res.sendStatus(201);
    },
};
