import * as z from "zod";

const AccessToken = z.object({
    accessToken: z.jwt(),
});

class Api {
    #apiURL;
    #accessToken;

    constructor(apiURL: string, accessToken: null | string) {
        this.#apiURL = apiURL;
        this.#accessToken = accessToken;
    }

    get isLoggedIn() {
        return Boolean(this.#accessToken);
    }

    async fetch(
        url: string,
        init?: RequestInit,
        retry = true,
    ): Promise<Response> {
        const response = await fetch(`${this.#apiURL}${url}`, {
            headers: {
                "Content-Type": "application/json",
                ...(this.#accessToken
                    ? { Authorization: `Bearer ${this.#accessToken}` }
                    : undefined),
            },
            credentials: "include",
            mode: "cors",
            ...init,
        });

        if (response.status === 401 && retry) {
            const response = await this.fetch(
                "/refresh-token",
                undefined,
                false,
            );

            if (response.ok) {
                const { accessToken } = AccessToken.parse(
                    await response.json(),
                );

                this.#accessToken = accessToken;

                return await this.fetch(url, init, false);
            }

            this.#accessToken = null;
        }

        return response;
    }

    async login(username: string, password: string) {
        const response = await this.fetch(
            "/login",
            {
                method: "post",
                body: JSON.stringify({ username, password }),
            },
            false,
        );

        if (!response.ok) {
            return response;
        }

        const { accessToken } = AccessToken.parse(await response.json());

        this.#accessToken = accessToken;
    }

    async logout() {
        const response = await this.fetch("/logout", { method: "post" });

        if (!response.ok) {
            return response;
        }

        this.#accessToken = null;
    }
}

const apiURL = import.meta.env.VITE_API_URL as string;

const response = await fetch(`${apiURL}/refresh-token`, {
    headers: {
        "Content-Type": "application/json",
    },
    credentials: "include",
    mode: "cors",
});

const accessToken = response.ok
    ? AccessToken.parse(await response.json()).accessToken
    : null;

export default new Api(apiURL, accessToken);
