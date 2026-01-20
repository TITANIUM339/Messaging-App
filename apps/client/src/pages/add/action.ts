/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";
import { Username } from "@lib/schema";
import type { ActionFunctionArgs } from "react-router";
import { treeifyError } from "zod";

export default async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    const result = Username.safeParse({ username: formData.get("username") });

    if (!result.success) {
        return { success: false, error: treeifyError(result.error) };
    }

    const response = await api.fetch("/friend-requests", {
        method: request.method,
        body: JSON.stringify(result.data),
    });

    if (response.status === 400) {
        return { success: false, error: (await response.json()) as unknown };
    }

    if (!response.ok) {
        throw response;
    }

    return { success: true };
}
