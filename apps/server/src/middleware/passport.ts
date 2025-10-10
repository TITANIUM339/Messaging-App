import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import db from "../db";
import { refreshTokens, users } from "../db/schema";

export const localStrategy = new LocalStrategy(
    async (username, password, done) => {
        try {
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.username, username));

            if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
                done(null, false);

                return;
            }

            done(null, user);
        } catch (error) {
            done(error);
        }
    },
);

export const refreshTokenStrategy = new JwtStrategy(
    {
        jwtFromRequest(req) {
            return req?.cookies.refreshToken || null;
        },
        secretOrKey: process.env.REFRESH_TOKEN_SECRET!,
        passReqToCallback: true,
    },
    async (req, decoded, done) => {
        try {
            const [[user], [token]] = await Promise.all([
                db.select().from(users).where(eq(users.id, decoded.id)),
                db
                    .select()
                    .from(refreshTokens)
                    .where(eq(refreshTokens.token, req?.cookies.refreshToken)),
            ]);

            if (user && !token) {
                // Detected token reuse
                await db
                    .delete(refreshTokens)
                    .where(eq(refreshTokens.userId, user.id));
            } else if (user && token) {
                done(null, user);

                return;
            }
        } catch (error) {
            done(error);
        }

        done(null, false);
    },
);

export const accessTokenStrategy = new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.ACCESS_TOKEN_SECRET!,
    },
    async (decoded, done) => {
        try {
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.id, decoded.id));

            if (user) {
                done(null, user);

                return;
            }
        } catch (error) {
            done(error);
        }

        done(null, false);
    },
);
