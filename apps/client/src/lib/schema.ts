import * as z from "zod";

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
});

export const FriendRequestId = z.object({
    senderId: z.coerce.number().pipe(z.int()),
    receiverId: z.coerce.number().pipe(z.int()),
});
