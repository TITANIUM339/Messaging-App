import "dotenv/config";
import authenticateSocket from "@middleware/authenticateSocket";
import {
    accessTokenStrategy,
    localStrategy,
    refreshTokenStrategy,
} from "@middleware/passport";
import cookieParser from "cookie-parser";
import cors from "cors";
import { lte } from "drizzle-orm";
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
import { refreshTokens } from "./db/schema";
import routes from "./routes";

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

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN },
});

io.use(authenticateSocket);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => console.log(`Listening on port ${PORT}`));
