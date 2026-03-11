import Button from "@components/Button";
import { ConnectedFriendsContext } from "@components/ConnectedFriendsContext";
import api from "@lib/api";
import type { Friends } from "@lib/schema";
import { useEffect, useRef, useState } from "react";
import { BsFillPeopleFill, BsPlusLg } from "react-icons/bs";
import { Outlet, useLoaderData, useNavigate } from "react-router";
import { twMerge } from "tailwind-merge";
import type * as z from "zod";

export default function Root() {
    const navigate = useNavigate();

    const data = useLoaderData<{
        privateChats: { id: number; userId: number; username: string }[];
        groupChats: {
            id: number;
            title: string;
            icon?: string;
            owner: number;
        }[];
    }>();

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
            <nav className="grid grid-rows-[60px_1fr] bg-zinc-900 p-2">
                <ul className="border-b border-zinc-700 pb-2">
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
                <div className="mt-2">
                    <h1 className="text-lg font-medium text-zinc-300">Chats</h1>
                    <section className="p-2">
                        <h2 className="text-zinc-400">Private</h2>
                        <ul className="mt-1 flex flex-col gap-1">
                            {data.privateChats.map((chat) => (
                                <li key={chat.id}>
                                    <Button
                                        className={({ isActive }) => {
                                            const baseStyles =
                                                "group flex w-full items-center gap-2";

                                            if (isActive) {
                                                return twMerge(
                                                    baseStyles,
                                                    "bg-zinc-600",
                                                );
                                            }

                                            return baseStyles;
                                        }}
                                        navLink
                                        to={`/chats/${chat.id}`}
                                        variant="secondary"
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <div className="relative">
                                                    <div className="relative h-8 w-8 overflow-hidden rounded-full">
                                                        <img
                                                            className="object-cover"
                                                            src={`https://api.dicebear.com/9.x/identicon/svg?seed=${chat.username}`}
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div
                                                        className={twMerge(
                                                            "absolute right-0 bottom-0 size-4 translate-[3px] rounded-full border-3 border-zinc-900 bg-zinc-500 group-hover:border-zinc-700",
                                                            isActive &&
                                                                "border-zinc-600",
                                                            connectedFriends.some(
                                                                (
                                                                    connectedFriend,
                                                                ) =>
                                                                    connectedFriend.id ===
                                                                    chat.userId,
                                                            ) && "bg-green-500",
                                                        )}
                                                    ></div>
                                                </div>
                                                <section className="flex-1 truncate">
                                                    <h2 className="font-medium text-zinc-400">
                                                        {chat.username}
                                                    </h2>
                                                </section>
                                            </>
                                        )}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </section>
                    <section className="p-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-zinc-400">Group</h2>
                            <Button variant="secondary">
                                <BsPlusLg />
                            </Button>
                        </div>
                        <ul className="mt-1 flex flex-col gap-1">
                            {data.groupChats.map((chat) => (
                                <li key={chat.id}>
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
                                        to={`/chats/${chat.id}`}
                                        variant="secondary"
                                    >
                                        <div className="h-8 w-8 overflow-hidden rounded-full">
                                            <img
                                                className="object-cover"
                                                src={`https://api.dicebear.com/9.x/identicon/svg?seed=${chat.title}`}
                                                alt="Avatar"
                                            />
                                        </div>
                                        <section className="flex-1 truncate">
                                            <h2 className="font-medium text-zinc-400">
                                                {chat.title}
                                            </h2>
                                        </section>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </section>
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
