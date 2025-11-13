/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";
import { Login } from "@lib/schema";
import { redirect, type ActionFunctionArgs } from "react-router";
import * as z from "zod";

export default async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    const result = Login.safeParse({
        username: formData.get("username"),
        password: formData.get("password"),
    });

    if (!result.success) {
        return z.treeifyError(result.error);
    }

    const response = await api.fetch(
        "/signup",
        {
            method: "post",
            body: JSON.stringify(result.data),
        },
        false,
    );

    if (response.status === 400) {
        return (await response.json()) as unknown;
    }

    if (!response.ok) {
        throw response;
    }

    await api.login(result.data.username, result.data.password);

    return redirect("/");
}
