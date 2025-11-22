/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";
import { UserId } from "@lib/schema";
import type { ActionFunctionArgs } from "react-router";

export default async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    const result = UserId.parse({
        userId: formData.get("userId"),
    });

    const response = await api.fetch(`/friends/${result.userId}`, {
        method: request.method,
    });

    if (!response.ok) {
        throw response;
    }
}
