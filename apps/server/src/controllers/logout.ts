import { REFRESH_TOKEN_COOKIE } from "@lib/constants";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import db from "../db";
import { refreshTokens } from "../db/schema";

export default {
    async post(req: Request, res: Response) {
        await db
            .delete(refreshTokens)
            .where(eq(refreshTokens.token, req.cookies.refreshToken));

        res.clearCookie(
            REFRESH_TOKEN_COOKIE.name,
            REFRESH_TOKEN_COOKIE.options,
        );

        res.sendStatus(204);
    },
};
