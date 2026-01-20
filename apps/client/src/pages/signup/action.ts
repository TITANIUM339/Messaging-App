/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";
import { Login } from "@lib/schema";
import { encryptKey, generateKey, readPrivateKey } from "openpgp";
import type { ActionFunctionArgs } from "react-router";
import * as z from "zod";

export default async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    const result = Login.safeParse({
        username: formData.get("username"),
        password: formData.get("password"),
    });

    if (!result.success) {
        return { success: false, error: z.treeifyError(result.error) };
    }

    const pgp = await generateKey({
        userIDs: [{ name: result.data.username }],
    });

    const response = await api.fetch(
        "/signup",
        {
            method: request.method,
            body: JSON.stringify({ ...result.data, publicKey: pgp.publicKey }),
        },
        false,
    );

    if (response.status === 400) {
        return { success: false, error: (await response.json()) as unknown };
    }

    if (!response.ok) {
        throw response;
    }

    const [errorResponse, privateKey] = await Promise.all([
        api.login(result.data.username, result.data.password),
        readPrivateKey({ armoredKey: pgp.privateKey }),
    ]);

    if (errorResponse) {
        throw errorResponse;
    }

    const encryptedPrivateKey = (
        await encryptKey({
            privateKey,
            passphrase: api.user?.passphrase,
        })
    ).armor();

    localStorage.setItem(`key-${api.user?.id}`, encryptedPrivateKey);

    return { success: true, privateKey: encryptedPrivateKey };
}
