/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";
import { Message } from "@lib/schema";
import type { ActionFunctionArgs } from "react-router";

export default async function action({ request, params }: ActionFunctionArgs) {
    const formData = await request.formData();

    const message = Message.parse(formData.get("message"));

    const response = await api.fetch(`/chats/${params.chatId}/members`);

    if (!response.ok) {
        throw response;
    }

    const members = (await response.json()) as {
        id: number;
        username: string;
        publicKey: string;
    }[];

    const response2 = await api.fetch(`/chats/${params.chatId}/messages`, {
        method: request.method,
        body: JSON.stringify(
            members.map((member) => ({ to: member.id, content: message })),
        ),
    });

    if (!response2.ok) {
        throw response;
    }
}
