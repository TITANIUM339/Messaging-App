import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { users } from "../db/schema";

export default function onlyAllowFriendRequestReceiver(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const user = req.user as typeof users.$inferSelect;

    if (user.id !== +req.params.receiverId!) {
        next(createHttpError(403));

        return;
    }

    next();
}
