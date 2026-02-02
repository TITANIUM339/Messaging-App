import { and, eq, or } from "drizzle-orm";
import type { Request, Response } from "express";
import db from "../db";
import { friendRequests, friends } from "../db/schema";

export default {
    async post(req: Request, res: Response) {
        const io = req.app.io;

        const senderId = +req.params.senderId!;
        const receiverId = +req.params.receiverId!;

        const [senderSockets, receiverSockets] = await Promise.all([
            io.to(`${senderId}`).fetchSockets(),
            io.to(`${receiverId}`).fetchSockets(),
            db.transaction(async (tx) => {
                await Promise.all([
                    tx
                        .delete(friendRequests)
                        .where(
                            and(
                                or(
                                    eq(friendRequests.senderId, senderId),
                                    eq(friendRequests.senderId, receiverId),
                                ),
                                or(
                                    eq(friendRequests.receiverId, receiverId),
                                    eq(friendRequests.receiverId, senderId),
                                ),
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
            }),
        ]);

        if (senderSockets.length && receiverSockets.length) {
            io.to(`${senderId}`).emit(
                "friend_connected",
                receiverSockets[0]?.data.user,
            );

            io.to(`${receiverId}`).emit(
                "friend_connected",
                senderSockets[0]?.data.user,
            );
        }

        res.sendStatus(201);
    },
    async delete(req: Request, res: Response) {
        const senderId = +req.params.senderId!;
        const receiverId = +req.params.receiverId!;

        await db
            .delete(friendRequests)
            .where(
                and(
                    eq(friendRequests.senderId, senderId),
                    eq(friendRequests.receiverId, receiverId),
                ),
            );

        res.sendStatus(204);
    },
};
