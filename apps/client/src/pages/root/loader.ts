/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";
import { decryptKey, readPrivateKey } from "openpgp";

export default async function loader() {
    const privateKey = localStorage.getItem(`key-${api.user?.id}`);

    const [response, decryptedPrivateKey] = await Promise.all([
        api.fetch("/chats"),
        decryptKey({
            privateKey: await readPrivateKey({
                armoredKey: privateKey!,
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
