import "dotenv/config";
import authenticateSocket from "@middleware/authenticateSocket";
import {
    accessTokenStrategy,
    localStrategy,
    refreshTokenStrategy,
} from "@middleware/passport";
import cookieParser from "cookie-parser";
import cors from "cors";
import { and, eq, inArray, lte } from "drizzle-orm";
import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";
import helmet from "helmet";
import { createServer } from "http";
import createHttpError from "http-errors";
import passport from "passport";
import { Server } from "socket.io";
import db from "./db";
import { friends, refreshTokens, users } from "./db/schema";
import routes from "./routes";

// https://stackoverflow.com/a/55718334
declare module "express-serve-static-core" {
    interface Application {
        io: Server;
    }
}

setInterval(
    async () => {
        try {
            await db
                .delete(refreshTokens)
                .where(lte(refreshTokens.expiresAt, new Date()));
        } catch (error) {
            console.error(error);
        }
    },
    5 * 60 * 1000,
);

passport.use("local", localStrategy);
passport.use("refreshToken", refreshTokenStrategy);
passport.use("accessToken", accessTokenStrategy);

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN },
});

app.io = io;

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

app.use(routes);

app.use((_req, _res, next) => next(createHttpError(404)));
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const code = createHttpError.isHttpError(err) ? err.statusCode : 500;

    if (code >= 500) {
        console.error(err);
    }

    res.sendStatus(code);
});

io.use(authenticateSocket);

io.on("connection", async (socket) => {
    socket.join(`${socket.data.user.id}`);

    const connectedFriends = await db
        .select({ id: users.id, username: users.username })
        .from(friends)
        .innerJoin(users, eq(friends.userId, users.id))
        .where(
            and(
                eq(friends.friendOf, socket.data.user.id),
                inArray(
                    friends.userId,
                    (await io.fetchSockets()).map(
                        (socket) => socket.data.user.id,
                    ),
                ),
            ),
        );

    const idsOfConnectedFriends = connectedFriends.map(
        (friend) => `${friend.id}`,
    );

    socket.emit("connected_friends", connectedFriends);

    // Only notify the user's friends if they are connected and it's the user's first socket
    if (
        idsOfConnectedFriends.length &&
        (await io.to(`${socket.data.user.id}`).fetchSockets()).length === 1
    ) {
        socket
            .to(idsOfConnectedFriends)
            .emit("friend_connected", socket.data.user);
    }

    socket.on("disconnect", async () => {
        const idsOfConnectedFriends = (
            await db
                .select({ id: users.id })
                .from(friends)
                .innerJoin(users, eq(friends.userId, users.id))
                .where(
                    and(
                        eq(friends.friendOf, socket.data.user.id),
                        inArray(
                            friends.userId,
                            (await io.fetchSockets()).map(
                                (socket) => socket.data.user.id,
                            ),
                        ),
                    ),
                )
        ).map((friend) => `${friend.id}`);

        // Only notify the user's friends if they are connected and the user has no more sockets
        if (
            idsOfConnectedFriends.length &&
            !(await io.to(`${socket.data.user.id}`).fetchSockets()).length
        ) {
            socket
                .to(idsOfConnectedFriends)
                .emit("friend_disconnected", socket.data.user);
        }
    });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => console.log(`Listening on port ${PORT}`));
