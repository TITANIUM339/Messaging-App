/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";
import { Login } from "@lib/schema";
import { redirect, type ActionFunctionArgs } from "react-router";

export default async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    const result = Login.safeParse({
        username: formData.get("username"),
        password: formData.get("password"),
    });

    if (!result.success) {
        return result.error;
    }

    const response = await api.login(
        result.data.username,
        result.data.password,
    );

    if (response?.status === 401 || response?.status == 400) {
        return response;
    }

    if (response) {
        throw response;
    }

    return redirect("/");
}
