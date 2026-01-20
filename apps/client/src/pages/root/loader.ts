/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";
import { decryptKey, readKey, readPrivateKey } from "openpgp";
import { redirect } from "react-router";

async function logout() {
    const errorResponse = await api.logout();

    if (errorResponse) {
        throw errorResponse;
    }

    return redirect("/login");
}

export default async function loader() {
    if (!api.isLoggedIn) {
        return redirect("/login");
    }

    try {
        const key = localStorage.getItem(`key-${api.user?.id}`);

        if (!key) {
            return await logout();
        }

        const privateKey = await readPrivateKey({ armoredKey: key });
        const publicKey = await readKey({ armoredKey: api.user!.publicKey });

        if (!privateKey.getKeyID().equals(publicKey.getKeyID())) {
            return await logout();
        }

        return await decryptKey({
            privateKey,
            passphrase: api.user?.passphrase,
        });
    } catch {
        return await logout();
    }
}
