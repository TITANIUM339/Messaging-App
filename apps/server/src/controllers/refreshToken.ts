import { REFRESH_TOKEN_COOKIE } from "@lib/constants";
import jwt from "@lib/jwt";
import { and, eq, notExists } from "drizzle-orm";
import type { Request, Response } from "express";
import db from "../db";
import { refreshTokens, users } from "../db/schema";

export default {
    async get(req: Request, res: Response) {
        const user = req.user as typeof users.$inferSelect;

        const [refreshToken, accessToken] = await Promise.all([
            jwt.sing({ id: user.id }, process.env.REFRESH_TOKEN_SECRET!, {
                expiresIn: "7d",
            }),
            jwt.sing({ id: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
                expiresIn: "10m",
            }),
        ]);

        const result = await db
            .update(refreshTokens)
            .set({
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            })
            .where(
                and(
                    eq(refreshTokens.token, req.cookies.refreshToken),
                    notExists(
                        db
                            .select()
                            .from(refreshTokens)
                            .where(eq(refreshTokens.token, refreshToken)),
                    ),
                ),
            );

        if (result.rowCount) {
            res.cookie(
                REFRESH_TOKEN_COOKIE.name,
                refreshToken,
                REFRESH_TOKEN_COOKIE.options,
            );
        }

        res.json({ accessToken });
    },
};
