import jwt from "@lib/jwt";
import { eq } from "drizzle-orm";
import jsonwebtoken from "jsonwebtoken";
import type { Socket } from "socket.io";
import * as z from "zod";
import db from "../db";
import { users } from "../db/schema";

const Token = z.jwt();

const UserId = z.object({
    id: z.int().min(1),
});

export default async function authenticateSocket(
    socket: Socket,
    next: (error?: Error) => void,
) {
    try {
        const token = Token.parse(socket.handshake.auth.token);

        const decoded = UserId.parse(
            await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!),
        );

        const [user] = await db
            .select({ id: users.id, username: users.username })
            .from(users)
            .where(eq(users.id, decoded.id));

        if (!user) {
            next(new Error("User does not exist"));

            return;
        }

        socket.data.user = user;
    } catch (error) {
        if (
            error instanceof z.ZodError ||
            error instanceof jsonwebtoken.TokenExpiredError ||
            error instanceof jsonwebtoken.JsonWebTokenError ||
            error instanceof jsonwebtoken.NotBeforeError
        ) {
            next(new Error("Unauthorized"));

            return;
        }

        console.error(error);

        next(new Error("Internal Server Error"));

        return;
    }

    next();
}
