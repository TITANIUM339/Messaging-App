import * as z from "zod";

export const Login = z.object({
    username: z.string().nonempty().max(32),
    password: z.string().nonempty(),
});

export const AccessToken = z.object({
    accessToken: z.jwt(),
});

export const Username = z.object({ username: z.string().nonempty().max(32) });
