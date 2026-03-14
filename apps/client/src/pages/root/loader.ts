/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";
import isSameKeyPair from "@lib/isSameKeyPair";
import { decryptKey, readPrivateKey } from "openpgp";
import { redirect } from "react-router";

export default async function loader() {
    if (!api.isLoggedIn) {
        return redirect("/login");
    }

    const privateKey = localStorage.getItem(`key-${api.user?.id}`);

    if (
        !privateKey ||
        !api.user?.publicKey ||
        !(await isSameKeyPair(privateKey, api.user.publicKey))
    ) {
        const errorResponse = await api.logout();

        if (errorResponse) {
            throw errorResponse;
        }

        return redirect("/login");
    }

    const [response, decryptedPrivateKey] = await Promise.all([
        api.fetch("/chats"),
        decryptKey({
            privateKey: await readPrivateKey({
                armoredKey: privateKey,
            }),
            passphrase: api.user?.passphrase,
        }),
    ]);

    if (!response.ok) {
        throw response;
    }

    api.privateKey = decryptedPrivateKey;

    return (await response.json()) as unknown;
}
