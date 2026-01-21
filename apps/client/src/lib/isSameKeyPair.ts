import { readKey, readPrivateKey } from "openpgp";

export default async function isSameKeyPair(
    armoredPrivateKey: string,
    armoredPublicKey: string,
) {
    try {
        const privateKey = await readPrivateKey({
            armoredKey: armoredPrivateKey,
        });
        const publicKey = await readKey({ armoredKey: armoredPublicKey });

        if (!privateKey.getKeyID().equals(publicKey.getKeyID())) {
            return false;
        }
    } catch {
        return false;
    }

    return true;
}
