/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";
import isSameKeyPair from "@lib/isSameKeyPair";
import type { LoaderFunction, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export default function loaderAuthGuard(loader: LoaderFunction) {
    return async (args: LoaderFunctionArgs) => {
        if (!api.isLoggedIn) {
            throw redirect("/login");
        }

        const privateKey = localStorage.getItem(`key-${api.user?.id}`);

        if (
            !privateKey ||
            !api.user?.publicKey ||
            !(await isSameKeyPair(privateKey, api.user.publicKey))
        ) {
            const errorResponse = await api.logout();

            if (errorResponse) {
                throw errorResponse;
            }

            throw redirect("/login");
        }

        return await loader(args);
    };
}
