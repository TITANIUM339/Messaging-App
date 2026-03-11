/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";
import type { LoaderFunctionArgs } from "react-router";

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

    return {
        messages: (await response1.json()) as unknown,
        chat: (await response2.json()) as unknown,
    };
}
