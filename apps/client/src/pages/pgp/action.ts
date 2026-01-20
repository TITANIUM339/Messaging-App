/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";
import { PrivateKeyFile, PrivateKeyText } from "@lib/schema";
import { encryptKey, generateKey, readPrivateKey } from "openpgp";
import { redirect, type ActionFunctionArgs } from "react-router";
import * as z from "zod";

export default async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    switch (request.method) {
        case "PUT": {
            const format = formData.get("format");

            let result;

            switch (format) {
                case "text":
                    result = await PrivateKeyText.safeParseAsync({
                        privateKeyText: formData.get("privateKeyText"),
                    });

                    if (!result.success) {
                        return z.treeifyError(result.error);
                    }

                    localStorage.setItem(
                        `key-${api.user?.id}`,
                        result.data.privateKeyText,
                    );

                    return redirect("/");

                case "file":
                    result = await PrivateKeyFile.safeParseAsync({
                        privateKeyFile: formData.get("privateKeyFile"),
                    });

                    if (!result.success) {
                        return z.treeifyError(result.error);
                    }

                    localStorage.setItem(
                        `key-${api.user?.id}`,
                        await result.data.privateKeyFile.text(),
                    );

                    return redirect("/");

                default:
                    throw new Response(null, {
                        status: 400,
                        statusText: "Bad Request",
                    });
            }
        }

        case "PATCH": {
            const pgp = await generateKey({
                userIDs: [{ name: api.user?.username }],
            });

            const response = await api.fetch("/pgp", {
                method: request.method,
                body: JSON.stringify({ publicKey: pgp.publicKey }),
            });

            if (!response.ok) {
                throw response;
            }

            const [privateKey] = await Promise.all([
                readPrivateKey({ armoredKey: pgp.privateKey }),
                // Get the updated user data to avoid using old passphrase for encryption
                api.refreshToken(),
            ]);

            const encryptedPrivateKey = (
                await encryptKey({
                    privateKey,
                    passphrase: api.user?.passphrase,
                })
            ).armor();

            localStorage.setItem(`key-${api.user?.id}`, encryptedPrivateKey);

            return encryptedPrivateKey;
        }

        default:
            throw new Response(null, { status: 404, statusText: "Not Found" });
    }
}
