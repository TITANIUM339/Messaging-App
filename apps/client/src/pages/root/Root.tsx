import Button from "@components/Button";
import { ConnectedFriendsContext } from "@components/ConnectedFriendsContext";
import api from "@lib/api";
import type { Friends } from "@lib/schema";
import { useEffect, useRef, useState } from "react";
import { BsFillPeopleFill, BsPlusLg } from "react-icons/bs";
import { Outlet, useNavigate } from "react-router";
import { twMerge } from "tailwind-merge";
import type * as z from "zod";

export default function Root() {
    const navigate = useNavigate();

    const timeoutRef = useRef<number | null>(null);

    const [connectedFriends, setConnectedFriends] = useState<
        z.infer<typeof Friends>
    >([]);

    useEffect(() => {
        async function onConnectError(error: Error) {
            if (typeof timeoutRef.current === "number") {
                clearTimeout(timeoutRef.current);
            }

            switch (error.message) {
                case "Unauthorized":
                    try {
                        await api.refreshToken();

                        timeoutRef.current = setTimeout(
                            () => api.socket.connect(),
                            3000,
                        );
                    } catch (error) {
                        console.error(error);

                        await navigate("/login");
                    }

                    break;

                default:
                    console.error(error);

                    timeoutRef.current = setTimeout(
                        () => api.socket.connect(),
                        3000,
                    );

                    break;
            }
        }
        function onConnectedFriends(connectedFriends: z.infer<typeof Friends>) {
            setConnectedFriends(connectedFriends);
        }
        function onFriendConnected(
            connectedFriend: z.infer<typeof Friends>[number],
        ) {
            setConnectedFriends((prev) => [...prev, connectedFriend]);
        }
        function onFriendDisconnected(
            disconnectedFriend: z.infer<typeof Friends>[number],
        ) {
            setConnectedFriends((prev) =>
                prev.filter((friend) => friend.id !== disconnectedFriend.id),
            );
        }

        api.socket.on("connect_error", onConnectError);
        api.socket.on("connected_friends", onConnectedFriends);
        api.socket.on("friend_connected", onFriendConnected);
        api.socket.on("friend_disconnected", onFriendDisconnected);

        api.socket.connect();

        return () => {
            api.socket.off("connect_error", onConnectError);
            api.socket.off("connected_friends", onConnectedFriends);
            api.socket.off("friend_connected", onFriendConnected);
            api.socket.off("friend_disconnected", onFriendDisconnected);

            api.socket.disconnect();
        };
    }, [navigate]);

    return (
        <div className="grid min-h-dvh grid-cols-[200px_1fr] text-zinc-100">
            <nav className="bg-zinc-900 p-2">
                <ul>
                    <li>
                        <Button
                            className={({ isActive }) => {
                                const baseStyles =
                                    "flex w-full items-center gap-2";

                                if (isActive) {
                                    return twMerge(baseStyles, "bg-zinc-600");
                                }

                                return baseStyles;
                            }}
                            navLink
                            to="/friends"
                            variant="secondary"
                        >
                            <BsFillPeopleFill /> Friends
                        </Button>
                    </li>
                </ul>
                <hr className="mt-2 text-zinc-700" />
                <div className="mt-2">
                    <section className="flex items-center justify-between p-2">
                        <h1 className="text-zinc-400">Conversations</h1>
                        <Button variant="secondary">
                            <BsPlusLg />
                        </Button>
                    </section>
                    <ul className="flex flex-col gap-1">
                        {new Array(9).fill(null).map((_, i) => (
                            <li key={i}>
                                <Button
                                    className={({ isActive }) => {
                                        const baseStyles =
                                            "flex w-full items-center gap-2";

                                        if (isActive) {
                                            return twMerge(
                                                baseStyles,
                                                "bg-zinc-600",
                                            );
                                        }

                                        return baseStyles;
                                    }}
                                    navLink
                                    to="/conversations/1"
                                    variant="secondary"
                                >
                                    <div className="h-8 w-8 overflow-hidden rounded-full">
                                        <img
                                            className="object-cover"
                                            src="https://picsum.photos/200/300"
                                            alt=""
                                        />
                                    </div>
                                    <section className="flex-1 truncate">
                                        <h2 className="font-medium text-zinc-400">
                                            Friend
                                        </h2>
                                    </section>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
            <main className="bg-zinc-800">
                <ConnectedFriendsContext value={connectedFriends}>
                    <Outlet />
                </ConnectedFriendsContext>
            </main>
        </div>
    );
}
