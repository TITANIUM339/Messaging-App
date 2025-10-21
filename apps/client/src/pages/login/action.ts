/* eslint-disable @typescript-eslint/only-throw-error */
import { redirect, type ActionFunctionArgs } from "react-router";
import api from "../../lib/api";
import * as z from "zod";

const Login = z.object({
    username: z.string(),
    password: z.string(),
});

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

    if (response?.status === 401) {
        return response;
    }

    if (response) {
        throw response;
    }

    return redirect("/");
}
