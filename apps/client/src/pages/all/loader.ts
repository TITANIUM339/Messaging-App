/* eslint-disable @typescript-eslint/only-throw-error */
import api from "@lib/api";
import { Friends } from "@lib/schema";

export default async function loader() {
    const response = await api.fetch("/friends");

    if (!response.ok) {
        throw response;
    }

    return Friends.parse(await response.json());
}
