/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";
import { Message } from "@lib/schema";
import { createMessage, encrypt, readKey } from "openpgp";
import type { ActionFunctionArgs } from "react-router";

export default async function action({ request, params }: ActionFunctionArgs) {
    const formData = await request.formData();

    const message = Message.parse(formData.get("message"));

    const response1 = await api.fetch(`/chats/${params.chatId}/members`);

    if (!response1.ok) {
        throw response1;
    }

    const members = (await response1.json()) as {
        id: number;
        username: string;
        publicKey: string;
    }[];

    const response2 = await api.fetch(`/chats/${params.chatId}/messages`, {
        method: request.method,
        body: JSON.stringify(
            await Promise.all(
                members.map(async (member) => ({
                    to: member.id,
                    content: (await encrypt({
                        message: await createMessage({ text: message }),
                        encryptionKeys: await readKey({
                            armoredKey: member.publicKey,
                        }),
                    })) as string,
                })),
            ),
        ),
    });

    if (!response2.ok) {
        throw response2;
    }
}
