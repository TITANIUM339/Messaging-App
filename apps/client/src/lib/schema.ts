import { readKey, readPrivateKey } from "openpgp";
import * as z from "zod";
import api from "./api";

export const Login = z.object({
    username: z.string().nonempty().max(32),
    password: z.string().nonempty(),
});

export const AccessToken = z.object({
    accessToken: z.jwt(),
});

export const Username = z.object({ username: z.string().nonempty().max(32) });

export const FriendRequests = z.array(
    z.object({
        senderId: z.int(),
        senderUsername: z.string(),
        receiverId: z.int(),
        receiverUsername: z.string(),
    }),
);

export const User = z.object({
    id: z.int(),
    username: z.string(),
    passwordHash: z.string(),
    publicKey: z.string(),
    passphrase: z.string(),
});

export const FriendRequestId = z.object({
    senderId: z.coerce.number().pipe(z.int()),
    receiverId: z.coerce.number().pipe(z.int()),
});

export const Friends = z.array(
    z.object({
        id: z.int(),
        username: z.string(),
    }),
);

export const UserId = z.object({
    userId: z.coerce.number().pipe(z.int().min(1)),
});

export const PrivateKeyText = z.object({
    privateKeyText: z
        .string()
        .nonempty()
        .refine(async (value) => {
            // Make sure that the provided private key matches with the user's public key
            try {
                const privateKey = await readPrivateKey({ armoredKey: value });
                const publicKey = await readKey({
                    armoredKey: api.user!.publicKey,
                });

                if (!privateKey.getKeyID().equals(publicKey.getKeyID())) {
                    return false;
                }
            } catch {
                return false;
            }

            return true;
        }),
});

export const PrivateKeyFile = z.object({
    privateKeyFile: z
        .file()
        .mime("text/plain")
        .refine(async (value) => {
            try {
                const privateKey = await readPrivateKey({
                    armoredKey: await value.text(),
                });
                const publicKey = await readKey({
                    armoredKey: api.user!.publicKey,
                });

                if (!privateKey.getKeyID().equals(publicKey.getKeyID())) {
                    return false;
                }
            } catch {
                return false;
            }

            return true;
        }),
});
