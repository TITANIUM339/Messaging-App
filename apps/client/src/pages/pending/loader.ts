/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";
import { FriendRequests } from "@lib/schema";

export default async function loader() {
    const response = await api.fetch("/friend-requests");

    if (!response.ok) {
        throw response;
    }

    return FriendRequests.parse(await response.json());
}
