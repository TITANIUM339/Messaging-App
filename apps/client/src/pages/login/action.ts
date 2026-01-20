/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";
import { Login } from "@lib/schema";
import { readKey, readPrivateKey } from "openpgp";
import { redirect, type ActionFunctionArgs } from "react-router";

export default async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    const result = Login.safeParse({
        username: formData.get("username"),
        password: formData.get("password"),
    });

    if (!result.success) {
        return "invalid_form";
    }

    const response = await api.login(
        result.data.username,
        result.data.password,
    );

    if (response?.status === 401 || response?.status === 400) {
        return "invalid_form";
    }

    if (response) {
        throw response;
    }

    try {
        const key = localStorage.getItem(`key-${api.user?.id}`);

        if (!key) {
            return "no_key";
        }

        const privateKey = await readPrivateKey({ armoredKey: key });
        const publicKey = await readKey({ armoredKey: api.user!.publicKey });

        if (!privateKey.getKeyID().equals(publicKey.getKeyID())) {
            return "no_key";
        }
    } catch {
        return "no_key";
    }

    return redirect("/");
}
