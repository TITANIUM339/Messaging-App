/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";

export default async function loader() {
    const response = await api.fetch("/chats");

    if (!response.ok) {
        throw response;
    }

    return (await response.json()) as unknown;
}
