export const REFRESH_TOKEN_COOKIE = Object.freeze({
    name: "refreshToken",
    options: Object.freeze({
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    }),
});
