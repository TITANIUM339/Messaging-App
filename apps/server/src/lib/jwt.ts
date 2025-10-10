import jwt from "jsonwebtoken";

export default {
    sing(
        payload: string | object | Buffer<ArrayBufferLike>,
        secret: jwt.Secret | jwt.PrivateKey,
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
};
