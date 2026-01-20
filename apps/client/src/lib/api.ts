import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import { AccessToken, User } from "./schema";

class Api {
    #apiURL;
    #accessToken;
    #socket;

    constructor(apiURL: string, accessToken: null | string) {
        this.#apiURL = apiURL;
        this.#accessToken = accessToken;
        this.#socket = io(apiURL, { autoConnect: false });

        if (accessToken) {
            this.#socket.auth = { token: accessToken };
        }
    }

    get socket() {
        return this.#socket;
    }

    get isLoggedIn() {
        return Boolean(this.#accessToken);
    }

    get user() {
        return this.#accessToken
            ? User.parse(jwtDecode(this.#accessToken))
            : null;
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

                this.#socket.auth = { token: accessToken };

                return await this.fetch(url, init, false);
            }

            this.#accessToken = null;

            this.#socket.auth = {};
        }

        return response;
    }

    async refreshToken() {
        const response = await this.fetch("/refresh-token", undefined, false);

        if (!response.ok) {
            this.#accessToken = null;

            this.#socket.auth = {};

            throw new Error("Failed to refresh token");
        }

        const { accessToken } = AccessToken.parse(await response.json());

        this.#accessToken = accessToken;

        this.#socket.auth = { token: accessToken };
    }

    async login(username: string, password: string) {
        const response = await this.fetch(
            "/login",
            {
                method: "POST",
                body: JSON.stringify({ username, password }),
            },
            false,
        );

        if (!response.ok) {
            return response;
        }

        const { accessToken } = AccessToken.parse(await response.json());

        this.#accessToken = accessToken;

        this.#socket.auth = { token: accessToken };
    }

    async logout() {
        const response = await this.fetch("/logout", { method: "POST" });

        this.#accessToken = null;

        this.#socket.auth = {};

        this.#socket.disconnect();

        if (!response.ok) {
            return response;
        }
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
