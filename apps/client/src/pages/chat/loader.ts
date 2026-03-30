/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";
import { decrypt, decryptKey, readMessage, readPrivateKey } from "openpgp";
import type { LoaderFunctionArgs } from "react-router";
import type { Message } from "../../types/type";

export default async function loader({ params }: LoaderFunctionArgs) {
    const [response1, response2] = await Promise.all([
        api.fetch(`/chats/${params.chatId}/messages`),
        api.fetch(`/chats/${params.chatId}`),
    ]);

    if (!response1.ok) {
        throw response1;
    }

    if (!response2.ok) {
        throw response2;
    }

    const messages = (await response1.json()) as Message[];

    const privateKey = await decryptKey({
        privateKey: await readPrivateKey({
            armoredKey: localStorage.getItem(`key-${api.user?.id}`)!,
        }),
        passphrase: api.user?.passphrase,
    });

    return {
        messages: await Promise.all(
            messages.map(async (message) => {
                return {
                    ...message,
                    content: (
                        await decrypt({
                            message: await readMessage({
                                armoredMessage: message.content,
                            }),
                            decryptionKeys: privateKey,
                        })
                    ).data as string,
                };
            }),
        ),
        chat: (await response2.json()) as unknown,
    };
}
