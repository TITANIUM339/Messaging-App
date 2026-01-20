import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import * as z from "zod";
import db from "../db";
import { users } from "../db/schema";

const NewKey = z.object({ publicKey: z.string().nonempty() });

export default {
    async patch(req: Request, res: Response) {
        const user = req.user as typeof users.$inferSelect;
        const result = NewKey.safeParse(req.body);

        if (!result.success) {
            res.status(400).json(z.treeifyError(result.error));

            return;
        }

        await db
            .update(users)
            .set({
                publicKey: result.data.publicKey,
                passphrase: await new Promise((resolve, reject) =>
                    randomBytes(64, (err, buf) =>
                        err ? reject(err) : resolve(buf.toString("base64")),
                    ),
                ),
            })
            .where(eq(users.id, user.id));

        res.sendStatus(201);
    },
};
