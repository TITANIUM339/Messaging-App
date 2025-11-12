import api from "../../lib/api";
import { FriendRequests } from "../../lib/schema";

export default async function loader() {
    const response = await api.fetch("/friend-requests");

    return FriendRequests.parse(await response.json());
}
