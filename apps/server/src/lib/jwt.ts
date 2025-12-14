import jwt from "jsonwebtoken";

export default {
    sing(
        payload: string | object | Buffer<ArrayBufferLike>,
        secret: jwt.Secret,
        options: jwt.SignOptions,
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign(payload, secret, options, (error, token) => {
                if (error || !token) {
                    reject(error ? error : new Error("Unknown error"));

                    return;
                }

                resolve(token);
            });
        });
    },
    verify(token: string, secret: jwt.Secret, options?: jwt.VerifyOptions) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, options, (error, decoded) => {
                if (error || !decoded) {
                    reject(error ? error : new Error("Unknown error"));

                    return;
                }

                resolve(decoded);
            });
        });
    },
};
