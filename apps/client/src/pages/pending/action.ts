/* eslint-disable @typescript-eslint/only-throw-error */
import type { ActionFunctionArgs } from "react-router";
import api from "../../lib/api";
import { FriendRequestId } from "../../lib/schema";

export default async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    const result = FriendRequestId.parse({
        senderId: formData.get("senderId"),
        receiverId: formData.get("receiverId"),
    });

    const response = await api.fetch(
        `/friend-requests/${result.senderId}-${result.receiverId}`,
        { method: request.method },
    );

    if (!response.ok) {
        throw response;
    }
}
