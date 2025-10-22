import bcrypt from "bcrypt";
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
                try {
                    const [user] = await db
                        .select()
                        .from(users)
                        .where(eq(users.username, data));

                    if (user) {
                        return false;
                    }
                } catch {
                    return false;
                }

                return true;
            },
            { error: "Username already exists" },
        ),
    password: z.string().nonempty(),
});

export default {
    async post(req: Request, res: Response) {
        const result = await User.safeParseAsync(req.body);

        if (!result.success) {
            res.status(400).json(z.treeifyError(result.error));

            return;
        }

        await db.insert(users).values({
            username: result.data.username,
            passwordHash: await bcrypt.hash(result.data.password, 10),
        });

        res.sendStatus(201);
    },
};
