import { and, eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import * as z from "zod";
import db from "../db";
import { friendRequests } from "../db/schema";

const FriendRequest = z
    .object({
        senderId: z.coerce
            .number()
            .pipe(z.int({ abort: true }).min(1, { abort: true })),
        receiverId: z.coerce
            .number()
            .pipe(z.int({ abort: true }).min(1, { abort: true })),
    })
    .refine(async (data) => {
        const [friendRequest] = await db
            .select()
            .from(friendRequests)
            .where(
                and(
                    eq(friendRequests.senderId, data.senderId),
                    eq(friendRequests.receiverId, data.receiverId),
                ),
            );

        if (!friendRequest) {
            return false;
        }

        return true;
    });

export default async function checkFriendRequest(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const result = await FriendRequest.safeParseAsync(req.params);

    if (!result.success) {
        next("router");

        return;
    }

    next();
}
