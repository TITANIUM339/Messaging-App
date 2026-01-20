import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import * as z from "zod";
import db from "../db";
import { users } from "../db/schema";

const User = z.object({
    username: z
        .string()
        .trim()
        .nonempty({ abort: true })
        .max(32, { abort: true })
        .refine(
            async (data) => {
                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.username, data));

                if (user) {
                    return false;
                }

                return true;
            },
            { error: "Username already exists" },
        ),
    password: z.string().nonempty(),
    publicKey: z.string().nonempty(),
});

export default {
    async post(req: Request, res: Response) {
        const result = await User.safeParseAsync(req.body);

        if (!result.success) {
            res.status(400).json(z.treeifyError(result.error));

            return;
        }

        const [passwordHash, passphrase] = await Promise.all([
            bcrypt.hash(result.data.password, 10),
            new Promise<string>((resolve, reject) =>
                randomBytes(64, (err, buf) =>
                    err ? reject(err) : resolve(buf.toString("base64")),
                ),
            ),
        ]);

        await db.insert(users).values({
            username: result.data.username,
            passwordHash,
            publicKey: result.data.publicKey,
            passphrase,
        });

        res.sendStatus(201);
    },
};
